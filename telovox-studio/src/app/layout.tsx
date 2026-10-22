/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Root application layout integrating Navbar, Sidebar, and Mic Simulator.
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import '../styles/globals.css';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { MicSimulator } from '../components/MicSimulator';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Telovox - Open Source AI Telephony Platform</title>
        <meta name="description" content="Carrier-grade voice calling AI orchestrator powered by Erlang, Node.js TypeScript, and MySQL." />
      </head>
      <body className="bg-[#0a0d14] text-slate-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
            {children}
          </main>
        </div>

        {/* Global In-Browser Mic Simulator */}
        <MicSimulator isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
      </body>
    </html>
  );
}
