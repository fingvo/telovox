/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Bi-directional speech-to-speech pipeline coordinating STT, LLM,
 *              dynamic tool calling, TTS voice synthesis, and database logging.
 * ============================================================================
 */

import WebSocket from 'ws';
import { AgentService } from '../services/agentService';
import { ToolService } from '../services/toolService';
import { STTService } from '../services/sttService';
import { LLMService, ChatMessage } from '../services/llmService';
import { TTSService } from '../services/ttsService';
import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { AudioFrameMessage } from '../types/telephony';

export class CallPipeline {
  private ws: WebSocket;
  private callId: string;
  private agentId: string;
  private stt: STTService | null = null;
  private llm: LLMService;
  private tts: TTSService;
  private chatHistory: ChatMessage[] = [];
  private isProcessing = false;
  private startTime: number;

  constructor(ws: WebSocket, callId: string, agentId: string) {
    this.ws = ws;
    this.callId = callId || `call-${uuidv4()}`;
    this.agentId = agentId;
    this.llm = new LLMService();
    this.tts = new TTSService();
    this.startTime = Date.now();
  }

  /**
   * Initializes call session: loads agent profile from MySQL and delivers initial greeting.
   */
  public async initialize() {
    console.log(`[Telovox Pipeline] Initializing call session: ${this.callId} for Agent: ${this.agentId}`);

    // Record call start in MySQL
    await this.recordCallStart();

    // Fetch Agent configuration and tools from MySQL
    const { agent, tools } = await AgentService.getAgentById(this.agentId);
    if (!agent) {
      console.error(`[Telovox Pipeline] Agent not found: ${this.agentId}`);
      this.ws.close();
      return;
    }

    // Set initial system prompt
    this.chatHistory.push({
      role: 'system',
      content: agent.system_prompt,
    });

    // Initialize real-time STT listener
    this.stt = new STTService(process.env.DEEPGRAM_API_KEY || '', {
      onTranscript: async (text: string, isFinal: boolean) => {
        if (isFinal) {
          await this.handleUserSpeech(text, tools, agent.voice_id, agent.voice_provider);
        }
      },
      onError: (err) => {
        console.error('[Telovox Pipeline] STT Error:', err.message);
      },
    });
    this.stt.connect();

    // Deliver Agent's first greeting message
    if (agent.first_message) {
      await this.speakAndBroadcast(agent.first_message, agent.voice_id, agent.voice_provider);
      this.chatHistory.push({
        role: 'assistant',
        content: agent.first_message,
      });
      await this.saveTranscript('agent', agent.first_message, 0);
    }
  }

  /**
   * Handles incoming binary audio frames or control messages from client / Erlang gateway.
   */
  public async handleMessage(data: WebSocket.RawData, isBinary: boolean) {
    if (isBinary) {
      // Direct raw audio buffer (PCM/linear16 16kHz) relayed to STT
      if (this.stt) {
        this.stt.sendAudioChunk(data as Buffer);
      }
    } else {
      // JSON Control message (e.g. text input simulation or hang up)
      try {
        const msg: AudioFrameMessage = JSON.parse(data.toString());
        if (msg.event === 'text' && msg.text) {
          const { agent, tools } = await AgentService.getAgentById(this.agentId);
          if (agent) {
            await this.handleUserSpeech(msg.text, tools, agent.voice_id, agent.voice_provider);
          }
        } else if (msg.event === 'stop') {
          await this.terminate();
        }
      } catch (err: unknown) {
        console.error('[Telovox Pipeline] Error parsing control message:', err);
      }
    }
  }

  /**
   * Orchestrates the reasoning and response cycle when user speech is finalized.
   */
  private async handleUserSpeech(userText: string, tools: any[], voiceId: string, voiceProvider: string) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const turnStart = Date.now();
    console.log(`[Telovox Pipeline] User: "${userText}"`);

    // 1. Broadcast user transcript to client & record in DB
    this.broadcast({
      event: 'user_transcript',
      call_id: this.callId,
      text: userText,
    });
    await this.saveTranscript('user', userText, 0);

    // 2. Add to conversation history
    this.chatHistory.push({
      role: 'user',
      content: userText,
    });

    try {
      // 3. Stream response from LLM
      const stream = this.llm.streamDialogue(this.chatHistory, tools);

      for await (const chunk of stream) {
        if (chunk.type === 'tool_call' && chunk.toolCall) {
          // Dynamic Tool Execution
          const toolName = chunk.toolCall.name;
          const matchedTool = tools.find((t) => t.name === toolName);

          this.broadcast({
            event: 'tool_call',
            call_id: this.callId,
            tool_name: toolName,
            tool_args: chunk.toolCall.args,
          });

          if (matchedTool) {
            const toolResult = await ToolService.executeToolWebhook(matchedTool, chunk.toolCall.args);
            this.chatHistory.push({
              role: 'tool',
              name: toolName,
              content: JSON.stringify(toolResult.data || toolResult),
            });
          }
        } else if (chunk.type === 'text') {
          // Stream voice chunk
          const latency = Date.now() - turnStart;
          await this.speakAndBroadcast(chunk.content, voiceId, voiceProvider);
          this.chatHistory.push({
            role: 'assistant',
            content: chunk.content,
          });
          await this.saveTranscript('agent', chunk.content, latency);
        }
      }
    } catch (err: unknown) {
      console.error('[Telovox Pipeline] Reasoning error:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Synthesizes audio and sends base64/binary frames to caller.
   */
  private async speakAndBroadcast(text: string, voiceId: string, provider: string) {
    console.log(`[Telovox Pipeline] Agent: "${text}"`);

    // Broadcast text event for studio UI live transcript
    this.broadcast({
      event: 'agent_response',
      call_id: this.callId,
      text,
    });

    // Synthesize real voice
    const audioBuffer = await this.tts.synthesize(text, voiceId, provider);
    if (audioBuffer && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioBuffer);
    }
  }

  /**
   * Terminates active call, cleans up STT socket, and logs duration in MySQL.
   */
  public async terminate() {
    if (this.stt) {
      this.stt.disconnect();
      this.stt = null;
    }

    const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);

    await pool.query(
      `UPDATE \`call_logs\` 
       SET \`status\` = 'completed', \`duration_seconds\` = ?, \`ended_at\` = CURRENT_TIMESTAMP 
       WHERE \`id\` = ?`,
      [durationSeconds, this.callId]
    );

    console.log(`[Telovox Pipeline] Call completed: ${this.callId} (${durationSeconds}s)`);
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  private broadcast(payload: Record<string, unknown>) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private async recordCallStart() {
    await pool.query(
      `INSERT INTO \`call_logs\` (
        \`id\`, \`call_sid\`, \`agent_id\`, \`direction\`, \`caller_number\`, \`recipient_number\`, \`status\`
      ) VALUES (?, ?, ?, 'inbound', '+1-Simulator', '+1-Telovox', 'in_progress')
      ON DUPLICATE KEY UPDATE \`status\` = 'in_progress'`,
      [this.callId, `sid-${this.callId}`, this.agentId]
    );
  }

  private async saveTranscript(speaker: 'user' | 'agent', text: string, latencyMs: number) {
    try {
      await pool.query(
        `INSERT INTO \`call_transcripts\` (\`call_id\`, \`speaker\`, \`text\`, \`latency_ms\`)
         VALUES (?, ?, ?, ?)`,
        [this.callId, speaker, text, latencyMs]
      );
    } catch (err: unknown) {
      console.error('[Telovox Pipeline] Error saving transcript to MySQL:', err);
    }
  }
}
