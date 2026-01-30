/**
 * Audio Controls Component
 * UI for volume, playback speed, mute, and enable toggles
 * Integrates with useAudioControls for smooth volume transitions
 */

import { useState, useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioControls } from '../hooks/useAudioControls';

interface AudioControlsProps {
  className?: string;
}

/**
 * Audio Controls Component
 * Renders volume slider, playback speed slider, mute toggle, and enable toggle
 * Integrates with shared GainNode for smooth volume control
 */
export function AudioControls({ className = '' }: AudioControlsProps) {
  const {
    volume,
    playbackRate,
    isMuted,
    isEnabled,
    setVolume: setStoreVolume,
    setPlaybackRate,
    toggleMute,
    toggleEnabled
  } = useAudioStore();

  const { setVolume: smoothVolume, initializeAudio } = useAudioControls();

  // Track if audio has been initialized (user gesture required)
  const [audioInitialized, setAudioInitialized] = useState(false);

  /**
   * Initialize AudioContext on first user interaction
   * Browser autoplay policy requires user gesture to resume AudioContext
   */
  const handleFirstInteraction = () => {
    if (!audioInitialized) {
      initializeAudio();
      setAudioInitialized(true);
    }
  };

  /**
   * Apply volume changes with smooth transition
   * Uses GainNode.setTargetAtTime for 20ms smoothing
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFirstInteraction();

    const newValue = parseFloat(e.target.value);
    smoothVolume(newValue);
  };

  /**
   * Handle playback rate change
   * Direct store update (affects new audio elements)
   */
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFirstInteraction();

    const newValue = parseFloat(e.target.value);
    setPlaybackRate(newValue);
  };

  /**
   * Handle mute toggle
   * Triggers volume re-calculation in useAudioControls
   */
  const handleMuteToggle = () => {
    handleFirstInteraction();

    toggleMute();
    // Volume will re-apply with muted state in useAudioControls
  };

  /**
   * Handle enable/disable TTS
   * Global toggle for all TTS playback
   */
  const handleEnableToggle = () => {
    handleFirstInteraction();

    toggleEnabled();
  };

  /**
   * Sync volume changes from store (e.g., reset, other components)
   * Re-applies volume to gain node when store changes
   */
  useEffect(() => {
    if (audioInitialized) {
      smoothVolume(volume);
    }
  }, [volume, isMuted, audioInitialized, smoothVolume]);

  /**
   * Calculate effective volume for display
   * Shows 0% if muted, otherwise shows actual volume percentage
   */
  const displayVolume = isMuted ? 0 : volume;
  const volumePercent = Math.round(displayVolume * 100);

  return (
    <div className={`flex items-center gap-4 p-4 bg-gray-100 rounded-lg ${className}`}>
      {/* Volume Control */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Volume
        </span>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          aria-label={`Volume ${volumePercent}%`}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm text-gray-600 whitespace-nowrap min-w-[3rem] text-right">
          {volumePercent}%
        </span>
      </div>

      {/* Mute Toggle */}
      <button
        onClick={handleMuteToggle}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className={`p-2 rounded-lg transition-colors ${
          isMuted
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        {isMuted ? (
          // Muted icon (speaker with X)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4v-14z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          // Unmuted icon (speaker)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4v-14z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Playback Speed Control */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Speed
        </span>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={playbackRate}
          onChange={handleRateChange}
          aria-label={`Playback speed ${playbackRate.toFixed(1)}x`}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm text-gray-600 whitespace-nowrap min-w-[3rem] text-right">
          {playbackRate.toFixed(1)}x
        </span>
      </div>

      {/* Enable/Disable Toggle */}
      <button
        onClick={handleEnableToggle}
        aria-label={isEnabled ? "Disable audio" : "Enable audio"}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          isEnabled
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
        }`}
      >
        {isEnabled ? 'Audio On' : 'Audio Off'}
      </button>
    </div>
  );
}

/**
 * Apply global volume to any audio element
 * Exported function for use in TTS hooks and other components
 * Connects audio element to shared GainNode for volume control
 *
 * @param audioElement - HTMLAudioElement to connect to global volume control
 *
 * @example
 * ```typescript
 * import { applyGlobalVolume } from './components/AudioControls';
 *
 * const audio = new Audio('speech.mp3');
 * applyGlobalVolume(audio);
 * audio.play();
 * // Audio will now respect global volume settings
 * ```
 */
export function applyGlobalVolume(audioElement: HTMLAudioElement): void {
  // Import applyVolumeToAudio from hook (avoid circular dependency)
  // This function is called from external modules
  const { applyVolumeToAudio } = useAudioControls();
  applyVolumeToAudio(audioElement);
}

export default AudioControls;
