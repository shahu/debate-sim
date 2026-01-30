/**
 * Audio Controls Hook
 * Provides shared AudioContext with GainNode for smooth volume transitions
 * Prevents audio clicking through setTargetAtTime smoothing
 */

import { useRef, useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';

// Module-level refs for single shared instance
const audioContextRef = useRef<AudioContext | null>(null);
const gainNodeRef = useRef<GainNode | null>(null);

/**
 * Get or create AudioContext (lazy initialization)
 * Browser autoplay policy requires user gesture before resuming
 */
function getOrCreateAudioContext(): AudioContext {
  if (!audioContextRef.current) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API not supported in this browser');
    }

    audioContextRef.current = new AudioContextClass();

    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => {
        console.error('Failed to resume AudioContext:', err);
      });
    }
  }

  return audioContextRef.current;
}

/**
 * Get or create shared GainNode
 * Single instance for global volume control across all audio elements
 */
function getOrCreateGainNode(audioContext: AudioContext): GainNode {
  if (!gainNodeRef.current) {
    gainNodeRef.current = audioContext.createGain();
    // Connect gain node to destination (speakers)
    gainNodeRef.current.connect(audioContext.destination);
  }

  return gainNodeRef.current;
}

interface UseAudioControlsResult {
  /**
   * Set volume with smooth transition (prevents clicking)
   * Uses GainNode.gain.setTargetAtTime with 20ms smoothing
   */
  setVolume: (volume: number) => void;

  /**
   * Connect audio element to shared gain node for global volume control
   * Creates MediaElementSource → GainNode → Destination connection
   */
  applyVolumeToAudio: (audioElement: HTMLAudioElement) => void;

  /**
   * Initialize AudioContext (call on first user interaction)
   * Resumes AudioContext if suspended (browser autoplay policy)
   */
  initializeAudio: () => void;
}

/**
 * Audio controls hook with Web Audio API integration
 * Provides smooth volume transitions via shared GainNode
 *
 * @returns Volume control and audio element connection functions
 *
 * @example
 * ```typescript
 * const { setVolume, applyVolumeToAudio, initializeAudio } = useAudioControls();
 *
 * // Initialize on user gesture
 * <button onClick={initializeAudio}>Start Audio</button>
 *
 * // Apply volume change with smoothing
 * setVolume(1.5); // 150% volume
 *
 * // Connect audio element to global volume control
 * const audio = new Audio('speech.mp3');
 * applyVolumeToAudio(audio);
 * ```
 */
export function useAudioControls(): UseAudioControlsResult {
  const { volume, isMuted, setVolume: setStoreVolume } = useAudioStore();

  /**
   * Set volume with smooth transition using setTargetAtTime
   * Time constant of 0.02 = 20ms smoothing (prevents clicking)
   */
  const setVolume = useCallback((newVolume: number) => {
    try {
      const audioContext = getOrCreateAudioContext();
      const gainNode = getOrCreateGainNode(audioContext);

      // Calculate effective volume (0 if muted, else specified volume)
      const effectiveVolume = isMuted ? 0 : newVolume;

      // Use setTargetAtTime for smooth transition (no clicking)
      // Parameters: target value, start time, time constant (in seconds)
      gainNode.gain.setTargetAtTime(
        effectiveVolume,
        audioContext.currentTime,
        0.02 // 20ms smoothing
      );

      // Update store for UI state
      setStoreVolume(newVolume);
    } catch (err) {
      console.error('Failed to set volume:', err);
    }
  }, [isMuted, setStoreVolume]);

  /**
   * Connect audio element to shared gain node
   * Creates MediaElementSource → GainNode → Destination
   * This allows the gain node to control volume of the audio element
   */
  const applyVolumeToAudio = useCallback((audioElement: HTMLAudioElement) => {
    try {
      const audioContext = getOrCreateAudioContext();
      const gainNode = getOrCreateGainNode(audioContext);

      // Create MediaElementSource from audio element
      // Note: Can only create one source per element, so check if already connected
      const source = audioContext.createMediaElementSource(audioElement);

      // Connect: audio element → shared gain node → destination
      source.connect(gainNode);
      // Gain node already connected to destination in getOrCreateGainNode
    } catch (err) {
      console.error('Failed to apply volume to audio element:', err);
      // Ignore if already connected (MediaElementSource already exists)
      if (!err || !(err instanceof DOMException)) {
        console.warn('Audio element may already be connected to gain node');
      }
    }
  }, []);

  /**
   * Initialize AudioContext (call on first user interaction)
   * Resumes AudioContext if suspended due to browser autoplay policy
   */
  const initializeAudio = useCallback(() => {
    try {
      const audioContext = getOrCreateAudioContext();

      // Resume if suspended (browser requires user gesture)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => {
          console.error('Failed to resume AudioContext:', err);
        });
      }
    } catch (err) {
      console.error('Failed to initialize audio:', err);
    }
  }, []);

  return {
    setVolume,
    applyVolumeToAudio,
    initializeAudio
  };
}

/**
 * Standalone function to apply global volume to any audio element
 * Exported for use in TTS hooks and components
 *
 * @param audioElement - HTMLAudioElement to connect to shared gain node
 */
export function applyGlobalVolume(audioElement: HTMLAudioElement): void {
  const { applyVolumeToAudio } = useAudioControls();
  applyVolumeToAudio(audioElement);
}

export default useAudioControls;
