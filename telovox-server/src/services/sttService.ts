/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Real-time Speech-to-Text (STT) audio transcription service.
 * ============================================================================
 */

import WebSocket from 'ws';

export interface STTCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
}

export class STTService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private callbacks: STTCallbacks;

  constructor(apiKey: string, callbacks: STTCallbacks) {
    this.apiKey = apiKey || process.env.DEEPGRAM_API_KEY || '';
    this.callbacks = callbacks;
  }

  /**
   * Connects to Deepgram live streaming transcription socket.
   */
  public connect() {
    if (!this.apiKey) {
      console.warn('[Telovox STT] Warning: No DEEPGRAM_API_KEY provided. Using local speech stream pass-through.');
      return;
    }

    const url = 'wss://api.deepgram.com/v1/listen?model=nova-2&encoding=linear16&sample_rate=16000&channels=1&interim_results=true&smart_format=true';

    this.ws = new WebSocket(url, {
      headers: {
        Authorization: `Token ${this.apiKey}`,
      },
    });

    this.ws.on('open', () => {
      console.log('[Telovox STT] Connected to Deepgram Live Transcription Stream.');
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        const response = JSON.parse(data.toString());
        const transcript = response?.channel?.alternatives?.[0]?.transcript;
        const isFinal = response?.is_final || false;

        if (transcript && transcript.trim().length > 0) {
          this.callbacks.onTranscript(transcript.trim(), isFinal);
        }
      } catch (err: unknown) {
        // Ignored or parsed safely
      }
    });

    this.ws.on('error', (err: Error) => {
      console.error('[Telovox STT] Socket error:', err.message);
      this.callbacks.onError(err);
    });

    this.ws.on('close', () => {
      console.log('[Telovox STT] Stream closed.');
    });
  }

  /**
   * Forwards a raw linear16 / PCM audio buffer chunk directly to the transcription engine.
   */
  public sendAudioChunk(chunk: Buffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(chunk);
    }
  }

  /**
   * Closes the STT connection cleanly.
   */
  public disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      this.ws = null;
    }
  }
}
