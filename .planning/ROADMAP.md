# Roadmap: CPDL Debate Simulator

**Version:** 1.0  
**Created:** 2026-01-29  
**Depth:** Quick  

## Overview

The CPDL Debate Simulator roadmap delivers a rich interactive web application that simulates Canadian Parliamentary Debate (CPDL) format debates using AI agents. The phased approach builds from core mechanics through streaming audio to sophisticated judging feedback, ensuring each phase delivers coherent value.

## Phases

### Phase 1 - Core Mechanics
**Goal:** Users can start a debate with motion input and see AI agents follow CPDL rules

**Dependencies:** None (foundation phase)

**Plans:** 3 plans (3/3 complete)

**Requirements:** MECH-01, MECH-02, MECH-03, MECH-04, MECH-05, MECH-06, AIAG-01, AIAG-02, AIAG-03, AIAG-04, AIAG-05

**Success Criteria:**
1. User can input debate motion and start debate with 4 AI agents following CPDL rules
2. System enforces correct timing for each role (PM: 7min, LO: 8min, MO: 4min, PW: 4min)
3. AI agents generate appropriate responses following role-specific behavioral patterns
4. System implements POI mechanism during non-protected time periods

**Plans:**
- [x] 01-01-PLAN.md — Core types, constants, and timer functionality
- [x] 01-02-PLAN.md — Rule enforcement and timer hook implementation  
- [x] 01-03-PLAN.md — AI agents, debate engine, and POI mechanism

### Phase 2 - UI Experience
**Goal:** Users can see the debate unfold with clear visual representation

**Dependencies:** Phase 1 (needs core mechanics to display)

**Plans:** 3 plans (3/3 complete)

**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-06

**Success Criteria:**
1. Dashboard interface displays current speaker and remaining time clearly
2. Each debater's text is displayed with distinct styling/colors for easy identification
3. Real-time display updates as debate progresses with smooth transitions
4. User can see visual indicators showing debate flow and current phase

**Plans:**
- [x] 02-01-PLAN.md — Dashboard foundation with speaker indicator, timer, and role colors
- [x] 02-02-PLAN.md — Controls (pause/restart), flow indicator, and smooth transitions
- [x] 02-03-PLAN.md — Interactive elements (transcript, motion input, POI controls)

### Phase 3 - Streaming
**Goal:** Users see real-time text streaming as debate unfolds

**Dependencies:** Phase 1 (needs core mechanics), Phase 2 (needs UI to display stream)

**Plans:** 3 plans (3/3 complete)

**Requirements:** STRM-01, STRM-04, STRM-05

**Success Criteria:**
1. Text output streams in real-time as AI generates content during debate
2. Streaming text and any audio are synchronized for natural feel
3. TTS latency is minimized to maintain natural debate rhythm

**Plans:**
- [x] 03-01-PLAN.md — AI streaming foundation with buffered display hook
- [x] 03-02-PLAN.md — UI components for real-time streaming transcript
- [x] 03-03-PLAN.md — End-to-end integration and verification

### Phase 4 - Audio Enhancement
**Goal:** Users can hear the debate with distinct voices for each role

**Dependencies:** Phase 1 (needs core mechanics), Phase 2 (needs UI), Phase 3 (needs streaming text as basis)

**Plans:** 3 plans (1/3 complete)

**Requirements:** STRM-02, STRM-03, STRM-06

**Success Criteria:**
1. Each role has a distinct voice characteristic (pitch, tone, etc.) for audio output
2. TTS voice synthesis provides audio output for each role during streaming
3. Audio controls allow user to adjust volume and playback during the debate

**Plans:**
- [x] 04-01-PLAN.md — Audio foundation (voice registry + audio store)
- [ ] 04-02-PLAN.md — Audio controls UI (useAudioControls hook + AudioControls component)
- [ ] 04-03-PLAN.md — TTS integration with role-based voices

### Phase 5 - Judge Commentary
**Goal:** Users receive post-debate scoring and detailed feedback

**Dependencies:** Phase 1 (needs core debate to evaluate), Phase 2 (needs UI to display results)

**Requirements:** SCOR-01, SCOR-02, SCOR-03, SCOR-04, SCOR-05

**Success Criteria:**
1. Post-debate scoring provides numerical scores for each participant
2. Judge-like narrative commentary explains strengths and weaknesses of each speaker
3. Detailed breakdown by evaluation criteria (content, rebuttal, POI handling, delivery, teamwork)
4. Comparative analysis highlights differences between speakers' performances

**Plans:**
- [ ] TBD — Post-debate scoring system

## Progress Tracking

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| Phase 1 | Complete | 2026-01-29 | 2026-01-29 | Foundation for entire application |
| Phase 2 | Complete | 2026-01-29 | 2026-01-29 | Full UI experience with controls |
| Phase 3 | Complete | 2026-01-30 | 2026-01-30 | Real-time streaming with ref-based accumulation and rAF throttling |
| Phase 4 | In progress | 2026-01-30 | - | 1/3 plans complete (voice registry + audio store) |
| Phase 5 | Pending | - | - | Depends on Phases 1 & 2 completion |

**Total Requirements Mapped:** 25/25 v1 requirements