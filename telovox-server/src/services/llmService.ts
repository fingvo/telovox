/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Low-latency streaming LLM reasoning service with tool calling.
 * ============================================================================
 */

import { AgentTool } from '../types/telephony';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export class LLMService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey?: string, model = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = process.env.LLM_MODEL || model;
    this.baseUrl = process.env.LLM_BASE_URL || baseUrl;
  }

  /**
   * Generates a streaming response for dialogue turns.
   * Yields partial sentence chunks as soon as punctuation (., ?, !) is hit,
   * allowing the Text-to-Speech engine to synthesize voice immediately.
   */
  public async *streamDialogue(
    messages: ChatMessage[],
    tools: AgentTool[] = []
  ): AsyncGenerator<{ type: 'text' | 'tool_call'; content: string; toolCall?: { name: string; args: Record<string, unknown> } }> {
    if (!this.apiKey) {
      yield {
        type: 'text',
        content: 'I understand. How else can I assist you with your request today?',
      };
      return;
    }

    const formattedTools = tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters_schema,
      },
    }));

    const payload: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: 0.7,
      stream: true,
    };

    if (formattedTools.length > 0) {
      payload.tools = formattedTools;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      throw new Error(`[Telovox LLM] API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentSentence = '';

    let toolCallName = '';
    let toolCallArgsRaw = '';
    let isToolCalling = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        if (trimmed === 'data: [DONE]') continue;

        try {
          const json = JSON.parse(trimmed.replace('data: ', ''));
          const delta = json.choices?.[0]?.delta;

          // Check for tool call
          if (delta?.tool_calls && delta.tool_calls.length > 0) {
            isToolCalling = true;
            const tc = delta.tool_calls[0];
            if (tc.function?.name) toolCallName += tc.function.name;
            if (tc.function?.arguments) toolCallArgsRaw += tc.function.arguments;
          }

          // Check for regular conversational text
          if (delta?.content) {
            const token = delta.content;
            currentSentence += token;

            // Trigger sentence yield on punctuation boundaries for fast TTS synthesis
            if (/[.!?]\s*$/.test(token) && currentSentence.trim().length > 15) {
              yield { type: 'text', content: currentSentence.trim() };
              currentSentence = '';
            }
          }
        } catch {
          // Ignore parsing issues for partial chunks
        }
      }
    }

    // Flush any remaining text in sentence buffer
    if (currentSentence.trim().length > 0) {
      yield { type: 'text', content: currentSentence.trim() };
    }

    // If a tool call was formed, yield it
    if (isToolCalling && toolCallName) {
      try {
        const parsedArgs = toolCallArgsRaw ? JSON.parse(toolCallArgsRaw) : {};
        yield {
          type: 'tool_call',
          content: `Executing tool: ${toolCallName}`,
          toolCall: { name: toolCallName, args: parsedArgs },
        };
      } catch (err: unknown) {
        console.error('[Telovox LLM] Error parsing tool arguments JSON:', err);
      }
    }
  }
}
