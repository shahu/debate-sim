# Requirements: CPDL Debate Simulator

**Defined:** 2026-01-29
**Core Value:** Competitive debaters can practice realistic CPDL debates against AI opponents that strictly follow debate rules and provide sophisticated feedback, enabling them to improve their argumentation, rebuttal, and POI handling skills in a controlled environment.

## v1 Requirements

### Debate Mechanics

- [ ] **MECH-01**: User can input debate motion in "This House believes that..." format
- [ ] **MECH-02**: System enforces strict CPDL format with 4 roles (PM, LO, MO, PW)
- [ ] **MECH-03**: System enforces correct timing for each role (PM: 7min, LO: 8min, MO: 4min, PW: 4min)
- [ ] **MECH-04**: System enforces role-specific rules (LO must challenge PM definition, MO/PW can't introduce new arguments)
- [ ] **MECH-05**: System implements POI (Points of Information) mechanism during non-protected time periods
- [ ] **MECH-06**: System provides real-time turn synchronization between speakers

### AI Agents

- [ ] **AIAG-01**: Each role (PM, LO, MO, PW) has an AI agent that generates appropriate responses
- [ ] **AIAG-02**: AI agents maintain context of previous debate content and incorporate it
- [ ] **AIAG-03**: AI agents follow role-specific behavioral patterns and argumentation styles
- [ ] **AIAG-04**: AI agents generate content that adheres to CPDL rules and format requirements
- [ ] **AIAG-05**: AI agents respond appropriately to POIs when they are inserted

### User Interface

- [ ] **UI-01**: Dashboard interface displays current speaker and remaining time clearly
- [ ] **UI-02**: Each debater's text is displayed with distinct styling/colors for easy identification
- [ ] **UI-03**: Real-time display updates as debate progresses with smooth transitions
- [ ] **UI-04**: Control buttons available for pause/restart functionality
- [ ] **UI-05**: Rich interactive elements engage the user throughout the debate
- [ ] **UI-06**: Visual indicators show debate flow and current phase

### Streaming & Audio

- [x] **STRM-01**: Text output streams in real-time as AI generates content
- [ ] **STRM-02**: TTS voice synthesis provides audio output for each role
- [ ] **STRM-03**: Each role has a distinct voice characteristic (pitch, tone, etc.)
- [ ] **STRM-04**: Streaming text and audio are synchronized for natural feel
- [ ] **STRM-05**: TTS latency is minimized to maintain natural debate rhythm
- [ ] **STRM-06**: Audio controls allow user to adjust volume and playback

### Scoring & Feedback

- [x] **SCOR-01**: Post-debate scoring provides numerical scores for each participant
- [x] **SCOR-02**: Judge-like narrative commentary explains strengths and weaknesses of each speaker
- [x] **SCOR-03**: Detailed breakdown by evaluation criteria (content, rebuttal, POI handling, delivery, teamwork)
- [x] **SCOR-04**: Comparative analysis highlights differences between speakers' performances
- [x] **SCOR-05**: Judges provide specific examples from the debate to justify their assessments

## v2 Requirements

### Advanced Features

- **ADV-01**: Tournament bracket management system
- **ADV-02**: Multiple debate format support beyond CPDL
- **ADV-03**: Customizable AI difficulty levels
- **ADV-04**: Detailed analytics and performance tracking over time
- **ADV-05**: Export debate transcripts for review

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer human vs human debates | Focus on AI practice for v1 |
| Offline/local model support without API | Cloud-based AI integration is core requirement |
| Advanced tournament bracket management | Beyond scope of single debate simulator |
| Customizable debate formats beyond CPDL | Stick to one format for initial release |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MECH-01 | Phase 1 | Complete |
| MECH-02 | Phase 1 | Complete |
| MECH-03 | Phase 1 | Complete |
| MECH-04 | Phase 1 | Complete |
| MECH-05 | Phase 1 | Complete |
| MECH-06 | Phase 1 | Complete |
| AIAG-01 | Phase 1 | Complete |
| AIAG-02 | Phase 1 | Complete |
| AIAG-03 | Phase 1 | Complete |
| AIAG-04 | Phase 1 | Complete |
| AIAG-05 | Phase 1 | Complete |
| UI-01 | Phase 2 | Complete |
| UI-02 | Phase 2 | Complete |
| UI-03 | Phase 2 | Complete |
| UI-04 | Phase 2 | Complete |
| UI-05 | Phase 2 | Complete |
| UI-06 | Phase 2 | Complete |
| STRM-01 | Phase 3 | Pending |
| STRM-04 | Phase 3 | Pending |
| STRM-05 | Phase 3 | Pending |
| STRM-02 | Phase 4 | Pending |
| STRM-03 | Phase 4 | Pending |
| STRM-06 | Phase 4 | Pending |
| SCOR-01 | Phase 5 | Complete |
| SCOR-02 | Phase 5 | Complete |
| SCOR-03 | Phase 5 | Complete |
| SCOR-04 | Phase 5 | Complete |
| SCOR-05 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after initial definition*