/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Core TypeScript interfaces for agents, calls, transcripts, and tools.
 * ============================================================================
 */

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  voice_id: string;
  voice_provider: 'cartesia' | 'elevenlabs' | 'deepgram' | 'custom';
  language: string;
  temperature: number;
  first_message: string;
  max_call_duration_sec: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Campaign {
  id: string;
  name: string;
  agent_id: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  concurrency_limit: number;
  total_leads: number;
  completed_leads: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Lead {
  id: string;
  campaign_id: string;
  phone_number: string;
  customer_name?: string;
  metadata?: Record<string, unknown>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer';
  retry_count: number;
  last_called_at?: Date;
  created_at?: Date;
}

export interface CallLog {
  id: string;
  call_sid?: string;
  agent_id: string;
  campaign_id?: string;
  lead_id?: string;
  direction: 'inbound' | 'outbound';
  caller_number: string;
  recipient_number: string;
  status: 'queued' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer';
  duration_seconds: number;
  cost_cents: number;
  disconnect_reason?: string;
  recording_url?: string;
  created_at?: Date;
  ended_at?: Date;
}

export interface CallTranscript {
  id?: number;
  call_id: string;
  speaker: 'user' | 'agent' | 'system';
  text: string;
  latency_ms: number;
  created_at?: Date;
}

export interface AgentTool {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  parameters_schema: Record<string, unknown>;
  webhook_url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  is_active: boolean;
  created_at?: Date;
}

export interface AudioFrameMessage {
  event: 'audio' | 'start' | 'stop' | 'user_transcript' | 'agent_response' | 'tool_call';
  call_id: string;
  payload?: string; // Base64 PCM/Opus audio or JSON string
  text?: string;
  tool_name?: string;
  tool_args?: Record<string, unknown>;
}
