/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Agent configuration service managing database persistence and prompt retrieval.
 * ============================================================================
 */

import { pool } from '../config/db';
import { Agent, AgentTool } from '../types/telephony';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class AgentService {
  /**
   * Fetches all registered AI agents from the MySQL database.
   */
  static async getAllAgents(): Promise<Agent[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM `agents` ORDER BY `created_at` DESC');
    return rows as Agent[];
  }

  /**
   * Retrieves a single agent by its unique identifier along with associated tools.
   */
  static async getAgentById(id: string): Promise<{ agent: Agent | null; tools: AgentTool[] }> {
    const [agentRows] = await pool.query<RowDataPacket[]>('SELECT * FROM `agents` WHERE `id` = ? LIMIT 1', [id]);
    if (agentRows.length === 0) {
      return { agent: null, tools: [] };
    }

    const [toolRows] = await pool.query<RowDataPacket[]>('SELECT * FROM `agent_tools` WHERE `agent_id` = ? AND `is_active` = 1', [id]);
    return {
      agent: agentRows[0] as Agent,
      tools: toolRows as AgentTool[],
    };
  }

  /**
   * Creates a new AI agent in the database.
   */
  static async createAgent(data: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const id = `agent-${uuidv4()}`;
    await pool.query<ResultSetHeader>(
      `INSERT INTO \`agents\` (
        \`id\`, \`name\`, \`system_prompt\`, \`voice_id\`, \`voice_provider\`,
        \`language\`, \`temperature\`, \`first_message\`, \`max_call_duration_sec\`, \`is_active\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.system_prompt,
        data.voice_id || 'sonic-english',
        data.voice_provider || 'cartesia',
        data.language || 'en-US',
        data.temperature || 0.70,
        data.first_message,
        data.max_call_duration_sec || 600,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      ]
    );

    const created = await this.getAgentById(id);
    return created.agent!;
  }

  /**
   * Updates an existing agent.
   */
  static async updateAgent(id: string, data: Partial<Agent>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('`name` = ?'); values.push(data.name); }
    if (data.system_prompt !== undefined) { fields.push('`system_prompt` = ?'); values.push(data.system_prompt); }
    if (data.voice_id !== undefined) { fields.push('`voice_id` = ?'); values.push(data.voice_id); }
    if (data.voice_provider !== undefined) { fields.push('`voice_provider` = ?'); values.push(data.voice_provider); }
    if (data.language !== undefined) { fields.push('`language` = ?'); values.push(data.language); }
    if (data.temperature !== undefined) { fields.push('`temperature` = ?'); values.push(data.temperature); }
    if (data.first_message !== undefined) { fields.push('`first_message` = ?'); values.push(data.first_message); }
    if (data.max_call_duration_sec !== undefined) { fields.push('`max_call_duration_sec` = ?'); values.push(data.max_call_duration_sec); }
    if (data.is_active !== undefined) { fields.push('`is_active` = ?'); values.push(data.is_active ? 1 : 0); }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE \`agents\` SET ${fields.join(', ')} WHERE \`id` = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Deletes an agent from the database.
   */
  static async deleteAgent(id: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM `agents` WHERE `id` = ?', [id]);
    return result.affectedRows > 0;
  }
}
