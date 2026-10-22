/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Master Express server and WebSocket audio streaming engine.
 * ============================================================================
 */

import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/db';
import { agentRouter } from './routes/agentRoutes';
import { campaignRouter } from './routes/campaignRoutes';
import { callRouter } from './routes/callRoutes';
import { CallPipeline } from './websocket/callPipeline';
import url from 'url';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Enable JSON middleware and permissive CORS for Next.js studio workbench
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'Telovox',
    version: '0.1.0',
    author: 'Sohail MN (Aka Fingvo)',
    copyright: '(c) 2026 Fingvo. All rights reserved.',
  });
});

// REST API Routes
app.use('/api/agents', agentRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/calls', callRouter);

// Create HTTP server instance
const server = http.createServer(app);

// Mount WebSocket server for real-time bi-directional audio streaming
const wss = new WebSocketServer({ server, path: '/ws/call' });

wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
  const parsedUrl = url.parse(req.url || '', true);
  const agentId = (parsedUrl.query.agentId as string) || 'agent-dental-01';
  const callId = (parsedUrl.query.callId as string) || `call-${Date.now()}`;

  console.log(`[Telovox Server] Inbound WebSocket call stream: ${callId} (Agent: ${agentId})`);

  const pipeline = new CallPipeline(ws, callId, agentId);
  await pipeline.initialize();

  ws.on('message', async (data: WebSocket.RawData, isBinary: boolean) => {
    await pipeline.handleMessage(data, isBinary);
  });

  ws.on('close', async () => {
    console.log(`[Telovox Server] Client disconnected from call stream: ${callId}`);
    await pipeline.terminate();
  });

  ws.on('error', (err: Error) => {
    console.error(`[Telovox Server] WebSocket error on call ${callId}:`, err.message);
  });
});

// Startup sequence
async function startServer() {
  console.log('============================================================');
  console.log('TELOVOX - Open Source Real-Time AI Telephony Platform');
  console.log('Author: Sohail MN (Aka Fingvo) - Full Stack Engineer');
  console.log('Copyright: (c) 2026 Fingvo. All rights reserved. (MIT License)');
  console.log('============================================================');

  // Verify MySQL connection
  await testDatabaseConnection();

  server.listen(PORT, () => {
    console.log(`[Telovox Server] REST API listening on http://localhost:${PORT}`);
    console.log(`[Telovox Server] WebSocket audio pipeline ready on ws://localhost:${PORT}/ws/call`);
  });
}

startServer();
