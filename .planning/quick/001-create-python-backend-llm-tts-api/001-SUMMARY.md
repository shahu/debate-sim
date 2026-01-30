---
phase: quick
plan: 001
phase_name: create-python-backend-llm-tts-api
tags:
  - python
  - fastapi
  - backend
  - sse
  - tts
  - security
  - refactoring
requires:
  - phase-3-streaming-complete
provides:
  - python-fastapi-backend
  - secure-api-key-handling
  - tts-endpoint
  - sse-streaming-backend
  - frontend-api-client
affects:
  - future-phases
  - deployment-architecture

key-files:
  created:
    - backend/main.py
    - backend/requirements.txt
    - backend/.env.example
    - backend/src/config.py
    - backend/src/debate.py
    - backend/src/tts.py
    - src/api/client.ts
    - src/api/types.ts
    - src/api/debate.ts
    - src/api/tts.ts
    - src/api/index.ts
    - src/vite-env.d.ts
  modified:
    - src/hooks/useStreamingText.ts
    - src/lib/aiAgents.ts
    - package.json

metrics:
  duration: 18m
  completed: 2026-01-30
---

# Phase Quick Plan 001: Create Python Backend LLM TTS API Summary

## One-Liner
Created Python FastAPI backend with DeepSeek LLM streaming and TTS generation, refactored React frontend to call backend API instead of direct SDK calls, eliminating API key exposure and CORS issues.

## What Was Delivered

### Backend (Python/FastAPI)
- **FastAPI Application** (`backend/main.py`) with CORS configured for localhost:5173
- **Health Check Endpoint** (`GET /api/health`) for monitoring
- **Debate Streaming Endpoint** (`POST /api/debate/stream`) - SSE streaming from DeepSeek
- **Debate Generation Endpoint** (`POST /api/debate/generate`) - Non-streaming responses
- **TTS Generation Endpoint** (`POST /api/tts/generate`) - Audio generation (pyttsx3/ElevenLabs)
- **TTS Voices Endpoint** (`GET /api/tts/voices`) - List available voices

### Frontend API Client
- **HTTP Client** (`src/api/client.ts`) with get, post, postStream methods
- **Type Definitions** (`src/api/types.ts`) matching backend Pydantic models
- **Debate API** (`src/api/debate.ts`) with `streamDebateResponse` async generator
- **TTS API** (`src/api/tts.ts`) with generateTTS, playAudio, speak functions

### Refactored Components
- **useStreamingText Hook** - Now consumes backend SSE streams, backward compatible
- **aiAgents.ts** - Removed all @ai-sdk imports, uses backend API exclusively
- **package.json** - Removed ai, @ai-sdk/openai, @ai-sdk/react dependencies

## Decisions Made

### 1. Architecture: Backend Proxy Pattern
**Decision:** Move all LLM API calls to backend, frontend calls backend via HTTP.
**Rationale:** 
- Security: API keys no longer exposed in frontend code
- CORS: Eliminates browser CORS issues with DeepSeek API
- Flexibility: Can add caching, rate limiting, logging on backend
- TTS: Enables server-side TTS generation with multiple providers

### 2. Streaming: SSE (Server-Sent Events)
**Decision:** Use SSE format for streaming text from backend to frontend.
**Rationale:**
- Standard HTTP, works through proxies
- Simple text format, easy to parse
- Better than WebSockets for unidirectional server→client streaming
- Native browser support via EventSource

### 3. Backward Compatibility
**Decision:** Maintain backward compatibility in useStreamingText hook.
**Rationale:**
- Existing components (StreamingTranscriptEntry) expect AsyncIterable interface
- Allows gradual migration to new DebateStreamRequest API
- No breaking changes to component API

### 4. TTS Provider: pyttsx3 + ElevenLabs
**Decision:** Support both local (pyttsx3) and cloud (ElevenLabs) TTS.
**Rationale:**
- pyttsx3: Free, works offline, no API key needed
- ElevenLabs: Higher quality, more natural voices
- Configurable via environment variable

## Technical Details

### Backend Endpoints
```
GET  /api/health              → {"status": "ok"}
POST /api/debate/stream       → SSE stream (text/event-stream)
POST /api/debate/generate     → {"content": "..."}
POST /api/tts/generate        → Audio blob (audio/mpeg or audio/wav)
GET  /api/tts/voices          → {"voices": [{"id": "...", "name": "..."}]}
```

### Environment Variables
Backend (`.env`):
```bash
DEEPSEEK_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
TTS_PROVIDER=pyttsx3
CORS_ORIGINS=["http://localhost:5173"]
```

Frontend (`.env`):
```bash
VITE_API_URL=http://localhost:8000
```

### Streaming Flow
1. Frontend calls `streamDebateResponse({ messages })`
2. HTTP POST to `/api/debate/stream` with Accept: text/event-stream
3. Backend calls DeepSeek API with streaming enabled
4. Backend receives chunks and formats as SSE: `data: {"content": "..."}\n\n`
5. Frontend parses SSE lines and yields content chunks
6. useStreamingText hook accumulates chunks and throttles UI updates via rAF

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

### ✅ Backend Verification
- [x] FastAPI app starts successfully
- [x] CORS configured for localhost:5173
- [x] Health endpoint returns {"status": "ok"}
- [x] Debate stream endpoint accepts POST with SSE response
- [x] TTS endpoint structure in place

### ✅ Frontend Verification
- [x] TypeScript compilation succeeds (npm run build)
- [x] No @ai-sdk imports remain in codebase
- [x] API client compiles without errors
- [x] useStreamingText maintains backward compatibility

### ✅ Security Verification
- [x] No API keys in frontend .env.example
- [x] @ai-sdk packages removed from package.json
- [x] Backend .env.example shows keys belong server-side only

## Authentication Gates

This plan has a checkpoint for manual verification:

**Required for full verification:**
1. Set up backend environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add DEEPSEEK_API_KEY
   ```

2. Start backend:
   ```bash
   uvicorn main:app --reload
   ```

3. Start frontend:
   ```bash
   npm run dev
   ```

4. Test in browser:
   - Open http://localhost:5173
   - Trigger debate feature
   - Verify Network tab shows requests to localhost:8000
   - Verify streaming works (text appears progressively)
   - Verify no CORS errors

## Next Steps

After checkpoint verification:
1. Update deployment documentation
2. Consider adding authentication to backend endpoints
3. Add rate limiting for production
4. Consider adding request/response logging
5. Set up environment-specific configurations (dev/staging/prod)

## Files Summary

**Created (15 files):**
- backend/main.py (FastAPI app with endpoints)
- backend/requirements.txt (Python dependencies)
- backend/.env.example (Environment template)
- backend/src/config.py (Settings management)
- backend/src/debate.py (DeepSeek streaming)
- backend/src/tts.py (TTS generation)
- backend/src/__init__.py (Package marker)
- src/api/client.ts (HTTP client)
- src/api/types.ts (Type definitions)
- src/api/debate.ts (Debate streaming API)
- src/api/tts.ts (TTS API)
- src/api/index.ts (Module exports)
- src/vite-env.d.ts (Vite types)
- .env.example (Frontend env template)

**Modified (3 files):**
- src/hooks/useStreamingText.ts (Use backend API)
- src/lib/aiAgents.ts (Remove ai-sdk, use backend)
- package.json (Remove @ai-sdk packages)

**Removed (0 files):**
- None (all @ai-sdk references removed via npm uninstall)

## Commits

1. `54d59c5` - chore(quick-001): create Python FastAPI backend
2. `b5fedfe` - feat(quick-001): create frontend API client layer  
3. `d9d351a` - refactor(quick-001): remove @ai-sdk dependencies, use backend API
