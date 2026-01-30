/**
 * Audio state management using Zustand
 * Provides global audio controls for volume, playback rate, mute, and TTS enable/disable
 */

import { create } from 'zustand';

/**
 * Audio state interface
 */
export interface AudioState {
  // Audio settings
  volume: number;           // Master volume (0.0 to 2.0, default 1.0)
  playbackRate: number;      // Playback speed (0.5 to 2.5, default 1.0)
  isMuted: boolean;        // Mute state (default false)
  isEnabled: boolean;        // Global TTS enable/disable (default true)

  // Actions
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  toggleEnabled: () => void;
  resetAudio: () => void;
}

/**
 * Audio store - global state for audio controls
 */
export const useAudioStore = create<AudioState>((set) => ({
  // Initial state
  volume: 1.0,
  playbackRate: 1.0,
  isMuted: false,
  isEnabled: true,

  // Actions
  setVolume: (volume: number) => set({ volume }),

  setPlaybackRate: (playbackRate: number) => set({ playbackRate }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),

  resetAudio: () => set({
    volume: 1.0,
    playbackRate: 1.0,
    isMuted: false,
    isEnabled: true
  })
}));
