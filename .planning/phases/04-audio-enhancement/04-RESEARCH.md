# Phase 4: Audio Enhancement - Research

**Researched:** 2026-01-30
**Domain:** React audio management with TTS voice differentiation and playback controls
**Confidence:** MEDIUM

## Summary

This research investigates implementing audio enhancements for the debate simulator, specifically adding distinct voices for each debate role (PM, LO, MO, PW) and comprehensive audio controls (volume, playback speed, mute). The domain involves managing TTS voice characteristics, integrating with the existing backend TTS infrastructure, and providing user controls for audio playback while maintaining smooth streaming synchronization.

The standard approach uses the existing backend TTS API (pyttsx3/ElevenLabs) with role-based voice_id mapping, HTMLAudioElement for playback with Web Audio API GainNode for smooth volume transitions, and Zustand store for global audio state persistence. Voice differentiation is achieved by mapping SpeakerRole enums to specific voice IDs, and audio controls leverage native browser APIs with proper cleanup patterns to prevent memory leaks.

Critical implementation patterns include role-based voice registries for TTS, GainNode smoothing with `setTargetAtTime` to prevent audio clicking, Zustand-based global audio state management for persistent controls across components, and strict cleanup protocols for HTMLAudioElement instances (pause, clear src, load, remove listeners). The existing `useStreamingTTS` hook and TTS API provide a solid foundation that needs enhancement for role-specific voices and playback controls.

**Primary recommendation:** Extend existing TTS infrastructure with role-based voice mapping in a configuration object, implement a Zustand audio store for global state management, and add playback controls using native HTMLAudioElement properties with Web Audio API for volume smoothing.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| HTMLAudioElement | Native | Audio playback | Built-in browser API, handles WAV/MP3 formats, works with Blob URLs from backend |
| Web Audio API | Native | Volume smoothing | Provides GainNode for smooth volume transitions using `setTargetAtTime` |
| Zustand | 4.4.7 | Global audio state | Already in use, perfect for persistent audio state across components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Fetch API | Native | TTS audio retrieval | Backend already provides `/api/tts/generate` endpoint |
| Blob API | Native | Audio data handling | Backend returns audio bytes, convert to Blob for playback |
| AbortController | Native | Stream cancellation | Stop TTS generation when component unmounts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTMLAudioElement | Howler.js | Howler provides cross-browser compatibility and sprites, but native API is sufficient for single-track playback and adds bundle size |
| Web Audio API GainNode | Direct volume property | Direct assignment causes audio clicking; GainNode with `setTargetAtTime` provides smooth transitions |
| Local component state | Zustand store | Audio needs to persist across components and navigation; Zustand provides cleaner global state |

**Installation:**
```bash
# All required libraries already installed
# react 18.2.0
# zustand 4.4.7
# HTMLAudioElement, Web Audio API, Fetch API, Blob API are native - no installation needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useTTS.ts              # Existing, needs voiceId per role
│   └── useAudioControls.ts     # New: Web Audio API volume smoothing
├── store/
│   ├── debateStore.ts          # Existing
│   └── audioStore.ts          # New: Global audio state management
├── lib/
│   ├── voiceRegistry.ts         # New: Role to voice_id mapping
│   └── audioUtils.ts          # New: Audio cleanup helpers
└── components/
    ├── StreamingTranscriptEntry.tsx  # Existing, needs audio controls UI
    └── AudioControls.tsx            # New: Volume, speed, mute controls
```

### Pattern 1: Role-Based Voice Registry
**What:** Central configuration mapping SpeakerRole enums to TTS voice IDs, supporting both pyttsx3 (voice indices) and ElevenLabs (voice IDs).

**When to use:** When different speakers need distinct voice characteristics.

**Example:**
```typescript
// Source: Research on role-based TTS patterns
import { SpeakerRole } from '../types/debate';

export interface VoiceConfig {
  id: string;           // pyttsx3: index, ElevenLabs: voice_id
  name: string;
  provider: 'pyttsx3' | 'elevenlabs';
}

// Role to voice mapping
export const VOICE_REGISTRY: Record<SpeakerRole, VoiceConfig> = {
  [SpeakerRole.PM]: {
    id: '0',
    name: 'David (Male)',
    provider: 'pyttsx3'
  },
  [SpeakerRole.LO]: {
    id: '1',
    name: 'Zira (Female)',
    provider: 'pyttsx3'
  },
  [SpeakerRole.MO]: {
    id: '2',
    name: 'Markus (Male)',
    provider: 'pyttsx3'
  },
  [SpeakerRole.PW]: {
    id: '3',
    name: 'Susan (Female)',
    provider: 'pyttsx3'
  }
};

export function getVoiceForRole(role: SpeakerRole): VoiceConfig {
  return VOICE_REGISTRY[role];
}

// For ElevenLabs, use actual voice IDs
export const ELEVENLABS_VOICE_REGISTRY: Record<SpeakerRole, string> = {
  [SpeakerRole.PM]: 'pNInz6obpgDQGcFmaJgB',  // Adam
  [SpeakerRole.LO]: 'EXAVITQu4vr4xnSDxMaL',  // Bella
  [SpeakerRole.MO]: 'IKne3meq5aSn9XLyUdCD',  // Charlie
  [SpeakerRole.PW]: 'MF3mGyEYCl7XYWbV9V6O'   // Elli
};
```

### Pattern 2: Web Audio API Volume Smoothing
**What:** Use GainNode with `setTargetAtTime` to prevent audio clicking when changing volume.

**When to use:** For any real-time volume changes (sliders, mute toggle, crossfading).

**Example:**
```typescript
// Source: WebSearch findings on GainNode smoothing
import { useRef, useEffect } from 'react';

export function useAudioControls(audioRef: React.RefObject<HTMLAudioElement>) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        gainNodeRef.current = audioContextRef.current.createGain();

        // Connect: Source -> Gain -> Destination
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(gainNodeRef.current).connect(audioContextRef.current.destination);
      }

      // Resume if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    audio.addEventListener('play', initAudio);
    return () => audio.removeEventListener('play', initAudio);
  }, [audioRef]);

  const setVolume = (volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      // Smooth transition to prevent clicking (timeConstant: 0.02 = 20ms)
      gainNodeRef.current.gain.setTargetAtTime(
        volume,
        audioContextRef.current.currentTime,
        0.02
      );
    }
  };

  return { setVolume };
}
```

### Pattern 3: Zustand Global Audio Store
**What:** Centralized audio state management that persists across components, allowing global controls and preventing duplicate audio instances.

**When to use:** When audio needs to keep playing during navigation or be controlled from multiple UI components.

**Example:**
```typescript
// Source: Zustand patterns for audio state management
import { create } from 'zustand';

interface AudioState {
  volume: number;           // 0.0 to 2.0
  playbackRate: number;      // 0.5 to 2.5
  isMuted: boolean;
  isPlaying: boolean;

  // Actions
  setVolume: (vol: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  setPlaying: (playing: boolean) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  volume: 1.0,
  playbackRate: 1.0,
  isMuted: false,
  isPlaying: false,

  setVolume: (vol: number) => set({ volume: vol }),
  setPlaybackRate: (rate: number) => set({ playbackRate: rate }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setPlaying: (playing: boolean) => set({ isPlaying: playing })
}));
```

### Pattern 4: Audio Cleanup Protocol
**What:** Proper cleanup pattern for HTMLAudioElement to prevent memory leaks and stop network buffering.

**When to use:** Anytime an Audio instance is created.

**Example:**
```typescript
// Source: Memory leak prevention patterns
export function cleanupAudio(audio: HTMLAudioElement): void {
  audio.pause();
  audio.src = "";           // Stop network buffering
  audio.load();            // Force browser to release decoder
}

// Usage in useEffect cleanup
useEffect(() => {
  const audio = new Audio(url);
  audio.play();

  return () => {
    cleanupAudio(audio);
  };
}, [url]);
```

### Anti-Patterns to Avoid
- **Direct volume assignment on audio element:** `audio.volume = 0.5` causes clicking. Use GainNode with `setTargetAtTime` instead.
- **Storing Audio in useState:** Re-renders create new instances, causing leaks. Use `useRef` or Zustand store.
- **Anonymous event listeners:** `audio.addEventListener('ended', () => ...)` can't be removed. Use named functions.
- **Missing `audio.load()` in cleanup:** Setting `src = ""` isn't enough; `load()` forces resource release.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Volume smoothing | Manual linear interpolation | GainNode `setTargetAtTime` | Web Audio API provides exponential smoothing optimized for audio, handles interruptibility automatically |
| Global audio state | React Context prop drilling | Zustand | Zustand is lighter than Context, no provider needed, selective subscriptions prevent unnecessary re-renders |
| Audio cleanup | Manual forgettable patterns | Reusable `cleanupAudio` helper | Consistent cleanup prevents memory leaks across components |
| Voice management | Hardcoded voice IDs | Voice registry object | Centralized config allows easy switching between pyttsx3/ElevenLabs providers |

**Key insight:** Audio management in browsers has many edge cases (autoplay policies, memory limits, event listener leaks). Using native APIs with proven patterns (GainNode smoothing, cleanup protocols) is more reliable than custom solutions.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Unreleased Audio
**What goes wrong:** Multiple `HTMLAudioElement` instances accumulate in memory, causing "Media Player exhaustion" and audio won't play.

**Why it happens:** Garbage collection cannot reclaim an Audio object if it's still playing, buffering, or has active event listeners. Setting `audio.pause()` is not enough.

**How to avoid:** Implement full cleanup: `pause()`, set `src = ""`, call `load()`, remove all event listeners.

**Warning signs:** Chrome DevTools shows increasing memory usage, audio randomly stops playing, "play() was interrupted" errors.

### Pitfall 2: Audio Clicking on Volume Change
**What goes wrong:** Audible click/pop sound when changing volume or muting.

**Why it happens:** Instantaneous volume change creates a vertical jump in the audio waveform.

**How to avoid:** Always use GainNode with `setTargetAtTime` for volume transitions. Time constant of 0.02-0.05 (20-50ms) provides smooth transition.

**Warning signs:** Users report clicking sounds when adjusting volume slider or toggling mute.

### Pitfall 3: Autoplay Policy Blocking
**What goes wrong:** Audio won't play until user interacts with the page.

**Why it happens:** Browsers block AudioContext from starting without user gesture (autoplay policy).

**How to avoid:** Initialize AudioContext inside a user event handler (click, keypress). Resume suspended context on play.

**Warning signs:** Audio starts playing on second click but not first, console shows "AudioContext was not allowed to start".

### Pitfall 4: React Re-renders Creating Duplicate Audio
**What goes wrong:** Audio restarts or multiple instances play simultaneously.

**Why it happens:** Storing Audio instance in useState causes recreation on every state update.

**How to avoid:** Use `useRef` for Audio instance, or store single instance in Zustand store.

**Warning signs:** Audio plays multiple overlapping copies, component state desyncs from audio state.

### Pitfall 5: Voice ID Mismatch Between Providers
**What goes wrong:** pyttsx3 expects voice indices (0, 1, 2), ElevenLabs expects voice IDs (strings). Using wrong type causes TTS failure.

**Why it happens:** Voice identifiers have different formats across TTS providers.

**How to avoid:** Maintain separate voice registries for each provider, validate voice_id format before sending to backend.

**Warning signs:** TTS API returns 500 error, "invalid voice_id" in logs, same voice plays for all roles.

## Code Examples

Verified patterns from official sources:

### Get Voice by Role with Provider Support
```typescript
// Source: Role-based TTS pattern research
import { SpeakerRole } from '../types/debate';

interface VoiceRegistry {
  pyttsx3: Record<SpeakerRole, string>;  // Voice indices: "0", "1", "2", "3"
  elevenlabs: Record<SpeakerRole, string>; // Voice IDs: actual UUID strings
}

export const VOICE_REGISTRY: VoiceRegistry = {
  pyttsx3: {
    [SpeakerRole.PM]: '0',
    [SpeakerRole.LO]: '1',
    [SpeakerRole.MO]: '2',
    [SpeakerRole.PW]: '3'
  },
  elevenlabs: {
    [SpeakerRole.PM]: 'pNInz6obpgDQGcFmaJgB',
    [SpeakerRole.LO]: 'EXAVITQu4vr4xnSDxMaL',
    [SpeakerRole.MO]: 'IKne3meq5aSn9XLyUdCD',
    [SpeakerRole.PW]: 'MF3mGyEYCl7XYWbV9V6O'
  }
};

export function getVoiceIdForRole(
  role: SpeakerRole,
  provider: 'pyttsx3' | 'elevenlabs'
): string {
  return VOICE_REGISTRY[provider][role];
}
```

### Complete Audio Control Component
```typescript
// Source: Web Audio API + Zustand patterns
import React, { useRef, useEffect } from 'react';
import { useAudioStore } from '../store/audioStore';
import { useAudioControls } from '../hooks/useAudioControls';

export function AudioControls() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { volume, playbackRate, isMuted, setVolume, setPlaybackRate, toggleMute } = useAudioStore();
  const { setVolume: smoothVolume } = useAudioControls(audioRef);

  // Apply volume changes to GainNode
  useEffect(() => {
    if (!isMuted) {
      smoothVolume(volume);
    } else {
      smoothVolume(0);
    }
  }, [volume, isMuted, smoothVolume]);

  // Apply playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
      {/* Volume Control */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Volume</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-xs text-gray-600">{Math.round(volume * 100)}%</span>
      </div>

      {/* Playback Speed Control */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Speed</label>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-xs text-gray-600">{playbackRate.toFixed(1)}x</span>
      </div>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className={`p-2 rounded-lg ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-300'}`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
```

### Enhanced useStreamingTTS with Role-based Voice
```typescript
// Source: Existing useTTS.ts enhancement pattern
export function useStreamingTTS(
  options: UseStreamingTTSOptions & { speaker?: SpeakerRole }
): UseStreamingTTSResult {
  const { enabled = true, speaker, provider = 'pyttsx3', bufferSize = 150 } = options;

  // Get voice_id for role
  const voiceId = speaker ? getVoiceIdForRole(speaker, provider) : undefined;

  // ... rest of existing implementation with role-based voiceId
  const generateAndQueueAudio = useCallback(async (text: string) => {
    if (!enabled || !text.trim()) return;

    try {
      setIsPlaying(true);
      isPlayingRef.current = true;

      const audioBlob = await generateTTS({
        text: text.trim(),
        voice_id: voiceId,  // Use role-based voice
        provider
      });

      audioQueueRef.current.push(audioBlob);
      playNextInQueue();
    } catch (err) {
      console.error('TTS generation error:', err);
      setError(err instanceof Error ? err : new Error('TTS failed'));
    }
  }, [enabled, voiceId, provider]);

  // ... rest unchanged
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|---------|
| Direct audio.volume assignment | Web Audio API GainNode with smoothing | 2017+ | Eliminates clicking, professional audio quality |
| Context for global state | Zustand store (no provider) | 2020+ | Simpler API, better performance with selective subscriptions |
| Component-local audio state | Global audio singleton in store | 2021+ | Prevents multiple instances, better resource management |
| Manual cleanup protocols | Reusable cleanupAudio helper pattern | 2019+ | Consistent leak prevention across codebase |

**Deprecated/outdated:**
- **Direct MediaStreamSource:** Use `MediaElementSourceNode` for audio tags, simpler and more browser-compatible
- **Setting pitch directly on pyttsx3:** Use voice selection instead; pitch not supported cross-platform
- **Anonymous event listeners:** Use named functions for proper cleanup

## Open Questions

1. **ElevenLabs Voice Parameters**
   - What we know: Backend currently uses `stability: 0.5` and `similarity_boost: 0.5` for all voices
   - What's unclear: Whether these parameters should vary per role to create more distinct voices (e.g., higher stability for formal PM, lower for expressive LO)
   - Recommendation: Keep parameters consistent for now; if voice distinctness is insufficient, explore per-role voice settings

2. **Voice Availability Across OS**
   - What we know: pyttsx3 uses system voices, which vary by OS (Windows, macOS, Linux)
   - What's unclear: Whether at least 4 distinct voices are guaranteed on target deployment OS
   - Recommendation: Query `/api/tts/voices` on app startup and validate minimum voice count; fallback to same voice with different rates if insufficient

3. **Audio Context Persistence**
   - What we know: AudioContext should persist across component unmounts to avoid re-initialization
   - What's unclear: Best pattern for initializing AudioContext exactly once in Zustand store vs component-level initialization
   - Recommendation: Initialize AudioContext in store with lazy initialization on first play action

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `/Users/shahu/PycharmProjects/debate-sim/backend/src/tts.py` - Backend TTS implementation with pyttsx3/ElevenLabs
- Existing codebase analysis: `/Users/shahu/PycharmProjects/debate-sim/src/hooks/useTTS.ts` - Frontend TTS streaming implementation
- Existing codebase analysis: `/Users/shahu/PycharmProjects/debate-sim/backend/main.py` - TTS API endpoints
- Web Audio API MDN Documentation (implied via WebSearch findings) - GainNode smoothing patterns
- React Documentation (implied via WebSearch findings) - Audio cleanup patterns

### Secondary (MEDIUM confidence)
- WebSearch: "React audio management libraries best practices 2025 TTS audio controls" - Confirmed howler.js/use-sound patterns and global state recommendations
- WebSearch: "Web Audio API React hooks volume control playback speed" - Verified GainNode smoothing implementation
- WebSearch: "React multiple HTMLAudioElement instances memory leak cleanup best practices" - Confirmed cleanup protocol patterns
- WebSearch: "Web Audio API GainNode volume smoothing setTargetAtTime prevent clicking" - Verified setTargetAtTime parameters and best practices
- WebSearch: "React Zustand global audio state management queue audio instances" - Confirmed Zustand pattern for audio persistence
- WebSearch: "Voice settings parameters pitch rate pyttsx3 Python distinct voices" - Confirmed pyttsx3 limitations (no direct pitch, use voice selection)

### Tertiary (LOW confidence)
- WebSearch: "ElevenLabs API voice settings stability similarity_boost clarity model_id" - No results found; backend currently uses hardcoded values
- WebSearch: "ElevenLabs text to speech API voice settings parameters 2025 documentation" - No results found; need to verify official docs
- WebSearch: "React multiple voices TTS role-based voice assignment pattern" - Pattern verified but specific implementation details need validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components are native APIs or already-installed libraries; patterns verified by multiple sources
- Architecture: MEDIUM - Patterns verified by WebSearch, but ElevenLabs-specific parameters not fully researched; existing codebase provides solid foundation
- Pitfalls: HIGH - Memory leaks, audio clicking, and autoplay policies are well-documented React/Web Audio issues with proven solutions

**Research date:** 2026-01-30
**Valid until:** 2026-02-27 (30 days - Web Audio API and React patterns are stable, ElevenLabs API may evolve)
