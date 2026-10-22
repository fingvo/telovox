/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Telephony overview dashboard detailing call volumes, active
 *              concurrency, pipeline latency, and recent session history.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TelovoxAPI } from '../lib/api';
import { DashboardStats, CallLog } from '../types';
import { PhoneCall, Activity, Clock, Zap, ArrowUpRight, PhoneIncoming } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_calls: 0,
    active_calls: 0,
    avg_duration_sec: 0,
    avg_latency_ms: 0,
  });
  const [recentCalls, setRecentCalls] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [sData, cData] = await Promise.all([
        TelovoxAPI.getOverviewStats(),
        TelovoxAPI.getCalls(),
      ]);
      setStats(sData);
      setRecentCalls(cData.slice(0, 8));
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">Telephony Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SIP trunk metrics, active agent concurrency, and media latency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/agents"
            className="bg-[#182033] hover:bg-[#202b44] text-[#00f2fe] border border-[rgba(0,242,254,0.3)] text-xs px-3.5 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Configure AI Agents</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="telovox-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Total Calls Logged</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">{stats.total_calls}</span>
          </div>
          <div className="w-10 h-10 rounded bg-[#182033] flex items-center justify-center text-[#00f2fe]">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        {/* Active Concurrency */}
        <div className="telovox-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Active Phone Calls</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.active_calls}</span>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Duration */}
        <div className="telovox-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Average Call Length</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">{stats.avg_duration_sec}s</span>
          </div>
          <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Pipeline Latency */}
        <div className="telovox-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Turn Latency (TTS)</span>
            <span className="text-2xl font-bold text-[#00f2fe] font-mono">
              {stats.avg_latency_ms > 0 ? `${stats.avg_latency_ms}ms` : '<450ms'}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-[#00f2fe]">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="telovox-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="w-4 h-4 text-[#00f2fe]" />
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Recent Call Sessions</h2>
          </div>
          <Link href="/calls" className="text-xs text-[#00f2fe] hover:underline flex items-center gap-1">
            <span>View All Transcripts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono">Loading telemetry logs...</div>
        ) : recentCalls.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <PhoneCall className="w-8 h-8 mx-auto text-slate-400" />
            <p>No phone call records found in MySQL database.</p>
            <p className="text-[11px] text-slate-400">
              Use the &apos;Launch Mic Simulator&apos; button in the sidebar or trigger a campaign to make your first call.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)] text-slate-400 text-[11px] bg-[#0c101a]">
                  <th className="py-2.5 px-3">Call SID</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Caller</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call) => (
                  <tr key={call.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[#161c2b] transition-colors">
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{call.call_sid || call.id.slice(0, 16)}</td>
                    <td className="py-2.5 px-3 text-[#00f2fe]">{call.agent_name || 'Telovox Agent'}</td>
                    <td className="py-2.5 px-3 uppercase text-slate-400 text-[10px]">{call.direction}</td>
                    <td className="py-2.5 px-3 text-slate-200">{call.caller_number}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          call.status === 'completed'
                            ? 'badge-emerald'
                            : call.status === 'in_progress'
                            ? 'badge-cyan'
                            : 'badge-rose'
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{call.duration_seconds}s</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {new Date(call.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
