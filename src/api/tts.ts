/**
 * TTS (Text-to-Speech) API module for generating audio from text.
 * Provides functions to interact with the backend TTS endpoints.
 */

import { apiClient } from './client';
import type { TTSRequest, TTSVoicesResponse, TTSVoice } from './types';

/**
 * Generate TTS audio from text.
 * 
 * @param request - TTS request with text and optional voice_id/provider
 * @returns Promise with audio Blob
 * 
 * @example
 * ```typescript
 * const audioBlob = await generateTTS({
 *   text: "Hello, this is a debate speech.",
 *   provider: 'pyttsx3'
 * });
 * 
 * // Play the audio
 * await playAudio(audioBlob);
 * ```
 */
export async function generateTTS(request: TTSRequest): Promise<Blob> {
  const blob = await apiClient.post<Blob>('/api/tts/generate', request);
  return blob;
}

/**
 * Get list of available TTS voices.
 * 
 * @returns Promise with array of voice objects
 * 
 * @example
 * ```typescript
 * const voices = await getTTSVoices();
 * console.log(voices); // [{ id: '0', name: 'Voice 1' }, ...]
 * ```
 */
export async function getTTSVoices(): Promise<TTSVoice[]> {
  const response = await apiClient.get<TTSVoicesResponse>('/api/tts/voices');
  return response.voices;
}

/**
 * Play audio from a Blob.
 * 
 * Creates an Audio element, sets the source to the blob URL,
 * and plays the audio. Returns a promise that resolves when
 * playback starts and rejects on error.
 * 
 * @param audioBlob - Blob containing audio data
 * @returns Promise that resolves when playback starts
 * 
 * @example
 * ```typescript
 * const blob = await generateTTS({ text: "Hello" });
 * await playAudio(blob);
 * ```
 */
export function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    audio.oncanplaythrough = () => {
      audio.play().then(resolve).catch(reject);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to play audio'));
    };
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
  });
}

/**
 * Play TTS audio directly from text.
 * 
 * Convenience function that generates TTS and plays it immediately.
 * 
 * @param text - Text to speak
 * @param voiceId - Optional voice ID
 * @param provider - Optional provider ('pyttsx3' or 'elevenlabs')
 * @returns Promise that resolves when playback starts
 * 
 * @example
 * ```typescript
 * await speak("Welcome to the debate!");
 * ```
 */
export async function speak(
  text: string,
  voiceId?: string,
  provider?: 'pyttsx3' | 'elevenlabs'
): Promise<void> {
  const blob = await generateTTS({ text, voice_id: voiceId, provider });
  await playAudio(blob);
}
