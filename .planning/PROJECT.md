# CPDL Debate Simulator

## What This Is

A rich interactive web application that simulates Canadian Parliamentary Debate (CPDL) format debates using AI agents. The application features 4 AI-controlled debaters (PM, LO, MO, PW) that engage in structured debates following CPDL rules, with streaming text output, TTS voice synthesis, and detailed judge-like commentary post-debate. Designed primarily for competitive debaters to practice and analyze debate techniques.

## Core Value

Competitive debaters can practice realistic CPDL debates against AI opponents that strictly follow debate rules and provide sophisticated feedback, enabling them to improve their argumentation, rebuttal, and POI handling skills in a controlled environment.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Support for 4 CPDL roles (PM, LO, MO, PW) with rule enforcement
- [ ] Rich interactive UI with streaming text and TTS playback
- [ ] Judge-like commentary scoring system with narrative feedback
- [ ] Time-controlled debate flow (15 min total)
- [ ] POI (Points of Information) mechanism integration
- [ ] API integration for AI agents (DeepSeekV3)

### Out of Scope

- Multiplayer human vs human debates — AI vs AI only for v1
- Offline/local model support without API — cloud-based initially
- Advanced tournament bracket management — single debate focus
- Customizable debate formats beyond CPDL — stick to one format

## Context

The application targets competitive debaters who need to practice against consistent, rule-following opponents. The AI agents must strictly adhere to CPDL rules (e.g., LO must challenge PM's definition, MO/PW can't introduce new arguments). The rich UI will provide an immersive experience with streaming text, distinct voices for each role, and detailed post-debate analysis.

## Constraints

- **Timeline**: 15-minute maximum debate duration — content length must match timing
- **API Dependency**: Requires third-party AI API access — needs robust error handling
- **Browser Compatibility**: Must work with Web Speech API for TTS functionality
- **Performance**: Streaming text and TTS must be synchronized for smooth experience

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rich Interactive UI | Competitive debaters need detailed feedback and engagement | — Pending |
| Judge-like Commentary Scoring | Narrative feedback more valuable than simple scores | — Pending |
| CPDL Rules Enforcement | Core to authentic debate simulation | — Pending |

---
*Last updated: 2026-01-29 after initialization*