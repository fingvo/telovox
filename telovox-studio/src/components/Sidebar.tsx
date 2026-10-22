/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Studio Sidebar navigation with instant call simulator trigger.
 * ============================================================================
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Megaphone,
  History,
  Wrench,
  Mic,
} from 'lucide-react';

interface SidebarProps {
  onOpenSimulator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSimulator }) => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agents', label: 'AI Agents', icon: Bot },
    { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { href: '/calls', label: 'Call Logs', icon: History },
    { href: '/tools', label: 'Automations', icon: Wrench },
  ];

  return (
    <aside className="w-64 border-r border-[rgba(255,255,255,0.08)] bg-[#0d121c] p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-3 block mb-2">
            Telephony Studio
          </span>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#182033] text-[#00f2fe] border border-[rgba(0,242,254,0.3)] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b2b]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Simulator Call Launcher */}
        <div className="p-3 rounded bg-[#111624] border border-[rgba(255,255,255,0.06)] space-y-2">
          <span className="text-[11px] font-semibold text-slate-200 block">In-Browser Voice Test</span>
          <p className="text-[10px] text-slate-400">
            Simulate a real phone conversation with your AI agent using your computer mic.
          </p>
          <button
            onClick={onOpenSimulator}
            className="w-full bg-[#182033] hover:bg-[#202b44] text-[#00f2fe] border border-[rgba(0,242,254,0.3)] px-3 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Launch Mic Simulator</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 text-[11px] text-slate-400">
        <span>Telovox v0.1.0-alpha</span>
        <span className="block text-[10px] text-slate-400">Erlang BEAM + Node.js TS + MySQL</span>
      </div>
    </aside>
  );
};
