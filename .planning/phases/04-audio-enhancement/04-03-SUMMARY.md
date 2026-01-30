---
phase: 04-audio-enhancement
plan: 03
subsystem: audio
tags: [web-audio-api, tts, voice-registry, streaming-audio, react-hooks, zustand]

# Dependency graph
requires:
  - phase: 04-audio-enhancement (04-01)
    provides: Voice registry mapping roles to voice IDs, global audio store with state management
  - phase: 04-audio-enhancement (04-02)
    provides: useAudioControls hook with shared GainNode and smooth volume transitions, AudioControls UI component
provides:
  - Role-based voice selection in TTS hook using voice registry
  - Integration of TTS with streaming debate text in StreamingTranscriptEntry component
  - AudioControls component placement in DebateDashboard for global audio control
affects: [04-04, 05-judge-commentary]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Role-based voice selection pattern using speaker parameter
    - Global audio state integration via Zustand store (isEnabled check)
    - Shared GainNode connection for all TTS audio elements
    - Streaming TTS queue with voice-specific audio generation

key-files:
  created: []
  modified:
    - src/hooks/useTTS.ts - Enhanced useStreamingTTS with speaker parameter, audio store integration, and shared audio context connection
    - src/components/StreamingTranscriptEntry.tsx - Updated to pass speaker role to useStreamingTTS for voice selection
    - src/components/DebateDashboard.tsx - Added AudioControls component for global audio controls

key-decisions:
  - "Speaker role passed to useStreamingTTS for automatic voice selection via voice registry"
  - "Global isEnabled check in TTS generation prevents audio when disabled in AudioControls"
  - "Manual audio element creation in hook to apply applyGlobalVolume before playback"
  - "AudioControls positioned in dashboard after controls section for consistent UI layout"
  - "Standalone speakText function also supports speaker parameter for role-based voice selection"

patterns-established:
  - "Voice Selection Pattern: Pass speaker role to TTS hook, derive voice_id via getVoiceIdForRole()"
  - "Global Audio State Pattern: Check isEnabled from audioStore before TTS generation"
  - "Shared GainNode Connection Pattern: Call applyGlobalVolume(audioElement) on all TTS audio elements"
  - "Streaming TTS Integration Pattern: Queue text chunks during streaming, flush on completion, use speaker prop for voice"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 4 Plan 3: TTS Integration Summary

**Role-based voice selection integrated into streaming TTS with voice registry, audio store enable/disable control, and shared GainNode connection for global volume management**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T11:11:14Z
- **Completed:** 2026-01-30T11:15:53Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Enhanced useStreamingTTS hook with speaker parameter for role-based voice selection using voice registry
- Integrated global audio state (isEnabled) check to prevent TTS when disabled in AudioControls
- Modified TTS audio playback to connect all audio elements to shared GainNode via applyGlobalVolume
- Updated StreamingTranscriptEntry to pass speaker role to useStreamingTTS for distinct voices per speaker
- Added AudioControls component to DebateDashboard for global volume, speed, mute, and enable/disable controls
- All TTS audio now respects global audio settings (volume, playback rate, mute, enabled/disabled)

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance useStreamingTTS hook with role-based voice and audio store integration** - `e9f2168` (feat)
2. **Task 2: Integrate TTS into StreamingTranscriptEntry component** - `1de89ec` (feat)
3. **Task 3: Add AudioControls component to DebateDashboard** - `36a1743` (feat)

**Plan metadata:** (pending after SUMMARY.md creation)

## Files Created/Modified

- `src/hooks/useTTS.ts` - Added speaker parameter to UseStreamingTTSOptions, imported getVoiceIdForRole, useAudioStore, applyGlobalVolume, updated generateAndQueueAudio to derive voice_id from speaker, added isEnabled check, modified playNextInQueue to create audio elements manually and applyGlobalVolume, updated speakText function for speaker support
- `src/components/StreamingTranscriptEntry.tsx` - Updated useStreamingTTS hook call to pass speaker parameter for role-based voice selection
- `src/components/DebateDashboard.tsx` - Imported and added AudioControls component to dashboard layout (positioned after controls section, visible in all debate states)

## Decisions Made

- Speaker role parameter added to useStreamingTTS hook for automatic voice selection via getVoiceIdForRole() from voice registry
- Global isEnabled state check added to TTS generation to respect AudioControls enable/disable toggle
- Manual audio element creation in useStreamingTTS hook to applyGlobalVolume() before playback for shared GainNode connection
- AudioControls placed after controls section in dashboard for consistent UI layout with existing controls
- Standalone speakText() function also updated to support speaker parameter and audio store integration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all three tasks completed successfully without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

TTS integration complete with role-based voice selection. Each speaker (PM, LO, MO, PW) will use their distinct voice during streaming audio playback. Global audio controls (volume, speed, mute, enable/disable) now control all TTS audio through shared GainNode. AudioControls visible in dashboard for user interaction. Ready for Phase 4-04 (next plan in audio enhancement) or Phase 5 (Judge Commentary).

---
*Phase: 04-audio-enhancement*
*Completed: 2026-01-30*
