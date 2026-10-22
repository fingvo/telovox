/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Express REST API router for outbound calling campaigns and lead management.
 * ============================================================================
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const campaignRouter = Router();

// GET /api/campaigns - List all outbound campaigns
campaignRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, a.name as agent_name 
       FROM \`campaigns\` c 
       JOIN \`agents\` a ON c.agent_id = a.id 
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/campaigns - Create a new outbound campaign
campaignRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, agent_id, concurrency_limit } = req.body;
    const id = `camp-${uuidv4()}`;

    await pool.query<ResultSetHeader>(
      `INSERT INTO \`campaigns\` (\`id\`, \`name\`, \`agent_id\`, \`concurrency_limit\`, \`status\`)
       VALUES (?, ?, ?, ?, 'draft')`,
      [id, name, agent_id, concurrency_limit || 5]
    );

    res.status(201).json({ success: true, data: { id, name, agent_id, status: 'draft' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ success: false, error: message });
  }
});

// POST /api/campaigns/:id/leads - Upload batch leads to campaign
campaignRouter.post('/:id/leads', async (req: Request, res: Response) => {
  try {
    const campaignId = req.params.id;
    const { leads } = req.body; // Array of { phone_number, customer_name, metadata }

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'No leads provided in payload' });
    }

    for (const lead of leads) {
      const leadId = `lead-${uuidv4()}`;
      await pool.query(
        `INSERT INTO \`leads\` (\`id\`, \`campaign_id\`, \`phone_number\`, \`customer_name\`, \`metadata\`, \`status\`)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [leadId, campaignId, lead.phone_number, lead.customer_name || null, JSON.stringify(lead.metadata || {})]
      );
    }

    // Update campaign lead counter
    await pool.query(
      'UPDATE `campaigns` SET `total_leads` = `total_leads` + ? WHERE `id` = ?',
      [leads.length, campaignId]
    );

    res.json({ success: true, count: leads.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/campaigns/:id/start - Trigger outbound campaign execution
campaignRouter.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const campaignId = req.params.id;
    await pool.query('UPDATE `campaigns` SET `status` = \'running\' WHERE `id` = ?', [campaignId]);
    console.log(`[Telovox Campaign] Started outbound dialing for campaign: ${campaignId}`);
    res.json({ success: true, message: 'Campaign started' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});
