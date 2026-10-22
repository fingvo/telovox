/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Client API service interfacing with the Node.js Telovox backend.
 *              Strict ZERO MOCK DATA policy.
 * ============================================================================
 */

import { Agent, Campaign, CallLog, CallTranscript, AgentTool, DashboardStats } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class TelovoxAPI {
  // Stats
  static async getOverviewStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/calls/stats/overview`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      return json.data;
    } catch {
      return { total_calls: 0, active_calls: 0, avg_duration_sec: 0, avg_latency_ms: 0 };
    }
  }

  // Agents
  static async getAgents(): Promise<Agent[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/agents`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch agents');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  static async getAgentById(id: string): Promise<{ agent: Agent; tools: AgentTool[] } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/agents/${id}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  }

  static async createAgent(data: Partial<Agent>): Promise<Agent | null> {
    const res = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  static async deleteAgent(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/agents/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  // Campaigns
  static async getCampaigns(): Promise<Campaign[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  static async createCampaign(data: { name: string; agent_id: string; concurrency_limit: number }): Promise<Campaign | null> {
    const res = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  static async startCampaign(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}/start`, { method: 'POST' });
    return res.ok;
  }

  // Calls
  static async getCalls(): Promise<CallLog[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/calls`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch calls');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }

  static async getCallTranscripts(id: string): Promise<{ call: CallLog | null; transcripts: CallTranscript[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/calls/${id}/transcripts`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch transcripts');
      const json = await res.json();
      return json.data || { call: null, transcripts: [] };
    } catch {
      return { call: null, transcripts: [] };
    }
  }

  // Tools
  static async createTool(agentId: string, data: Partial<AgentTool>): Promise<AgentTool | null> {
    const res = await fetch(`${API_BASE_URL}/agents/${agentId}/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }
}
