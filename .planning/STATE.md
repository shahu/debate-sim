# STATE: CPDL Debate Simulator

## Project Reference

**Core Value:** Competitive debaters can practice realistic CPDL debates against AI opponents that strictly follow debate rules and provide sophisticated feedback, enabling them to improve their argumentation, rebuttal, and POI handling skills in a controlled environment.

**Current Focus:** Phase 4 - Audio Enhancement - implementing voice-based TTS

## Current Position

**Current Phase:** 4 of 5 (Audio Enhancement) - Complete
**Plan:** 3 of 3 in current phase
**Status:** Phase complete, ready for Phase 5
**Last activity:** 2026-01-30 - Completed 04-03-PLAN.md

```
[██████████] 100% (12/12 plans)
```

## Performance Metrics

- **Phases:** 5 total
- **Requirements:** 25 v1 requirements
- **Completed:** 17/25 (Phase 1: 11, Phase 2: 6)
- **Velocity:** 2 phases per session

## Accumulated Context

### Decisions Made
- Phased development approach with 5 phases
- Phase 1 (Core Mechanics) - Complete
- Phase 2 (UI Experience) - Complete
- Phase 3 (Streaming) - Complete
- Phase 4 (Audio Enhancement) - Complete
- Phase 5 (Judge Commentary) - Pending
- Technology stack: React/Vite, TypeScript, Zustand, Tailwind CSS
- Fire-and-forget streaming architecture (engine initiates, hooks manage)
- Streaming generator pattern using async generators for real-time text
- Store-based streaming lifecycle (startStreamingEntry → finalizeStreamingEntry)
- Error handling with cancelStreamingEntry for clean state cleanup
- Voice registry dual provider architecture (pyttsx3 local + ElevenLabs cloud)
- Runtime-only audio state (no localStorage persistence for simplicity)
- Web Audio API GainNode with setTargetAtTime for 20ms smooth volume transitions
- Shared singleton GainNode (module-level refs) for global volume control
- Lazy AudioContext initialization on user gesture (browser autoplay policy compliance)
- Speaker role passed to TTS hook for automatic voice selection via getVoiceIdForRole()
- Global isEnabled check in TTS generation respects AudioControls enable/disable toggle
- Manual audio element creation in hook to applyGlobalVolume() before playback for shared GainNode connection

### Completed Work
- Core types and debate state management
- Timer functionality with role-specific durations
- Rule enforcement and POI mechanism
- AI agent creation with role-specific prompts
- Full dashboard UI with speaker indicator and timer
- Role-colored speaker cards
- Debate controls (pause/resume/restart)
- Flow indicator showing debate progress
- Motion input with validation
- POI controls with protected time display
- Transcript panel with auto-scroll
- Streaming foundation with buffered display hook
- Streaming transcript entry component with visual indicators
- Streaming state management in debate store
- TranscriptPanel integration with streaming entries
- End-to-end streaming pipeline (AI → engine → store → UI)
- Fire-and-forget streaming architecture in debate engine
- Automatic streaming initiation on debate start
- Error handling with streaming cancellation cleanup
- Voice registry with role-based voice mappings for pyttsx3 and ElevenLabs
- Audio store with global state management (volume, playback rate, mute, enable/disable)
- useAudioControls hook with Web Audio API GainNode for smooth volume transitions
- AudioControls component with volume slider (0-200%), speed slider (0.5x-2.5x), mute toggle, enable toggle
- Role-based TTS voice selection via voice registry integration in useStreamingTTS hook
- Global audio state integration (isEnabled check) in TTS generation
- Shared GainNode connection for all TTS audio elements via applyGlobalVolume()
- StreamingTranscriptEntry passes speaker role to TTS for distinct voices per speaker
- AudioControls component visible in DebateDashboard for global audio control

### Blockers
- None identified

### Dependencies
- Third-party AI API access for DeepSeekV3
- Web Speech API for TTS functionality (Phase 4)

## Quick Tasks

### Completed
- **001-create-python-backend-llm-tts-api** (2026-01-30)
  - Created Python FastAPI backend with DeepSeek streaming and TTS
  - Refactored frontend to use backend API instead of direct SDK
  - Removed @ai-sdk packages, API keys now server-side only
  - SUMMARY: `.planning/quick/001-create-python-backend-llm-tts-api/001-SUMMARY.md`

## Session Continuity

Last session: 2026-01-30
Stopped at: Completed 04-03-PLAN.md (TTS integration)
Resume file: `.planning/phases/04-audio-enhancement/04-03-SUMMARY.md`
