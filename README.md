# Telovox

<h3 align="center">Open-Source Real-Time AI Telephony & Calling Automation Platform</h3>
<p align="center"><b>Ultra low-latency speech-to-speech voice agents powered by Erlang (BEAM), Node.js (TypeScript), and MySQL.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Erlang-BEAM%20Media%20Engine-A90533?style=flat-square" alt="Erlang BEAM" />
  <img src="https://img.shields.io/badge/Node.js-TypeScript%20Backend-3178C6?style=flat-square" alt="Node.js TypeScript" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=flat-square" alt="MySQL" />
  <img src="https://img.shields.io/badge/Architecture-Zero%20Python%20Telephony-00f2fe?style=flat-square" alt="Architecture" />
</p>

<br/>

Author: **Sohail MN (Aka Fingvo) - Full Stack Engineer**  
Copyright: **(c) 2026 Fingvo. All rights reserved.**  
License: **MIT License**

---

## Architectural Breakdown

Telovox bridges carrier-grade telecommunications with real-time speech intelligence:

```
                      +-----------------------------+
                      |     Telovox Web Studio      |
                      |   (Next.js 14 / TypeScript) |
                      |  - Agent Prompt Studio      |
                      |  - Campaign Outbound Dial   |
                      |  - In-Browser Mic Simulator |
                      |  - Live Call Audio & Wave   |
                      +--------------+--------------+
                                     |
                                REST / WebSocket
                                     |
                                     v
                      +--------------+--------------+
                      |   Telovox AI Agent Server   |
                      |    (Node.js / TypeScript)   |
                      |  - Speech-to-Speech Loop    |
                      |  - STT: Deepgram / Whisper  |
                      |  - LLM: OpenAI / Claude     |
                      |  - TTS: Cartesia / Eleven   |
                      |  - Tool Automations & CRM   |
                      +-------+--------------+------+
                              |              |
                       SQL Connection        Unix Socket / RTP Chunks
                              |              |
                              v              v
                  +-----------+---+      +---+-------------------------+
                  |  MySQL 8.0 DB |      |    Telovox Media Engine     |
                  |  - agents     |      |        (Erlang / BEAM)      |
                  |  - campaigns  |      |  - SIP Gateway (Twilio/etc) |
                  |  - leads      |      |  - Low-Latency RTP Switch   |
                  |  - call_logs  |      |  - Zero-Crash Supervisors   |
                  |  - transcripts|      |  - Thousands of Active Calls|
                  +---------------+      +-----------------------------+
```

---

## Key Features

1. **Self-Hosted AI Telephony Switch:**
   Connect your own SIP trunks (Twilio, Telnyx, Plivo, Asterisk, FreeSWITCH) without paying expensive per-minute platform markups.
2. **Sub-500ms Audio Round-Trip:**
   Erlang processes audio packet streams directly to Node.js WebSocket workers for natural human-like voice conversations.
3. **Mid-Call Automated Tool Calling:**
   The AI can query databases, schedule appointments in Google Calendar, send SMS confirmations, or update CRM records mid-call.
4. **Visual Testing Studio:**
   Simulate and test your voice agents directly in the browser via microphone before dialing real phone lines.
5. **Zero Python Footprint:**
   Unified full-stack TypeScript paired with Erlang for maximum developer agility and zero context-switching.

---

## Directory Structure

```
telovox/
|-- database/              # MySQL schemas, relational tables, and seed migrations
|-- telovox-erlang/        # Telecom media switch, SIP routing, and RTP packet engine
|-- telovox-server/        # Node.js TypeScript speech-to-speech coordinator & REST API
`-- telovox-studio/        # Next.js 14 dashboard, agent studio, and live call visualizer
```

---

## Quickstart

### 1. Database Setup (MySQL)
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Node.js Backend Server
```bash
cd telovox-server
npm install
npm run build
npm run start
```

### 3. Next.js Studio Dashboard
```bash
cd telovox-studio
npm install
npm run dev
```

---

## License & Credits

* **Author:** Sohail MN (Aka Fingvo) - Full Stack Engineer
* **Copyright:** Copyright (c) 2026 Fingvo. All rights reserved.
* **License:** MIT License
