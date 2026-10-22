/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Express REST API router for agent configuration and tool management.
 * ============================================================================
 */

import { Router, Request, Response } from 'express';
import { AgentService } from '../services/agentService';
import { ToolService } from '../services/toolService';

export const agentRouter = Router();

// GET /api/agents - List all configured AI agents
agentRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const agents = await AgentService.getAllAgents();
    res.json({ success: true, data: agents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/agents/:id - Get specific agent with tools
agentRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await AgentService.getAgentById(req.params.id);
    if (!data.agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/agents - Create new AI agent
agentRouter.post('/', async (req: Request, res: Response) => {
  try {
    const created = await AgentService.createAgent(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ success: false, error: message });
  }
});

// PUT /api/agents/:id - Update existing agent
agentRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await AgentService.updateAgent(req.params.id, req.body);
    res.json({ success: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ success: false, error: message });
  }
});

// DELETE /api/agents/:id - Delete agent
agentRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await AgentService.deleteAgent(req.params.id);
    res.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/agents/:id/tools - Register dynamic tool for agent
agentRouter.post('/:id/tools', async (req: Request, res: Response) => {
  try {
    const tool = await ToolService.createTool({
      ...req.body,
      agent_id: req.params.id,
    });
    res.status(201).json({ success: true, data: tool });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ success: false, error: message });
  }
});
