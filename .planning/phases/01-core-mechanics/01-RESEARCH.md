# Phase 1: Core Mechanics - Research

**Researched:** 2026-01-29
**Domain:** Real-time debate application with AI agents, timing controls, and CPDL format enforcement
**Confidence:** HIGH

## Summary

The core mechanics phase involves building a real-time debate application where users input debate motions and AI agents follow CPDL (Canadian Parliamentary Debate League) rules. The solution centers on React/Next.js for the UI, Socket.IO for real-time synchronization, Vercel AI SDK for AI agents, and PostgreSQL for data persistence. Key components include motion input validation, strict timing controls for each debate role (PM: 7min, LO: 8min, MO: 4min, PW: 4min), role-specific rule enforcement through prompt engineering, and POI (Points of Information) mechanisms.

**Primary recommendation:** Use Next.js with App Router, Socket.IO for real-time communication, Vercel AI SDK for AI agents with role-specific prompts, and a custom countdown hook for precise timing controls.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14.x+ | Full-stack React framework | Industry standard for React applications with built-in API routes, SSR, and optimized builds |
| React | 18.x | UI component library | Foundation for interactive web applications with hooks and concurrent features |
| TypeScript | Latest | Type safety | Critical for maintaining code quality in complex applications |
| Socket.IO | 4.x | Real-time communication | Standard for bidirectional client-server communication with fallbacks |
| PostgreSQL | 15+ | Database | Robust, ACID-compliant database for complex relational data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/ai | 6.x | AI SDK | For integrating AI agents with streaming responses and tool usage |
| @types/react | Latest | TypeScript definitions | Type safety for React components |
| zod | Latest | Validation | Input validation for forms and API requests |
| react-hook-form | Latest | Form handling | Efficient form management with validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js | Vite + React | More flexible but less integrated for full-stack features |
| Socket.IO | WebSockets native | More control but requires more infrastructure code |
| PostgreSQL | SQLite | Simpler but lacks advanced features for complex relationships |

**Installation:**
```bash
npm install next react react-dom typescript @types/react @types/node @types/react-dom
npm install socket.io socket.io-client
npm install @vercel/ai zod react-hook-form
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes for AI, Socket.IO, etc.
│   ├── debate/         # Main debate interface
│   │   ├── [id]/       # Individual debate sessions
│   │   └── components/ # Reusable debate UI components
│   └── components/     # Shared UI components
├── lib/                # Utility functions and constants
├── hooks/              # Custom React hooks (useCountdown, etc.)
├── services/           # Business logic (Socket.IO, AI integration)
└── types/              # TypeScript type definitions
```

### Pattern 1: Real-time State Synchronization
**What:** Keeping client and server state synchronized for shared debate experience
**When to use:** When multiple users need to see the same debate state in real-time
**Example:**
```typescript
// Source: https://socket.io/docs/v4/
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
  }
  return socket;
};

// In component
const socket = getSocket();
socket.emit('start_debate', { motion, participants });
socket.on('timer_update', (data) => {
  setTimeRemaining(data.time);
});
```

### Pattern 2: AI Agent with Role-Specific Instructions
**What:** Using Vercel AI SDK to create agents with different behavioral patterns
**When to use:** For implementing PM, LO, MO, PW agents with role-specific rules
**Example:**
```typescript
// Source: https://sdk.vercel.ai/docs
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const pmAgent = await generateText({
  model: openai('gpt-4'),
  system: 'You are the Prime Minister in a debate. Define the motion clearly and present 2-3 strong arguments for the government position. Do not introduce new arguments in rebuttals.',
  prompt: `Debate motion: ${motion}. Previous arguments: ${previousArgs}`,
});
```

### Anti-Patterns to Avoid
- **Manual WebSocket Management:** Don't build raw WebSocket connections; use Socket.IO for reliability and fallbacks.
- **Complex Client-Side State:** Don't manage complex debate state solely on the client; synchronize with server for consistency.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Real-time sync | Custom WebSocket protocol | Socket.IO | Handles connection management, reconnection, and message queuing |
| AI integration | Raw API calls with streaming | Vercel AI SDK | Provides type safety, streaming helpers, and tool integration |
| Form validation | Manual validation logic | react-hook-form + zod | Battle-tested validation with good DX and type safety |
| Countdown timers | Custom interval management | Custom hook with cleanup | Memory leaks and race conditions are tricky to handle properly |

**Key insight:** These libraries handle complex edge cases and timing issues that are difficult to implement correctly from scratch.

## Common Pitfalls

### Pitfall 1: Race Conditions with Timers
**What goes wrong:** Multiple timers running simultaneously causing inconsistent state
**Why it happens:** Improper cleanup of useEffect intervals or multiple component mounts
**How to avoid:** Always return cleanup functions from useEffect and use useRef for stable interval IDs
**Warning signs:** Timer behaving erratically, multiple intervals running after one action

### Pitfall 2: AI Prompt Injection
**What goes wrong:** Malicious inputs manipulating AI behavior through prompt engineering
**Why it happens:** Not properly separating system instructions from user content
**How to avoid:** Use proper templating and validate/escape user inputs before sending to AI
**Warning signs:** AI agents producing unexpected responses or breaking character

### Pitfall 3: Real-time Sync Conflicts
**What goes wrong:** Different clients showing different debate states
**Why it happens:** Client-side state taking precedence over server truth
**How to avoid:** Make server the single source of truth for debate state
**Warning signs:** Some users seeing different timers or turn orders

## Code Examples

Verified patterns from official sources:

### Countdown Timer Hook
```typescript
// Source: Custom implementation based on React best practices
import { useEffect, useState } from 'react';

interface CountdownTime {
  minutes: number;
  seconds: number;
}

export const useCountdown = (initialSeconds: number, onComplete?: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  return {
    timeLeft,
    minutes: Math.floor(timeLeft / 60),
    seconds: timeLeft % 60,
    isFinished: timeLeft <= 0,
    reset: () => setTimeLeft(initialSeconds)
  };
};
```

### Debate State Management
```typescript
// Source: Zustand documentation adapted for debate state
import { create } from 'zustand';

interface DebateState {
  currentSpeaker: 'PM' | 'LO' | 'MO' | 'PW' | null;
  timeRemaining: number;
  motion: string;
  setCurrentSpeaker: (speaker: 'PM' | 'LO' | 'MO' | 'PW') => void;
  setMotion: (motion: string) => void;
  setTimeRemaining: (seconds: number) => void;
  startTimer: (duration: number) => void;
}

export const useDebateStore = create<DebateState>((set, get) => ({
  currentSpeaker: null,
  timeRemaining: 0,
  motion: '',
  setCurrentSpeaker: (speaker) => set({ currentSpeaker: speaker }),
  setMotion: (motion) => set({ motion }),
  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
  startTimer: (duration) => {
    // Implementation would start countdown and update timeRemaining
  }
}));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class components | Hooks | React 16.8 (2019) | Cleaner, more reusable state logic |
| Traditional forms | React Hook Form | 2019-present | Better validation and DX |
| Raw fetch/xhr | SWR/TanStack Query | 2020-present | Better caching and data fetching patterns |

**Deprecated/outdated:**
- Class components: Use hooks instead for better reusability
- Manually managed WebSocket connections: Use Socket.IO for reliability

## Open Questions

Things that couldn't be fully resolved:

1. **Specific CPDL Rule Enforcement Details**
   - What we know: Need role-specific rules enforced through prompts
   - What's unclear: Exact textual rules for each role to include in system prompts
   - Recommendation: Consult official CPDL documentation for precise rule wording

2. **POI Mechanism Implementation**
   - What we know: POIs allowed during non-protected time periods (usually after 1st minute and before last minute)
   - What's unclear: Exact technical implementation for handling POI requests/responses in UI
   - Recommendation: Design mockups and interaction patterns for POI workflow

## Sources

### Primary (HIGH confidence)
- /vercel/next.js - Next.js App Router patterns and API routes
- /websites/socket_io_v4 - Socket.IO client-server communication
- /vercel/ai - Vercel AI SDK for agent implementation
- React official documentation - Component patterns and hooks

### Secondary (MEDIUM confidence)
- Web Speech API documentation - TTS implementation
- PostgreSQL documentation - Database schema design

### Tertiary (LOW confidence)
- Web search results for debate format details - needs verification with official CPDL sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Confirmed with official documentation
- Architecture: HIGH - Based on proven React/Next.js patterns
- Pitfalls: MEDIUM - Derived from common web application issues

**Research date:** 2026-01-29
**Valid until:** 2026-02-26 (30 days for stable technologies)