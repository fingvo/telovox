/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Express REST API router for call logs, session telemetry, and transcripts.
 * ============================================================================
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const callRouter = Router();

// GET /api/calls - Fetch recent call logs with agent names
callRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cl.*, a.name as agent_name 
       FROM \`call_logs\` cl 
       LEFT JOIN \`agents\` a ON cl.agent_id = a.id 
       ORDER BY cl.created_at DESC 
       LIMIT 100`
    );
    res.json({ success: true, data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/calls/:id/transcripts - Fetch dialogue dialogue turns for a specific call
callRouter.get('/:id/transcripts', async (req: Request, res: Response) => {
  try {
    const [transcripts] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM \`call_transcripts\` 
       WHERE \`call_id\` = ? 
       ORDER BY \`id\` ASC`,
      [req.params.id]
    );

    const [callRow] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM `call_logs` WHERE `id` = ? LIMIT 1',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        call: callRow[0] || null,
        transcripts,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/calls/stats/overview - Aggregated telemetry dashboard metrics
callRouter.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const [totalCalls] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM `call_logs`');
    const [activeCalls] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM `call_logs` WHERE `status` = \'in_progress\'');
    const [avgDuration] = await pool.query<RowDataPacket[]>('SELECT AVG(`duration_seconds`) as avg_sec FROM `call_logs` WHERE `status` = \'completed\'');
    const [avgLatency] = await pool.query<RowDataPacket[]>('SELECT AVG(`latency_ms`) as avg_lat FROM `call_transcripts` WHERE `speaker` = \'agent\'');

    res.json({
      success: true,
      data: {
        total_calls: totalCalls[0]?.count || 0,
        active_calls: activeCalls[0]?.count || 0,
        avg_duration_sec: Math.round(avgDuration[0]?.avg_sec || 0),
        avg_latency_ms: Math.round(avgLatency[0]?.avg_lat || 0),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});
