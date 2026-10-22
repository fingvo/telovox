/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Low-latency Text-to-Speech (TTS) audio synthesis service.
 * ============================================================================
 */

export class TTSService {
  private cartesiaApiKey: string;
  private elevenApiKey: string;

  constructor() {
    this.cartesiaApiKey = process.env.CARTESIA_API_KEY || '';
    this.elevenApiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  /**
   * Synthesizes audio buffer from text using Cartesia Sonic (sub-90ms latency)
   * or ElevenLabs.
   */
  public async synthesize(
    text: string,
    voiceId = 'sonic-english',
    provider = 'cartesia'
  ): Promise<Buffer | null> {
    if (!text || text.trim().length === 0) return null;

    if (provider === 'cartesia' && this.cartesiaApiKey) {
      return this.synthesizeCartesia(text, voiceId);
    } else if (provider === 'elevenlabs' && this.elevenApiKey) {
      return this.synthesizeElevenLabs(text, voiceId);
    }

    // Fallback indicator when no external TTS API key is configured
    console.log(`[Telovox TTS] Voice synthesis simulated for text: "${text}"`);
    return null;
  }

  /**
   * Ultra low-latency voice synthesis using Cartesia Sonic API.
   */
  private async synthesizeCartesia(text: string, voiceId: string): Promise<Buffer | null> {
    try {
      const response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'X-API-Key': this.cartesiaApiKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: voiceId,
          },
          output_format: {
            container: 'raw',
            encoding: 'pcm_s16le',
            sample_rate: 16000,
          },
        }),
      });

      if (!response.ok) {
        console.error(`[Telovox TTS] Cartesia error: ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: unknown) {
      console.error('[Telovox TTS] Cartesia request failed:', err);
      return null;
    }
  }

  /**
   * Voice synthesis using ElevenLabs API.
   */
  private async synthesizeElevenLabs(text: string, voiceId: string): Promise<Buffer | null> {
    try {
      const actualVoice = voiceId && voiceId !== 'sonic-english' ? voiceId : '21m00Tcm4TlvDq8ikWAM';
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${actualVoice}?output_format=pcm_16000`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
        }),
      });

      if (!response.ok) {
        console.error(`[Telovox TTS] ElevenLabs error: ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: unknown) {
      console.error('[Telovox TTS] ElevenLabs request failed:', err);
      return null;
    }
  }
}
