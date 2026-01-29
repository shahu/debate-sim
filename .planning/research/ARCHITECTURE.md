# Architecture Research

**Domain:** CPDL Debate Simulator - Interactive web application for Canadian Parliamentary Debate format
**Researched:** Thu Jan 29 2026
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   UI Manager    │  │   Transcript    │  │   Audio Player  │                │
│  │                 │  │                 │  │                 │                │
│  └─────────┬───────┘  └─────────┬───────┘  └─────────┬───────┘                │
│            │                    │                    │                         │
├────────────┴─────────────────────┴────────────────────┴─────────────────────────┤
│                        Interactive Web Application                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         Debate Orchestration                           │   │
│  │  ┌─────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────────────┐  │   │
│  │  │  Timer  │  │ Turn Manager │  │ Rule Enf.│  │ POI Handler         │  │   │
│  │  │Module   │  │              │  │          │  │                     │  │   │
│  │  └─────────┘  └──────────────┘  └──────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           AI Agent Layer                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Prime Min.  │  │ Opp. Leader │  │ Deputy PM │  │ Deputy Opp. Leader │  │
│  │    Agent    │  │    Agent    │  │   Agent   │  │      Agent         │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         Evaluation Layer                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Judge-like Commentary System                      │   │
│  │  ┌─────────────┐  ┌────────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Argument    │  │ Rebuttal       │  │ Scoring     │  │ RFD Gen.    │  │   │
│  │  │ Analysis    │  │ Evaluation     │  │ Engine      │  │             │  │   │
│  │  └─────────────┘  └────────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         Data & Storage Layer                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Debate History  │  │ Vector Database │  │ Motion Bank     │               │
│  │                 │  │ (RAG System)    │  │                 │               │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Debate Orchestration | Manages turn-taking, timing, rule enforcement | State machine with timer modules |
| AI Agent Layer | Generates speeches according to role and debate format | LLM instances with role-specific prompts |
| Judge System | Evaluates arguments, provides commentary, declares winner | NLP analysis with rubric-based scoring |
| UI Layer | Real-time display of streaming text and audio output | React components with streaming text effects |
| RAG System | Provides factual grounding and context memory | Vector database with retrieval-augmented generation |

## Recommended Project Structure

```
src/
├── components/           # UI components (debate interface, controls)
│   ├── DebateInterface/  # Main debate display area
│   ├── Transcript/      # Streaming text display
│   ├── AudioControls/   # TTS and audio management
│   └── JudgePanel/      # Judge commentary display
├── services/            # Business logic and orchestration
│   ├── agents/          # AI agent implementations
│   ├── debate/          # Debate flow management
│   ├── evaluation/      # Judge evaluation logic
│   └── audio/           # TTS and STT services
├── hooks/               # Custom React hooks
│   ├── useDebateStream/ # Manage streaming text
│   ├── useTTS/          # Handle text-to-speech
│   └── useTimer/        # Debate timing control
├── utils/               # Helper functions
│   ├── debateRules/     # CPDL format rules
│   ├── textProcessing/  # Text analysis and sentence splitting
│   └── scoring/         # Scoring algorithms
├── types/               # TypeScript definitions
│   ├── debate.ts        # Debate-related types
│   ├── agents.ts        # Agent-related types
│   └── evaluation.ts    # Evaluation types
└── contexts/            # React context providers
    └── DebateContext.ts # Global debate state
```

### Structure Rationale

- **components/:** Separates UI concerns by functionality, making the interface modular and maintainable
- **services/:** Contains business logic separated by domain, enabling clean separation of concerns
- **hooks/:** Encapsulates complex stateful logic for reuse across components
- **utils/:** Pure functions and utilities that don't depend on React lifecycle

## Architectural Patterns

### Pattern 1: Multi-Agent System (MAS)

**What:** Separate AI agents for each debate role (Prime Minister, Opposition Leader, etc.)
**When to use:** When simulating realistic debate dynamics with distinct perspectives
**Trade-offs:** Higher computational cost but more authentic debate experience

**Example:**
```typescript
interface DebateAgent {
  role: AgentRole;
  generateSpeech(context: DebateContext): Promise<Speech>;
  evaluateOpponent(speech: Speech): Rebuttal;
}

class PrimeMinisterAgent implements DebateAgent {
  role = AgentRole.PRIME_MINISTER;
  // Specialized logic for opening government arguments
}
```

### Pattern 2: Producer-Consumer for Streaming

**What:** Separate the streaming text producer from UI consumer to prevent blocking
**When to use:** When handling real-time LLM output to UI
**Trade-offs:** More complex architecture but smoother user experience

**Example:**
```typescript
const useDebateStream = () => {
  const [fullText, setFullText] = useState("");
  const sentenceBuffer = useRef("");

  const handleStream = async (response) => {
    // Process stream chunks without blocking UI
  };
};
```

### Pattern 3: Chain-of-Thought Evaluation

**What:** Use LLM reasoning to evaluate arguments before scoring
**When to use:** When complex argument analysis is required
**Trade-offs:** Slower evaluation but more nuanced reasoning

## Data Flow

### Request Flow

```
Debate Motion
     ↓
Agent Prompts → Context Injection → LLM Generation → Speech Output
     ↓              ↓                    ↓               ↓
Rule Check ← RAG Query ← Argument Analysis ← Sentence Buffer
```

### State Management

```
Global Debate State
     ↓ (subscribe)
Components ←→ Actions → Reducers → Global Debate State
```

### Key Data Flows

1. **Debate Flow:** Motion → Agent Context → Speech Generation → Evaluation → Next Turn
2. **Streaming Flow:** LLM Tokens → Sentence Buffer → Text Display → TTS Queue → Audio Output
3. **Evaluation Flow:** Speech Input → Analysis → Scoring → Judge Commentary → Winner Declaration

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolithic architecture with client-side TTS sufficient |
| 1k-100k users | Microservices for agents, CDN for static assets, load balancing |
| 100k+ users | Container orchestration, distributed caching, dedicated audio servers |

### Scaling Priorities

1. **First bottleneck:** LLM API costs and rate limits - implement smart caching and request batching
2. **Second bottleneck:** Real-time audio streaming - use edge computing for TTS processing

## Anti-Patterns

### Anti-Pattern 1: Direct DOM Manipulation for Streaming

**What people do:** Updating DOM directly on every token from LLM
**Why it's wrong:** Causes performance issues and janky UI
**Do this instead:** Use React state properly with throttled updates or refs for streaming

### Anti-Pattern 2: Single Agent for All Roles

**What people do:** Using one LLM instance to play all debate roles
**Why it's wrong:** Results in inconsistent personalities and poor role-specific strategy
**Do this instead:** Separate agents with role-specific training and objectives

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI/Claude API | Streaming via SSE | Handle token limits and rate limiting |
| ElevenLabs TTS | WebSocket API | Lower latency than REST |
| Vector DB (Pinecone) | RAG integration | Context window management |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Services | React Context/Props | Use memoization to prevent unnecessary renders |
| Agents ↔ Evaluation | Event bus/promise | Asynchronous evaluation without blocking debate flow |

## Sources

- Multi-agent debate system architecture research
- React streaming text and TTS implementation patterns
- Debate judging and evaluation rubric systems
- Canadian Parliamentary Debate format rules and structure

---
*Architecture research for: CPDL Debate Simulator*
*Researched: Thu Jan 29 2026*