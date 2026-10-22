/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Mid-call Webhook & Tool Automations Manager.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TelovoxAPI } from '../../lib/api';
import { Agent, AgentTool } from '../../types';
import { Wrench, Plus, Globe, CheckCircle } from 'lucide-react';

export default function ToolsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT'>('POST');
  const [parametersJson, setParametersJson] = useState('{\n  "type": "object",\n  "properties": {\n    "patient_name": {"type": "string"}\n  }\n}');

  const loadAgentsAndTools = async () => {
    setIsLoading(true);
    const agentList = await TelovoxAPI.getAgents();
    setAgents(agentList);

    if (agentList.length > 0) {
      const activeId = selectedAgentId || agentList[0].id;
      setSelectedAgentId(activeId);
      const detail = await TelovoxAPI.getAgentById(activeId);
      if (detail) {
        setTools(detail.tools);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAgentsAndTools();
  }, []);

  const handleAgentChange = async (id: string) => {
    setSelectedAgentId(id);
    setIsLoading(true);
    const detail = await TelovoxAPI.getAgentById(id);
    if (detail) {
      setTools(detail.tools);
    }
    setIsLoading(false);
  };

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !toolName.trim() || !webhookUrl.trim()) return;

    let parsedSchema = {};
    try {
      parsedSchema = JSON.parse(parametersJson);
    } catch {
      alert('Invalid JSON in Parameters Schema');
      return;
    }

    await TelovoxAPI.createTool(selectedAgentId, {
      name: toolName.trim(),
      description: description.trim(),
      webhook_url: webhookUrl.trim(),
      method,
      parameters_schema: parsedSchema,
      is_active: true,
    });

    setShowCreateModal(false);
    setToolName('');
    setDescription('');
    setWebhookUrl('');
    handleAgentChange(selectedAgentId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono tracking-wide">Mid-Call Tool Automations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Equip your AI voice agents with dynamic HTTP webhooks, appointment booking, and CRM tools.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-[#0a0d14] font-semibold text-xs px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Automation Tool</span>
        </button>
      </div>

      {/* Agent Selector Bar */}
      <div className="telovox-panel p-4 flex items-center gap-3">
        <label className="text-xs text-slate-400">Select Target Agent:</label>
        <select
          value={selectedAgentId}
          onChange={(e) => handleAgentChange(e.target.value)}
          className="bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#00f2fe]"
        >
          {agents.map((ag) => (
            <option key={ag.id} value={ag.id}>{ag.name}</option>
          ))}
        </select>
      </div>

      {/* Tools List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading configured tools...</div>
      ) : tools.length === 0 ? (
        <div className="telovox-panel p-12 text-center text-slate-400 text-xs space-y-3">
          <Wrench className="w-10 h-10 mx-auto text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-200">No Webhook Tools Assigned</h3>
          <p className="max-w-md mx-auto text-[11px]">
            Add custom function tools so the AI can look up database records or dispatch calendar events during phone calls.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="telovox-panel p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 font-mono">{tool.name}</h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{tool.description}</span>
                </div>
                <span className="badge-emerald px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              </div>

              {/* Endpoint */}
              <div className="bg-[#0a0d14] p-2.5 rounded border border-[rgba(255,255,255,0.04)] text-xs font-mono text-slate-300 flex items-center gap-2 overflow-hidden">
                <span className="badge-cyan px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{tool.method}</span>
                <span className="truncate">{tool.webhook_url}</span>
              </div>

              {/* Schema Preview */}
              <div className="text-[11px] font-mono text-slate-400">
                <span className="text-[10px] uppercase text-slate-500 block mb-1">Parameters Schema:</span>
                <pre className="bg-[#0a0d14] p-2 rounded text-[10px] overflow-x-auto text-slate-300">
                  {JSON.stringify(tool.parameters_schema, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tool Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111624] border border-[rgba(255,255,255,0.1)] rounded-lg w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Register Dynamic Webhook Tool</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTool} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Tool Function Name (snake_case)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., check_and_book_slot"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description (For LLM Decision Making)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Checks dental slot availability for a given date"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-slate-300 font-medium">Method</label>
                  <select
                    value={method}
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-slate-300 font-medium">Webhook URL Endpoint</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.yourdomain.com/v1/appointments"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 focus:outline-none focus:border-[#00f2fe]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">JSON Schema Parameters</label>
                <textarea
                  rows={4}
                  value={parametersJson}
                  onChange={(e) => setParametersJson(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[rgba(255,255,255,0.1)] rounded p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-[#00f2fe]"
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
                  Save Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
