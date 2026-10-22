/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Mid-call tool calling & webhook automation execution service.
 * ============================================================================
 */

import { pool } from '../config/db';
import { AgentTool } from '../types/telephony';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ToolService {
  /**
   * Retrieves all tools associated with an agent.
   */
  static async getToolsByAgent(agentId: string): Promise<AgentTool[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM `agent_tools` WHERE `agent_id` = ? ORDER BY `created_at` ASC',
      [agentId]
    );
    return rows as AgentTool[];
  }

  /**
   * Registers a new dynamic automation tool for an agent.
   */
  static async createTool(data: Omit<AgentTool, 'id' | 'created_at'>): Promise<AgentTool> {
    const id = `tool-${uuidv4()}`;
    await pool.query<ResultSetHeader>(
      `INSERT INTO \`agent_tools\` (
        \`id\`, \`agent_id\`, \`name\`, \`description\`, \`parameters_schema\`,
        \`webhook_url\`, \`method\`, \`headers\`, \`is_active\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.agent_id,
        data.name,
        data.description,
        JSON.stringify(data.parameters_schema || {}),
        data.webhook_url,
        data.method || 'POST',
        data.headers ? JSON.stringify(data.headers) : null,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      ]
    );

    return { id, ...data };
  }

  /**
   * Executes a mid-call webhook automation requested by the LLM.
   *
   * Parameters:
   * - tool: The registered tool metadata
   * - args: The JSON arguments provided by the LLM
   */
  static async executeToolWebhook(tool: AgentTool, args: Record<string, unknown>): Promise<{ success: boolean; data: unknown; error?: string }> {
    try {
      console.log(`[Telovox Tool] Executing tool '${tool.name}' via ${tool.method} -> ${tool.webhook_url}`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Telovox-Telephony-Agent/0.1.0',
        ...(tool.headers || {}),
      };

      const options: RequestInit = {
        method: tool.method,
        headers,
      };

      let url = tool.webhook_url;
      if (tool.method === 'GET') {
        const queryParams = new URLSearchParams();
        for (const [key, val] of Object.entries(args)) {
          queryParams.append(key, String(val));
        }
        url += (url.includes('?') ? '&' : '?') + queryParams.toString();
      } else {
        options.body = JSON.stringify(args);
      }

      // Execute real HTTP request with 5000ms timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      options.signal = controller.signal;

      const response = await fetch(url, options);
      clearTimeout(timeout);

      const contentType = response.headers.get('content-type');
      let resultData: unknown;
      if (contentType && contentType.includes('application/json')) {
        resultData = await response.json();
      } else {
        resultData = await response.text();
      }

      return {
        success: response.ok,
        data: resultData,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Telovox Tool] Error executing tool '${tool.name}':`, errorMsg);
      return {
        success: false,
        data: null,
        error: errorMsg,
      };
    }
  }
}
