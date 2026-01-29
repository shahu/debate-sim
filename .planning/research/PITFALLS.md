# Pitfalls Research

**Domain:** CPDL Debate Simulator - Interactive web application simulating Canadian Parliamentary Debate format with AI agents
**Researched:** Thu Jan 29 2026
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: State Update Overload During Streaming

**What goes wrong:**
React re-renders the entire debate interface every time a new token arrives from AI agents, causing severe performance degradation and input lag during live debates.

**Why it happens:**
Developers update a large "messages" state array with every character/token from streaming text output, triggering full re-renders of all debate components as text streams in real-time.

**How to avoid:**
- Use localized state for only the currently streaming message component
- Implement throttling/batching to update UI every 50ms rather than per token
- Wrap previous debate segments in `React.memo` to prevent unnecessary re-renders
- Consider using `useReducer` with optimized dispatches instead of frequent `useState` updates

**Warning signs:**
- Input field becomes laggy/choppy while AI agents are speaking
- High CPU usage during streaming
- Frame drops in the UI during live debates

**Phase to address:**
Implementation Phase - Streaming Text Output

---

### Pitfall 2: Positional and Verbosity Bias in AI Judges

**What goes wrong:**
AI judge agents consistently favor longer speeches or first/last speakers regardless of actual argument quality, undermining the educational value of the simulator.

**Why it happens:**
AI evaluation logic inherits LLM biases toward verbose responses and positional primacy/recency effects, failing to implement proper "flow" tracking of argument relationships.

**How to avoid:**
- Implement modular judge architecture with separate Evidence Verifier, Logic Mapper, and Final Scorer components
- Use knowledge graphs to track which arguments were addressed (proper "flowing")
- Run evaluations with randomized speech order to mitigate positional bias
- Implement explicit impact calculus logic to weight significance of arguments

**Warning signs:**
- Consistent winners based on speech length rather than quality
- First or last speakers winning disproportionately
- Weak arguments being scored highly due to eloquent phrasing

**Phase to address:**
Implementation Phase - Judge Logic System

---

### Pitfall 3: Network Buffering Killing Real-time Experience

**What goes wrong:**
Despite implementing streaming text, users experience delayed "bursts" of text instead of smooth, real-time output due to proxy and compression middleware buffering.

**Why it happens:**
Intermediate proxies (Nginx, Cloudflare, load balancers) buffer responses by default to optimize throughput, while compression middleware prevents immediate token delivery.

**How to avoid:**
- Set `X-Accel-Buffering: no` header for Nginx
- Configure server-side framework to flush response buffer after every token
- Use Server-Sent Events (SSE) instead of WebSockets for one-way text streaming
- Implement proper `TextDecoder` for handling multi-byte characters safely

**Warning signs:**
- Streaming text arrives in large chunks instead of character-by-character
- Noticeable delay between AI decision and text appearance
- Partial characters showing as replacement symbols

**Phase to address:**
Infrastructure Phase - Streaming Transport Layer

---

### Pitfall 4: Layout Thrashing During Live Debate

**What goes wrong:**
As AI agents speak and text accumulates, the debate interface constantly shifts, jumps, and scrolls unpredictably, creating a poor user experience.

**Why it happens:**
Dynamic content growth triggers continuous layout recalculations, and auto-scrolling forces users away from reviewing previous arguments during ongoing debates.

**How to avoid:**
- Implement "smart" scrolling that only auto-scrolls when user is already near bottom
- Use CSS `overflow-anchor: auto` to maintain natural scroll position
- Pre-calculate minimum heights for message containers to prevent layout shifts
- Virtualize long debate histories to prevent DOM bloat

**Warning signs:**
- Page jumps unexpectedly while reading previous arguments
- Auto-scroll forces user to bottom during ongoing debate
- Interface becomes sluggish as debate grows longer

**Phase to address:**
Implementation Phase - UI/UX Components

---

### Pitfall 5: TTS Latency Destroying Debate Rhythm

**What goes wrong:**
Voice synthesis delays break the natural rhythm of debate rounds, making the experience feel artificial and disrupting timing-dependent argumentation strategies.

**Why it happens:**
Using computationally expensive TTS models without streaming architecture, cold-start delays, or inadequate hardware optimization for real-time audio generation.

**How to avoid:**
- Use non-autoregressive TTS models (FastSpeech, E2) instead of autoregressive ones
- Implement chunked streaming audio delivery rather than full-sentence synthesis
- Apply quantization (INT8) to reduce model size and improve speed
- Pre-warm TTS models to eliminate cold-start delays
- Use compressed audio formats (OPUS) for low-latency delivery

**Warning signs:**
- Long pauses before AI agents begin speaking
- Audio stuttering or dropouts during speech
- First-byte latency exceeding 300ms

**Phase to address:**
Implementation Phase - Voice Synthesis System

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Global state for debate flow | Fast initial implementation | Performance bottlenecks during streaming | Never |
| Single-threaded TTS processing | Simpler architecture | Audio blocking UI interactions | MVP only |
| Client-side only evaluation | Faster iteration | Eval logic exposed and manipulable | Never |
| Plain text argument comparison | Quick prototype | Misses logical relationships | MVP only |
| Full DOM rendering of all turns | Simple implementation | Severe performance degradation | MVP only |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| LLM APIs | Streaming without error handling | Implement AbortController for stream interruption |
| TTS Engines | Sync processing instead of streaming | Use chunked audio with proper buffering |
| Debate Rules | Hard-coded formats instead of configurable | Abstract rule engine for various formats |
| WebSocket | No reconnection logic | Implement exponential backoff for connection drops |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| DOM Accumulation | Interface slows over time | Virtualize debate history | 100+ debate turns |
| String Concatenation | GC pauses during long speeches | Use arrays with join() or ReadableStream | 5000+ character responses |
| Unoptimized NLP | High latency in judgment | Use cached embeddings, batch processing | Concurrent debates |
| Sync TTS Calls | Audio blocking UI | Web workers, async processing | Multiple simultaneous agents |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing eval logic | Users manipulate scoring | Server-side evaluation only |
| Prompt injection in agents | Manipulated debate outcomes | Input sanitization, role separation |
| Unvalidated debate content | Malicious content propagation | Content filtering, moderation layer |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Forced auto-scroll | Can't review previous arguments | Smart scroll that respects user position |
| Interruptible speeches | Disrupted debate flow | Allow completion of current thought |
| No pause/resume | Can't control pace | Implement debate controls |
| Inconsistent speaker identification | Confusion about who is speaking | Clear visual/audio differentiation |

## "Looks Done But Isn't" Checklist

- [ ] **Streaming**: Tested with slow network conditions, not just localhost
- [ ] **TTS**: Verified first-byte latency under 300ms at scale
- [ ] **Judge Logic**: Tested with randomized speech order to verify no positional bias
- [ ] **Debate Rules**: Verified compliance with official CPDL format specifications
- [ ] **Accessibility**: Screen reader compatibility tested for streaming content

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| State Update Overload | MEDIUM | Refactor to localized state, implement memoization |
| Judge Bias Issues | HIGH | Rebuild evaluation logic with modular architecture |
| Network Buffering | LOW | Adjust proxy headers, verify streaming transport |
| TTS Latency | MEDIUM | Optimize model, switch to streaming architecture |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| State Updates | Implementation - Streaming | Performance testing during live debates |
| Judge Bias | Implementation - Judge Logic | Audit with balanced debate datasets |
| Network Buffering | Infrastructure | Test through production-like proxies |
| TTS Latency | Implementation - Voice System | Measure first-byte latency metrics |
| Layout Thrashing | Implementation - UI Components | Scroll behavior testing with long debates |

## Sources

- React state management pitfalls from react.dev documentation
- AI streaming implementation challenges from industry best practices
- TTS performance optimization patterns from real-time voice applications
- Debate judging evaluation logic from academic research on automated assessment
- Web application performance patterns for streaming text interfaces

---
*Pitfalls research for: CPDL Debate Simulator*
*Researched: Thu Jan 29 2026*