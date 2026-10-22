/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Interactive in-browser voice calling simulator with real-time
 *              WebSocket streaming and turn-by-turn transcript display.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Agent } from '../types';
import { TelovoxAPI } from '../lib/api';
import { Phone, PhoneOff, Mic, MicOff, Volume2, X, Send } from 'lucide-react';

interface MicSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TranscriptTurn {
  speaker: 'user' | 'agent' | 'system';
  text: string;
  time: string;
}

export const MicSimulator: React.FC<MicSimulatorProps> = ({ isOpen, onClose }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [callDuration, setCallDuration] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      TelovoxAPI.getAgents().then((data) => {
        setAgents(data);
        if (data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data[0].id);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  if (!isOpen) return null;

  const startCall = () => {
    if (!selectedAgentId) return;

    const callId = `sim-${Date.now()}`;
    const wsUrl = `ws://localhost:5000/ws/call?agentId=${selectedAgentId}&callId=${callId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Telovox Simulator] WebSocket connected to telephony pipeline.');
      setIsCalling(true);
      setTranscripts([{
        speaker: 'system',
        text: 'Call connected to Telovox Telephony Switch.',
        time: new Date().toLocaleTimeString(),
      }]);

      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'agent_response' && msg.text) {
            setTranscripts((prev) => [
              ...prev,
              { speaker: 'agent', text: msg.text, time: new Date().toLocaleTimeString() },
            ]);
          } else if (msg.event === 'user_transcript' && msg.text) {
            setTranscripts((prev) => [
              ...prev,
              { speaker: 'user', text: msg.text, time: new Date().toLocaleTimeString() },
            ]);
          } else if (msg.event === 'tool_call') {
            setTranscripts((prev) => [
              ...prev,
              {
                speaker: 'system',
                text: `[Automation Tool Executed: ${msg.tool_name}] ${JSON.stringify(msg.tool_args || {})}`,
                time: new Date().toLocaleTimeString(),
              },
            ]);
          }
        } catch {
          // Non-JSON message
        }
      }
    };

    ws.onerror = (err) => {
      console.error('[Telovox Simulator] WebSocket connection failed:', err);
      setTranscripts((prev) => [
        ...prev,
        {
          speaker: 'system',
          text: 'Connection failed. Make sure telovox-server is running on port 5000.',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    };

    ws.onclose = () => {
      console.log('[Telovox Simulator] WebSocket call disconnected.');
      hangUp();
    };
  };

  const hangUp = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'stop' }));
      wsRef.current.close();
    }
    wsRef.current = null;
    setIsCalling(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      event: 'text',
      text: textInput.trim(),
    }));

    setTextInput('');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111624] border border-[rgba(255,255,255,0.1)] rounded-lg w-full max-w-xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#00f2fe]" />
            <h2 className="text-sm font-semibold text-slate-100">Live Voice Agent Test Simulator</h2>
          </div>
          <button
            onClick={() => { hangUp(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#1a2234]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Call Controls & Agent Selector */}
        <div className="p-4 bg-[#0d121c] border-b border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Select Agent:</label>
            <select
              value={selectedAgentId}
              disabled={isCalling}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-[#161c2b] border border-[rgba(255,255,255,0.1)] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#00f2fe]"
            >
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>{ag.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {isCalling && (
              <span className="text-xs font-mono font-semibold text-emerald-400">
                Live: {formatSeconds(callDuration)}
              </span>
            )}

            {!isCalling ? (
              <button
                onClick={startCall}
                className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0d14] font-semibold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Start Call</span>
              </button>
            ) : (
              <button
                onClick={hangUp}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Call</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] bg-[#0a0d14]">
          {transcripts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-1">
              <Phone className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p>Ready to simulate. Select an agent and click &apos;Start Call&apos; to begin audio streaming.</p>
            </div>
          ) : (
            transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 rounded text-xs leading-relaxed max-w-[85%] ${
                  t.speaker === 'agent'
                    ? 'bg-[#182033] border border-[rgba(0,242,254,0.2)] text-slate-100 mr-auto'
                    : t.speaker === 'user'
                    ? 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] text-slate-100 ml-auto'
                    : 'bg-[#111624] text-slate-400 border border-[rgba(255,255,255,0.05)] mx-auto text-center'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider">
                    {t.speaker === 'agent' ? 'AI Voice Agent' : t.speaker === 'user' ? 'Caller (You)' : 'System Telemetry'}
                  </span>
                  <span>{t.time}</span>
                </div>
                <p>{t.text}</p>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Text Input Fallback if No Microphone */}
        {isCalling && (
          <form onSubmit={handleSendText} className="p-3 bg-[#0d121c] border-t border-[rgba(255,255,255,0.06)] flex gap-2">
            <input
              type="text"
              placeholder="Speak via mic or type a test message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="flex-1 bg-[#161c2b] border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#00f2fe]"
            />
            <button
              type="submit"
              className="bg-[#182033] hover:bg-[#202b44] text-[#00f2fe] border border-[rgba(0,242,254,0.3)] px-3 py-1.5 rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
