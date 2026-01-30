---
phase: 04-audio-enhancement
plan: 01
subsystem: audio
tags: [zustand, tts, voice-registry, audio-store, pyttsx3, elevenlabs]

# Dependency graph
requires:
  - phase: 03-streaming
    provides: Streaming text output foundation for TTS audio generation
  - phase: 02-ui-experience
    provides: Debate state management pattern for audio store consistency
provides:
  - Voice registry mapping CPDL debate roles (PM, LO, MO, PW) to distinct TTS voice IDs
  - Global audio state management store with volume/playback/mute/enable controls
  - Dual provider support (pyttsx3 local TTS and ElevenLabs cloud TTS)
affects: [04-02-audio-controls-ui, 04-03-tts-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zustand store pattern for global state management
    - Provider-agnostic voice registry architecture
    - Runtime-only audio state (no localStorage persistence)

key-files:
  created:
    - src/lib/voiceRegistry.ts - VoiceConfig interface and role-to-voice mappings
    - src/store/audioStore.ts - AudioState interface and useAudioStore hook
  modified: []

key-decisions:
  - "Voice registry supports both pyttsx3 (local) and ElevenLabs (cloud) TTS providers"
  - "Runtime-only audio state without localStorage persistence (simpler, session-scoped)"
  - "Voice IDs as strings for consistency across providers (indices for pyttsx3, UUIDs for ElevenLabs)"

patterns-established:
  - "Voice Registry Pattern: Record<SpeakerRole, VoiceConfig> maps roles to voice configurations"
  - "Dual Provider Pattern: Separate registries for each TTS provider with unified accessor functions"
  - "Zustand Store Pattern: State + actions following debateStore.ts conventions"

# Metrics
duration: 2 min
completed: 2026-01-30
---

# Phase 4 Plan 1: Audio Foundation Summary

**Voice registry mapping CPDL roles to distinct TTS voices (pyttsx3 indices 0-3, ElevenLabs UUIDs) and Zustand audio store for global volume/playback/mute state management**

## Performance

- **Duration:** 2 min (114 seconds)
- **Started:** 2026-01-30T10:59:04Z
- **Completed:** 2026-01-30T11:00:52Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created voice registry with role-based voice mappings for both pyttsx3 (local TTS) and ElevenLabs (cloud TTS) providers
- Implemented global audio state management using Zustand with volume, playback rate, mute, and enable/disable controls
- Established provider-agnostic architecture supporting multiple TTS backends

## Task Commits

Each task was committed atomically:

1. **Task 1: Create voice registry for role-based voice mapping** - `e6d9b1f` (feat)
2. **Task 2: Create audio store for global state management** - `df9531b` (feat)

**Plan metadata:** (pending after SUMMARY.md creation)

## Files Created/Modified

- `src/lib/voiceRegistry.ts` - VoiceConfig interface, PYTTSX3_VOICE_REGISTRY and ELEVENLABS_VOICE_REGISTRY mappings, getVoiceIdForRole() and getVoiceConfigForRole() accessor functions
- `src/store/audioStore.ts` - AudioState interface and useAudioStore Zustand hook with volume (0.0-2.0), playbackRate (0.5-2.5), isMuted, isEnabled state and corresponding actions

## Decisions Made

- Voice registry uses string IDs for consistency across providers (indices "0"-"3" for pyttsx3, UUIDs for ElevenLabs)
- Runtime-only audio state without localStorage persistence to keep implementation simple for initial audio features
- Dual provider architecture with separate registries (PYTTSX3_VOICE_REGISTRY, ELEVENLABS_VOICE_REGISTRY) but unified accessor functions (getVoiceIdForRole, getVoiceConfigForRole)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - both tasks completed successfully without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Voice registry and audio store foundation complete, ready for Phase 4-02 (audio controls UI) to create useAudioControls hook and AudioControls component for user interaction. Voice mappings align with backend expectations (backend/src/tts.py get_available_voices function). Audio state follows Zustand pattern consistent with existing debateStore.ts.

---
*Phase: 04-audio-enhancement*
*Completed: 2026-01-30*
