/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Top application navigation bar displaying Telovox branding,
 *              engine status indicator, and author credit metadata.
 * ============================================================================
 */

import React from 'react';
import { PhoneCall, Radio } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#0c101a] px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] flex items-center justify-center shadow-lg shadow-[#00f2fe]/20">
          <PhoneCall className="w-5 h-5 text-[#0a0d14]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-wider text-slate-100 font-mono">TELOVOX</h1>
            <span className="badge-cyan px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase">
              BEAM Gateway
            </span>
          </div>
          <p className="text-xs text-slate-400">Open-Source Real-Time AI Telephony & Calling Automation Platform</p>
        </div>
      </div>

      {/* Gateway Telemetry Status */}
      <div className="hidden sm:flex items-center gap-2 bg-[#111624] border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="text-xs text-slate-400">Erlang Switch:</span>
        <span className="text-xs font-mono font-medium text-emerald-400">Ready on Port 5060</span>
      </div>

      {/* Author Credit Badge */}
      <div className="flex flex-col text-right">
        <span className="text-xs text-slate-200 font-semibold">Sohail MN (Aka Fingvo)</span>
        <span className="text-[10px] text-slate-400">Full Stack Engineer | (c) 2026 Fingvo</span>
      </div>
    </header>
  );
};
