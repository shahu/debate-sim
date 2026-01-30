/**
 * TTS (Text-to-Speech) Hook for streaming debate audio
 * Integrates with text streaming to play audio as text arrives
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { SpeakerRole } from '../types/debate';
import { generateTTS, playAudio } from '../api/tts';
import { getVoiceIdForRole } from '../lib/voiceRegistry';
import { useAudioStore } from '../store/audioStore';
import { applyGlobalVolume } from '../components/AudioControls';

interface UseStreamingTTSOptions {
  enabled?: boolean;
  speaker?: SpeakerRole;  // Speaker role for voice selection
  voiceId?: string;       // Fallback voice ID if speaker not provided
  provider?: 'pyttsx3' | 'elevenlabs';
  // Buffer size: how many characters to accumulate before generating TTS
  // Lower = more responsive but more API calls
  // Higher = less responsive but fewer API calls
  bufferSize?: number;
}

interface UseStreamingTTSResult {
  isPlaying: boolean;
  error: Error | null;
  // Function to queue text for TTS
  queueText: (text: string) => void;
  // Function to flush remaining text immediately
  flush: () => void;
  // Function to stop playback
  stop: () => void;
}

/**
 * Hook for streaming TTS that plays audio as text arrives.
 * Buffers text and generates audio in chunks for natural playback.
 * 
 * @param options - TTS options including voice and provider
 * @returns TTS control functions and state
 * 
 * @example
 * ```typescript
 * const { queueText, flush, isPlaying } = useStreamingTTS({
 *   enabled: true,
 *   bufferSize: 100 // Generate TTS every ~100 characters
 * });
 * 
 * // As text streams in
 * for await (const chunk of stream) {
 *   queueText(chunk); // Will play audio when buffer is full
 * }
 * 
 * flush(); // Play any remaining text
 * ```
 */
export function useStreamingTTS(
  options: UseStreamingTTSOptions = {}
): UseStreamingTTSResult {
  const {
    enabled = true,
    speaker,
    voiceId,
    provider = 'pyttsx3',
    bufferSize = 150 // ~150 chars = ~1-2 sentences
  } = options;

  // Get global audio state
  const { isEnabled } = useAudioStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Buffer for accumulating text
  const bufferRef = useRef<string>('');
  // Queue of audio blobs waiting to play
  const audioQueueRef = useRef<Blob[]>([]);
  // Currently playing flag
  const isPlayingRef = useRef(false);
  // Abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate TTS for given text and add to queue
   */
  const generateAndQueueAudio = useCallback(async (text: string) => {
    if (!enabled || !isEnabled || !text.trim()) return;

    try {
      setIsPlaying(true);
      isPlayingRef.current = true;

      // Derive voice_id from speaker or use fallback voiceId
      const derivedVoiceId = speaker
        ? getVoiceIdForRole(speaker, provider)
        : voiceId;

      // Generate TTS audio
      const audioBlob = await generateTTS({
        text: text.trim(),
        voice_id: derivedVoiceId,
        provider
      });

      // Add to queue
      audioQueueRef.current.push(audioBlob);

      // Start playing if not already
      playNextInQueue();
    } catch (err) {
      console.error('TTS generation error:', err);
      setError(err instanceof Error ? err : new Error('TTS failed'));
    }
  }, [enabled, isEnabled, speaker, voiceId, provider]);

  /**
   * Play next audio in queue
   */
  const playNextInQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }

    const audioBlob = audioQueueRef.current.shift();
    if (!audioBlob) return;

    try {
      // Create audio element from blob
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);

      // Connect to shared GainNode for global volume control
      applyGlobalVolume(audioElement);

      // Set playback rate from audio store
      audioElement.playbackRate = useAudioStore.getState().playbackRate;

      // Wait for audio to finish
      await new Promise<void>((resolve, reject) => {
        audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audioElement.onerror = () => {
          console.error('Audio playback error');
          URL.revokeObjectURL(audioUrl);
          resolve(); // Continue even on error
        };

        void audioElement.play().catch(reject);
      });

      // Play next after current finishes
      playNextInQueue();
    } catch (err) {
      console.error('Audio playback error:', err);
      // Continue with next even if one fails
      playNextInQueue();
    }
  }, []);

  /**
   * Queue text for TTS playback
   */
  const queueText = useCallback((text: string) => {
    if (!enabled) return;
    
    // Add to buffer
    bufferRef.current += text;
    
    // Check if we have enough text to generate TTS
    // Look for sentence endings to break at natural points
    const buffer = bufferRef.current;
    if (buffer.length >= bufferSize) {
      // Find last sentence ending within buffer
      const sentenceEndings = /[.!?。！？]+/g;
      let lastMatch = -1;
      let match;
      
      while ((match = sentenceEndings.exec(buffer)) !== null) {
        if (match.index < bufferSize * 1.5) { // Allow some flexibility
          lastMatch = match.index + match[0].length;
        }
      }
      
      // If we found a good break point, use it
      if (lastMatch > 0) {
        const textToSpeak = buffer.substring(0, lastMatch);
        bufferRef.current = buffer.substring(lastMatch);
        generateAndQueueAudio(textToSpeak);
      } else if (buffer.length > bufferSize * 2) {
        // If buffer getting too large without sentence break, force break at word boundary
        const forcedBreak = buffer.lastIndexOf(' ', bufferSize);
        if (forcedBreak > bufferSize * 0.5) {
          const textToSpeak = buffer.substring(0, forcedBreak);
          bufferRef.current = buffer.substring(forcedBreak);
          generateAndQueueAudio(textToSpeak);
        }
      }
    }
  }, [enabled, bufferSize, generateAndQueueAudio]);

  /**
   * Flush remaining buffer immediately
   */
  const flush = useCallback(() => {
    if (bufferRef.current.trim()) {
      generateAndQueueAudio(bufferRef.current);
      bufferRef.current = '';
    }
  }, [generateAndQueueAudio]);

  /**
   * Stop playback and clear queue
   */
  const stop = useCallback(() => {
    // Clear buffer and queue
    bufferRef.current = '';
    audioQueueRef.current = [];
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    error,
    queueText,
    flush,
    stop
  };
}

/**
 * Standalone function to speak text immediately (non-streaming)
 * Useful for one-off announcements
 */
export async function speakText(
  text: string,
  options: Omit<UseStreamingTTSOptions, 'enabled' | 'bufferSize'> = {}
): Promise<void> {
  const { speaker, voiceId, provider = 'pyttsx3' } = options;
  const { isEnabled } = useAudioStore.getState();

  if (!isEnabled) return;

  // Derive voice_id from speaker or use fallback voiceId
  const derivedVoiceId = speaker
    ? getVoiceIdForRole(speaker, provider)
    : voiceId;

  const audioBlob = await generateTTS({
    text,
    voice_id: derivedVoiceId,
    provider
  });

  // Create audio element and apply global volume
  const audioUrl = URL.createObjectURL(audioBlob);
  const audioElement = new Audio(audioUrl);
  applyGlobalVolume(audioElement);
  audioElement.playbackRate = useAudioStore.getState().playbackRate;

  await new Promise<void>((resolve, reject) => {
    audioElement.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audioElement.onerror = () => {
      console.error('Audio playback error');
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    void audioElement.play().catch(reject);
  });
}

export default useStreamingTTS;
