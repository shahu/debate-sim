# Feature Research

**Domain:** CPDL Debate Simulator - Canadian Parliamentary Debate format with AI agents
**Researched:** Thu Jan 29 2026
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Motion Generation | Users expect varied debate topics | LOW | Should support Canadian Parliamentary format with contextual complexity |
| Role-Based Speaking Structure | CP format has specific speaker order (PM, LO, MG, MO) | MEDIUM | Must enforce proper roles and speaking times |
| Timed Rounds | Standard debate timing (constructive/ rebuttal periods) | LOW | Essential for proper practice and simulation |
| Points of Information (POI) Handling | Critical part of Canadian Parliamentary format | MEDIUM | Must allow and regulate POIs appropriately |
| Basic AI Opponent | Users need someone to debate against | MEDIUM | Should generate coherent arguments and respond to user input |
| Simple Score Tracking | Users need to track wins/losses or speaker scores | LOW | Basic scorekeeping for practice sessions |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Streaming Text Output | Creates real-time feeling of live debate | MEDIUM | Shows AI thoughts as they develop, increasing engagement |
| TTS Voice Synthesis | Makes debates feel more authentic and immersive | MEDIUM-HIGH | Multiple distinct voices for different debate roles |
| Detailed Judge-Like Commentary | Provides educational feedback like a real judge | HIGH | Evaluates arguments, identifies clashes, explains decision |
| Argument Mapping ("Flowing") | Tracks arguments across speakers and speeches | HIGH | Visual representation of the debate structure |
| Logical Fallacy Detection | Helps users improve argumentation skills | HIGH | Identifies and explains flawed reasoning |
| POI Integration During Speeches | Allows interruptive POIs mid-speech like real CP | HIGH | Complex technical implementation needed |
| Performance Analytics | Tracks improvement over time | MEDIUM | Speaker scores, argument effectiveness metrics |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Unlimited Chat Mode | Users want to "chat" with AI | Dilutes focus on structured debate | Clearly separate debate mode from chat mode |
| Extremely Long Speeches | Some want extensive time limits | Doesn't reflect tournament reality | Stick to standard CP time limits |
| "Perfect" AI Debater | Users want unbeatable opponent | Discourages learning, creates frustration | Adjustable difficulty levels |
| Real-time Video Integration | Wants face-to-face experience | Adds complexity, reduces accessibility | Focus on audio/visual text first |

## Feature Dependencies

```
Motion Generation
    └──requires──> Basic AI Opponent
                   └──requires──> Role-Based Speaking Structure

Streaming Text Output
    └──requires──> Basic AI Opponent

TTS Voice Synthesis
    └──requires──> Streaming Text Output

Detailed Judge-Like Commentary
    └──requires──> Argument Mapping
    └──requires──> Role-Based Speaking Structure

POI Integration
    └──requires──> Timed Rounds
    └──requires──> Role-Based Speaking Structure
```

### Dependency Notes

- **Motion Generation requires Basic AI Opponent:** No point in having motions without an AI to debate against
- **TTS Voice Synthesis requires Streaming Text Output:** Need text to synthesize into speech
- **Detailed Judge Commentary requires Argument Mapping:** Judge needs to track arguments to provide meaningful feedback
- **POI Integration requires Timed Rounds:** POIs have specific timing rules in CP format

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Motion Generation — Users can get debate topics for CP format
- [ ] Role-Based Speaking Structure — Enforces proper CP speaker order
- [ ] Basic AI Opponent — Generates arguments and responds to user
- [ ] Timed Rounds — Proper time limits for speeches
- [ ] Simple Score Tracking — Track basic results

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Streaming Text Output — Show AI thoughts as they develop
- [ ] TTS Voice Synthesis — More immersive experience with audio
- [ ] Basic Judge Feedback — Simple evaluation of arguments

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Advanced Argument Mapping — Visual flow tracking
- [ ] Logical Fallacy Detection — Advanced educational feedback
- [ ] POI Integration During Speeches — Real-time interrupts
- [ ] Performance Analytics — Improvement tracking

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Motion Generation | HIGH | LOW | P1 |
| Role-Based Speaking Structure | HIGH | MEDIUM | P1 |
| Timed Rounds | HIGH | LOW | P1 |
| Basic AI Opponent | HIGH | MEDIUM | P1 |
| Simple Score Tracking | MEDIUM | LOW | P1 |
| Streaming Text Output | HIGH | MEDIUM | P2 |
| TTS Voice Synthesis | HIGH | MEDIUM-HIGH | P2 |
| Detailed Judge Commentary | HIGH | HIGH | P3 |
| Argument Mapping | MEDIUM-HIGH | HIGH | P3 |
| POI Integration | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Tabbycat | Debate Keeper | MixIdea | AI Simulators | Our Approach |
|---------|----------|---------------|---------|---------------|--------------|
| Motion Generation | Limited | No | No | Manual setup | Automated CP-specific |
| Role-Based Structure | Excellent | No | Good | Limited | Full CP compliance |
| Timed Rounds | Via ballots | Excellent | Good | No | Standard CP timing |
| AI Opponent | No | No | No | Basic | Advanced CP-focused |
| Judge Commentary | Human judges | No | Basic scoring | AI feedback | Detailed CP expertise |
| Streaming Text | No | No | No | Some | Yes, core feature |
| TTS Voice | No | No | No | Some | Multi-role voices |

## Sources

- Research on CPDL and parliamentary debate simulator tools
- Analysis of existing debate platforms (Tabbycat, Debate Keeper, MixIdea)
- Investigation of AI debate simulators with streaming and TTS features
- Understanding of parliamentary debate judging and evaluation criteria

---
*Feature research for: CPDL Debate Simulator*
*Researched: Thu Jan 29 2026*