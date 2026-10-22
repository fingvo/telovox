/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Call Logs & Turn-by-Turn Audio Transcript Inspector.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TelovoxAPI } from '../../lib/api';
import { CallLog, CallTranscript } from '../../types';
import { History, MessageSquare, Clock, Phone, ChevronRight } from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(true);
  const [isLoadingTranscripts, setIsLoadingTranscripts] = useState(false);

  useEffect(() => {
    async function loadCalls() {
      setIsLoadingCalls(true);
      const data = await TelovoxAPI.getCalls();
      setCalls(data);
      if (data.length > 0) {
        handleSelectCall(data[0].id);
      }
      setIsLoadingCalls(false);
    }
    loadCalls();
  }, []);

  const handleSelectCall = async (id: string) => {
    setSelectedCallId(id);
    setIsLoadingTranscripts(true);
    const data = await TelovoxAPI.getCallTranscripts(id);
    setTranscripts(data.transcripts);
    setIsLoadingTranscripts(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">Call Logs & Transcripts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review live conversations, speech latencies, and tool execution logs.
        </p>
      </div>

      {isLoadingCalls ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading call records...</div>
      ) : calls.length === 0 ? (
        <div className="telovox-panel p-12 text-center text-slate-400 text-xs space-y-3">
          <History className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-200">No Calls Recorded</h3>
          <p className="max-w-md mx-auto text-[11px]">
            Make a call using the in-browser simulator or connect a SIP trunk to see turn-by-turn transcripts here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Call Logs List */}
          <div className="lg:col-span-5 telovox-panel p-4 space-y-2 max-h-[700px] overflow-y-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Recorded Sessions ({calls.length})
            </span>

            {calls.map((call) => {
              const isSelected = selectedCallId === call.id;

              return (
                <div
                  key={call.id}
                  onClick={() => handleSelectCall(call.id)}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#182033] border-[#00f2fe]/40 text-slate-100'
                      : 'bg-[#0a0d14] border-[rgba(255,255,255,0.05)] hover:bg-[#141b2b] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-mono">{call.call_sid || call.id.slice(0, 14)}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                        call.status === 'completed'
                          ? 'badge-emerald'
                          : call.status === 'in_progress'
                          ? 'badge-cyan'
                          : 'badge-rose'
                      }`}
                    >
                      {call.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#00f2fe]" />
                      {call.caller_number}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {call.duration_seconds}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transcript Viewer Drawer */}
          <div className="lg:col-span-7 telovox-panel p-5 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#00f2fe]" />
                  <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Dialogue Transcript: {selectedCallId?.slice(0, 16)}
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Turn-by-Turn Audio Record</span>
              </div>

              {isLoadingTranscripts ? (
                <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading dialogue turns...</div>
              ) : transcripts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p>No audio transcript turns found for this call session.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {transcripts.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded text-xs leading-relaxed max-w-[90%] ${
                        t.speaker === 'agent'
                          ? 'bg-[#182033] border border-[rgba(0,242,254,0.2)] text-slate-100 mr-auto'
                          : 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] text-slate-100 ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold uppercase tracking-wider text-[#00f2fe]">
                          {t.speaker === 'agent' ? 'AI Voice Agent' : 'Caller'}
                        </span>
                        {t.latency_ms > 0 && (
                          <span className="font-mono text-emerald-400">{t.latency_ms}ms latency</span>
                        )}
                      </div>
                      <p>{t.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
