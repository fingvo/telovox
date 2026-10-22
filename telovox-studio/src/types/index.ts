/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Frontend TypeScript models for agents, calls, campaigns, and tools.
 * ============================================================================
 */

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  voice_id: string;
  voice_provider: string;
  language: string;
  temperature: number;
  first_message: string;
  max_call_duration_sec: number;
  is_active: boolean;
  created_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  agent_id: string;
  agent_name?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  concurrency_limit: number;
  total_leads: number;
  completed_leads: number;
  created_at?: string;
}

export interface CallLog {
  id: string;
  call_sid?: string;
  agent_id: string;
  agent_name?: string;
  direction: 'inbound' | 'outbound';
  caller_number: string;
  recipient_number: string;
  status: 'queued' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer';
  duration_seconds: number;
  cost_cents: number;
  created_at: string;
}

export interface CallTranscript {
  id: number;
  call_id: string;
  speaker: 'user' | 'agent' | 'system';
  text: string;
  latency_ms: number;
  created_at: string;
}

export interface AgentTool {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  parameters_schema: Record<string, unknown>;
  webhook_url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  is_active: boolean;
}

export interface DashboardStats {
  total_calls: number;
  active_calls: number;
  avg_duration_sec: number;
  avg_latency_ms: number;
}
