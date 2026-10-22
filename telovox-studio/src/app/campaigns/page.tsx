/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Outbound Calling Campaign Manager for parallel AI auto-dialing.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TelovoxAPI } from '../../lib/api';
import { Campaign, Agent } from '../../types';
import { Megaphone, Plus, Play, Users, Layers } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [concurrency, setConcurrency] = useState(5);

  const fetchData = async () => {
    setIsLoading(true);
    const [cData, aData] = await Promise.all([
      TelovoxAPI.getCampaigns(),
      TelovoxAPI.getAgents(),
    ]);
    setCampaigns(cData);
    setAgents(aData);
    if (aData.length > 0 && !agentId) {
      setAgentId(aData[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !agentId) return;

    await TelovoxAPI.createCampaign({
      name,
      agent_id: agentId,
      concurrency_limit: Number(concurrency) || 5,
    });

    setShowCreateModal(false);
    setName('');
    fetchData();
  };

  const handleStartCampaign = async (id: string) => {
    await TelovoxAPI.startCampaign(id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">Outbound Calling Campaigns</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch high-volume automated outbound calls with real-time AI conversation and appointment booking.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0d14] font-semibold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Outbound Campaign</span>
        </button>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="telovox-panel p-12 text-center text-slate-400 text-xs space-y-3">
          <Megaphone className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-200">No Active Campaigns</h3>
          <p className="max-w-md mx-auto text-[11px]">
            Create a campaign to automatically dial customer phone lists and schedule appointments with an assigned AI agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="telovox-panel p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-100">{camp.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>Agent: {camp.agent_name || camp.agent_id}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    camp.status === 'running'
                      ? 'badge-emerald'
                      : camp.status === 'completed'
                      ? 'badge-cyan'
                      : 'badge-amber'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              {/* Progress & Telemetry */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Leads Progress</span>
                  </span>
                  <span className="font-mono">{camp.completed_leads} / {camp.total_leads}</span>
                </div>

                <div className="w-full bg-[#0a0d14] h-2 rounded overflow-hidden">
                  <div
                    className="bg-[#00f2fe] h-full transition-all duration-300"
                    style={{
                      width: `${camp.total_leads > 0 ? (camp.completed_leads / camp.total_leads) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  Lines: {camp.concurrency_limit} concurrent
                </span>

                {camp.status === 'draft' && (
                  <button
                    onClick={() => handleStartCampaign(camp.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0d14] font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start Calling</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111624] border border-[rgba(255,255,255,0.1)] rounded-lg w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Create Outbound Campaign</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dental Checkup Reminder 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Assigned AI Agent</label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>{ag.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Concurrency Limit (Concurrent Phone Lines)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={concurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0d14] font-semibold px-4 py-1.5 rounded transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
