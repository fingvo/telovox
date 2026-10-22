/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: AI Agent Studio interface for prompt engineering, voice selection,
 *              and behavioral parameter tuning.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TelovoxAPI } from '../../lib/api';
import { Agent } from '../../types';
import { Bot, Plus, Trash2, Mic, Settings2 } from 'lucide-react';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [voiceProvider, setVoiceProvider] = useState<'cartesia' | 'elevenlabs' | 'deepgram'>('cartesia');
  const [voiceId, setVoiceId] = useState('sonic-english');
  const [temperature, setTemperature] = useState(0.7);

  const fetchAgents = async () => {
    setIsLoading(true);
    const data = await TelovoxAPI.getAgents();
    setAgents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    await TelovoxAPI.createAgent({
      name,
      system_prompt: systemPrompt,
      first_message: firstMessage || 'Hello! How can I help you today?',
      voice_provider: voiceProvider,
      voice_id: voiceId,
      temperature,
      language: 'en-US',
      max_call_duration_sec: 600,
      is_active: true,
    });

    setShowCreateModal(false);
    setName('');
    setSystemPrompt('');
    setFirstMessage('');
    fetchAgents();
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm('Are you sure you want to delete this AI agent?')) {
      await TelovoxAPI.deleteAgent(id);
      fetchAgents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">AI Voice Agents</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system prompts, voice models, and mid-call conversational logic.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0d14] font-semibold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Agent</span>
        </button>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading agents from MySQL...</div>
      ) : agents.length === 0 ? (
        <div className="telovox-panel p-12 text-center text-slate-400 text-xs space-y-3">
          <Bot className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-200">No AI Agents Configured Yet</h3>
          <p className="max-w-md mx-auto text-[11px]">
            Create your first telephony agent with a custom prompt, voice ID, and greeting line to begin receiving calls.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="telovox-panel p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#182033] flex items-center justify-center text-[#00f2fe]">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{agent.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{agent.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Delete Agent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Prompt Preview */}
                <div className="bg-[#0a0d14] p-2.5 rounded border border-[rgba(255,255,255,0.04)] text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                  {agent.system_prompt}
                </div>

                {/* Voice & Specs */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                  <span className="badge-cyan px-2 py-0.5 rounded flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    {agent.voice_provider}: {agent.voice_id}
                  </span>
                  <span className="badge-amber px-2 py-0.5 rounded flex items-center gap-1">
                    <Settings2 className="w-3 h-3" />
                    Temp: {agent.temperature}
                  </span>
                </div>
              </div>

              {/* Greeting */}
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 text-[11px] text-slate-400">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Greeting Line:</span>
                <p className="italic text-slate-300 line-clamp-2">&quot;{agent.first_message}&quot;</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111624] border border-[rgba(255,255,255,0.1)] rounded-lg w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Configure New Voice Agent</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dental Scheduler or Support Rep"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">System Prompt</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Instructions guiding how the AI speaks, asks questions, and verifies customer info..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">First Greeting Message</label>
                <input
                  type="text"
                  placeholder="Hello! Thank you for calling. How can I assist you?"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Voice Provider</label>
                  <select
                    value={voiceProvider}
                    onChange={(e: any) => setVoiceProvider(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                  >
                    <option value="cartesia">Cartesia (Sonic Sub-90ms)</option>
                    <option value="elevenlabs">ElevenLabs (Turbo v2)</option>
                    <option value="deepgram">Deepgram Aura</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Voice ID</label>
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                  />
                </div>
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
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
