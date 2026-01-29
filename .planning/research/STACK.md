# Stack Research

**Domain:** CPDL Debate Simulator - Interactive web application for Canadian Parliamentary Debate format with AI agents
**Researched:** Thu Jan 29 2026
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.0 | UI framework | Industry standard for interactive web applications with component-based architecture |
| Next.js | 15.1.8 | Full-stack framework | Provides SSR, API routes, and optimized bundling for complex applications like debate simulators |
| TypeScript | 5.7.2 | Type safety | Critical for managing complex debate state, AI agent interactions, and preventing runtime errors |
| Node.js | 22.x | Runtime environment | Powers backend services, AI integration, and real-time communication |
| PostgreSQL | 16.x | Database | Robust, ACID-compliant DB perfect for storing debate sessions, user profiles, and historical data |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.8 | State management | Managing complex real-time debate state (timers, turn tracking, speaker positions) |
| Socket.IO | 4.8.1 | Real-time communication | Synchronizing debate turns, timers, and live interactions between users |
| Vercel AI SDK | 6.0.0-beta | AI streaming | Streaming AI-generated debate responses and judge commentary |
| Deepgram TTS | Latest | Text-to-speech | High-quality voice synthesis for realistic AI debate voices |
| Prisma ORM | 6.19.2 | Database access | Type-safe database operations with PostgreSQL for storing debate sessions |
| Clerk | Latest | Authentication | Secure user management for competitive debaters and tournament organizers |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Tailwind CSS | Styling | Rapid UI development with utility-first approach for complex debate interfaces |
| shadcn/ui | UI components | Pre-built accessible components for rapid debate simulator UI development |
| Vitest | Testing | Fast, Vite-native testing framework for both unit and integration tests |
| ESLint + Prettier | Code quality | Maintaining consistent code quality across complex debate logic |
| Vercel | Deployment | Seamless deployment for Next.js applications with edge capabilities |

## Installation

```bash
# Core
npm install react@19.2.0 react-dom@19.2.0 next@15.1.8 typescript@5.7.2

# Supporting
npm install zustand@5.0.8 socket.io socket.io-client @ai-sdk/openai ai@6.0.0-beta postgresql prisma @prisma/client @clerk/nextjs deepgram-sdk

# Dev dependencies
npm install -D vitest @vitest/browser vitest-browser-react tailwindcss@latest @tailwindcss/postcss shadcn-ui
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Zustand | Redux Toolkit | Use Redux for extremely complex state with many interconnected parts |
| Socket.IO | WebSockets (vanilla) | Use vanilla WebSockets for simpler real-time needs with less overhead |
| Deepgram | ElevenLabs | Use ElevenLabs for premium voice quality at higher cost |
| PostgreSQL | MongoDB | Use MongoDB for more flexible schema needs (though not recommended for debate data) |
| Clerk | Auth.js | Use Auth.js for more customization control over authentication flow |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Class components in React | Outdated pattern, harder to manage complex state | Functional components with Hooks |
| Redux (traditional) | Overkill for this application, adds complexity | Zustand for simpler, more maintainable state management |
| Long-polling | Higher latency than real-time | Socket.IO for true real-time debate interactions |
| Client-side only storage | Unreliable for persistent debate data | PostgreSQL with Prisma for durable data |
| Custom authentication | Security risks, reinventing the wheel | Clerk for battle-tested auth solution |

## Stack Patterns by Variant

**If building for tournament use:**
- Use PostgreSQL with strict ACID compliance for tournament data integrity
- Implement robust authentication with Clerk for secure participant management

**If focusing on AI realism:**
- Leverage Vercel AI SDK with advanced models like Claude 3.5 Sonnet
- Integrate high-quality TTS from Deepgram for authentic voice synthesis

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.1.8 | React 19.2.0 | Official compatibility confirmed |
| Prisma 6.19.2 | PostgreSQL 16.x | Latest ORM version optimized for modern PG |
| Clerk latest | Next.js 15.x | Full compatibility with latest Next.js features |

## Sources

- /facebook/react — React 19.2.0 documentation and streaming capabilities
- /vercel/next.js — Next.js 15.1.8 with AI streaming features
- /pmndrs/zustand — Zustand 5.0.8 for state management
- /websites/socket_io_v4 — Socket.IO 4.8.1 for real-time communication
- /vercel/ai — Vercel AI SDK 6.0.0-beta for streaming responses
- /prisma/docs — Prisma 6.19.2 with PostgreSQL
- /clerk/clerk-docs — Clerk for authentication
- /vitest-dev/vitest — Vitest 4.0.7 for testing

---
*Stack research for: CPDL Debate Simulator*
*Researched: Thu Jan 29 2026*