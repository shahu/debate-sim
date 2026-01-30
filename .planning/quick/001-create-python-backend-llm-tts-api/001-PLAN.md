---
phase: quick
plan: 001
phase_name: create-python-backend-llm-tts-api
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/main.py
  - backend/requirements.txt
  - backend/.env.example
  - backend/src/
  - src/api/client.ts
  - src/api/debate.ts
  - src/api/tts.ts
  - src/hooks/useStreamingText.ts
  - src/lib/aiAgents.ts
  - package.json
  - .env.example
autonomous: false
user_setup:
  - service: DeepSeek
    env_vars:
      - name: DEEPSEEK_API_KEY
        source: "DeepSeek Dashboard -> API Keys"
  - service: TTS
    options: "pyttsx3 (local) or ElevenLabs API"
    env_vars:
      - name: ELEVENLABS_API_KEY
        source: "ElevenLabs Dashboard -> API Keys"
        optional: true
must_haves:
  truths:
    - "Frontend calls localhost:8000 API instead of direct DeepSeek"
    - "Streaming text works via backend SSE endpoint"
    - "TTS audio can be generated via POST /api/tts/generate"
    - "No API keys exposed in frontend code"
    - "CORS allows frontend at localhost:5173"
  artifacts:
    - path: backend/main.py
      provides: "FastAPI app with CORS and routes"
      min_lines: 80
    - path: backend/requirements.txt
      provides: "Python dependencies"
      contains: ["fastapi", "uvicorn", "openai"]
    - path: src/api/client.ts
      provides: "HTTP client with base URL config"
      exports: ["apiClient"]
    - path: src/api/debate.ts
      provides: "Debate streaming API"
      exports: ["streamDebateResponse"]
    - path: src/hooks/useStreamingText.ts
      provides: "Hook consuming backend SSE"
      contains: "EventSource"
  key_links:
    - from: src/api/debate.ts
      to: http://localhost:8000/api/debate/stream
      via: "fetch with EventSource for SSE"
      pattern: "EventSource|fetch.*stream"
    - from: backend/main.py
      to: DeepSeek API
      via: "openai client with base_url"
      pattern: "base_url.*deepseek|api.deepseek.com"
---

<objective>
Create Python FastAPI backend to handle LLM (DeepSeek) streaming and TTS generation, refactor React frontend to call backend API instead of direct SDK calls, eliminating API key exposure and CORS issues.

Purpose: Move API keys to server-side, enable TTS functionality, improve security
Output: Working backend with FastAPI, refactored frontend using HTTP API, CORS configured
</objective>

<execution_context>
@~/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
Current project structure:
- React/Vite frontend with TypeScript, Zustand, Tailwind
- Frontend currently uses @ai-sdk packages directly
- Has streaming text via Vercel AI SDK
- Components: aiAgents.ts, useStreamingText.ts

Migration needed:
- Remove @ai-sdk dependencies
- Create backend/ directory with FastAPI
- Create src/api/ for HTTP clients
- Update hooks to consume SSE from backend
</context>

<tasks>

<task type="auto">
  <name>Create Python FastAPI Backend</name>
  <files>
    backend/main.py
    backend/requirements.txt
    backend/.env.example
    backend/src/debate.py
    backend/src/tts.py
    backend/src/config.py
  </files>
  <action>
Create Python FastAPI backend with the following structure:

**backend/requirements.txt:**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
openai==1.12.0
httpx==0.26.0
```

**backend/.env.example:**
```
DEEPSEEK_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
TTS_PROVIDER=pyttsx3  # or elevenlabs
CORS_ORIGINS=["http://localhost:5173"]
```

**backend/src/config.py:**
- Load environment variables using python-dotenv
- Define Settings class with DEEPSEEK_API_KEY, CORS_ORIGINS, etc.
- Use pydantic-settings for validation

**backend/src/debate.py:**
- Create DeepSeek client using OpenAI-compatible API
- Function `stream_debate_response(messages: list, model: str)` that yields SSE chunks
- Use async generator with `yield f"data: {json.dumps(chunk)}\n\n"`
- Handle errors gracefully with try/except

**backend/src/tts.py:**
- Support pyttsx3 (local) or ElevenLabs API
- Function `generate_tts(text: str, voice_id: str = None)`
- Return audio bytes or file path
- For pyttsx3: save to temp file, return bytes
- For ElevenLabs: call API, stream audio response

**backend/main.py:**
- Initialize FastAPI app
- Add CORS middleware with origins from env (default: ["http://localhost:5173"])
- Allow methods: GET, POST, OPTIONS
- Allow headers: ["*"] or specific ["Content-Type", "Authorization"]
- Add `/api/health` GET endpoint returning {"status": "ok"}
- Add `/api/debate/stream` POST endpoint:
  - Accept JSON body: {messages: Array<{role, content}>, model?: string}
  - Return StreamingResponse with text/event-stream content type
  - Call stream_debate_response and stream SSE chunks
- Add `/api/tts/generate` POST endpoint:
  - Accept JSON body: {text: string, voice_id?: string}
  - Return FileResponse or StreamingResponse with audio/mpeg
  - Call generate_tts and return audio
- Run with `if __name__ == "__main__": uvicorn.run(app, host="0.0.0.0", port=8000)`
  </action>
  <verify>
    cd backend && pip install -r requirements.txt && python -c "import fastapi, uvicorn, openai; print('OK')"
    uvicorn main:app --reload &
    curl http://localhost:8000/api/health
    curl -X POST http://localhost:8000/api/debate/stream -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hello"}]}'
  </verify>
  <done>
    Backend starts successfully, health endpoint returns 200, /api/debate/stream accepts POST and returns SSE headers
  </done>
</task>

<task type="auto">
  <name>Create Frontend API Client Layer</name>
  <files>
    src/api/client.ts
    src/api/debate.ts
    src/api/tts.ts
    src/api/types.ts
  </files>
  <action>
Create HTTP API client layer to replace direct SDK calls:

**src/api/client.ts:**
- Define `API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"`
- Create `apiClient` object with methods:
  - `postStream(path: string, body: object)` - returns Response with readable stream
  - `post(path: string, body: object)` - returns Promise<any>
  - `get(path: string)` - returns Promise<any>
- Add error handling with try/catch
- Log requests in development mode

**src/api/types.ts:**
- Define TypeScript interfaces matching backend:
  ```typescript
  export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
  }
  export interface DebateStreamRequest {
    messages: ChatMessage[];
    model?: string;
  }
  export interface TTSRequest {
    text: string;
    voice_id?: string;
  }
  export interface TTSResponse {
    audio_url: string;
    audio_bytes?: string;
  }
  ```

**src/api/debate.ts:**
- Import apiClient and types
- Export `streamDebateResponse(request: DebateStreamRequest)`
- Function returns AsyncGenerator<string> that yields text chunks
- Implementation:
  1. Call `apiClient.postStream('/api/debate/stream', request)`
  2. Get reader from response.body.getReader()
  3. Decode chunks with TextDecoder
  4. Parse SSE format (lines starting with "data: ")
  5. Yield parsed content from each chunk
  6. Handle stream end and errors

**src/api/tts.ts:**
- Export `generateTTS(request: TTSRequest)`
- Function returns Promise<Blob> or Promise<ArrayBuffer>
- Implementation:
  1. Call `apiClient.post('/api/tts/generate', request)`
  2. Response is audio bytes
  3. Return blob with type 'audio/mpeg' or similar
- Export `playAudio(blob: Blob)` helper that creates Audio element and plays

**Environment variables:**
- Create/update .env.example with `VITE_API_URL=http://localhost:8000`
- Add to .env if not exists
  </action>
  <verify>
    npm run build
    Check no TypeScript errors in src/api/*.ts files
    Verify imports resolve correctly
  </verify>
  <done>
    API client compiles without errors, types defined, debate.ts has streamDebateResponse async generator
  </done>
</task>

<task type="auto">
  <name>Refactor Frontend Hooks and Remove @ai-sdk</name>
  <files>
    src/hooks/useStreamingText.ts
    src/lib/aiAgents.ts
    package.json
  </files>
  <action>
Update frontend to use new API layer and remove direct SDK dependencies:

**src/hooks/useStreamingText.ts:**
- Replace import from 'ai' or '@ai-sdk/react' with imports from '../api/debate'
- Keep hook interface similar for minimal component changes:
  ```typescript
  export function useStreamingText() {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const startStreaming = useCallback(async (messages: ChatMessage[]) => {
      setIsLoading(true);
      setText('');
      setError(null);
      
      try {
        const stream = streamDebateResponse({ messages });
        for await (const chunk of stream) {
          setText(prev => prev + chunk);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }, []);
    
    return { text, isLoading, error, startStreaming };
  }
  ```
- Handle stream interruption (AbortController if needed)
- Add cleanup on unmount

**src/lib/aiAgents.ts:**
- This file likely has functions calling AI SDK directly
- Replace with functions that call backend API:
  - `generateAgentResponse(agentType, context)` -> calls backend via api/debate
  - `streamAgentResponse(agentType, context)` -> uses streamDebateResponse
- Remove any direct OpenAI/DeepSeek client initialization
- Keep agent persona definitions (system prompts) - these move to backend or stay as part of request

**package.json:**
- Remove @ai-sdk packages:
  ```bash
  npm uninstall ai @ai-sdk/openai @ai-sdk/react
  ```
- Keep any needed dependencies (zustand, etc.)
- Verify no broken imports after removal

**Type updates:**
- Update any component types that referenced ai-sdk types
- Replace with local types from src/api/types.ts

**Error handling:**
- Add specific error messages for backend connection failures
- Show user-friendly message if backend is not running
- Add retry logic for transient errors
  </action>
  <verify>
    npm uninstall ai @ai-sdk/openai @ai-sdk/react
    npm install
    npm run build
    Check no import errors or type errors
    Verify no @ai-sdk references remain: grep -r "@ai-sdk" src/
  </verify>
  <done>
    @ai-sdk packages removed from package.json, useStreamingText uses backend API, build succeeds, no ai-sdk imports remain
  </done>
</task>

</tasks>

<verification>
1. Backend verification:
   - `cd backend && python -m uvicorn main:app --reload`
   - `curl http://localhost:8000/api/health` returns {"status": "ok"}
   - `curl -N -X POST http://localhost:8000/api/debate/stream ...` streams text chunks
   
2. Frontend verification:
   - `npm run dev` starts Vite dev server
   - Open browser to http://localhost:5173
   - Trigger debate feature
   - Check Network tab: requests go to localhost:8000, not api.deepseek.com
   - Streaming text appears progressively (not all at once)
   
3. CORS verification:
   - No CORS errors in browser console
   - Preflight OPTIONS requests succeed
   - Response headers include Access-Control-Allow-Origin
   
4. Security verification:
   - No API keys in frontend .env or source
   - DEEPSEEK_API_KEY only in backend/.env
   - No @ai-sdk packages in node_modules after npm prune
</verification>

<success_criteria>
- [ ] Backend runs on localhost:8000 with all endpoints working
- [ ] Frontend successfully calls backend (no direct DeepSeek calls from browser)
- [ ] Streaming text works via backend proxy (SSE chunks received)
- [ ] CORS configured allowing localhost:5173
- [ ] @ai-sdk packages removed from package.json
- [ ] No API keys exposed in frontend code
- [ ] TTS endpoint exists and can generate audio (even if not yet integrated into UI)
- [ ] TypeScript compilation succeeds with no errors
</success_criteria>

<output>
After completion, verify by:
1. Starting backend: `cd backend && uvicorn main:app --reload`
2. Starting frontend: `npm run dev`
3. Testing debate feature - should stream text via backend
4. Checking Network tab confirms API calls to localhost:8000

Create `.planning/quick/001-create-python-backend-llm-tts-api/001-SUMMARY.md` with final status.
</output>

<checkpoints>
  <checkpoint type="human-verify">
    <what-built>Python FastAPI backend with DeepSeek streaming and TTS endpoints, refactored frontend using HTTP API instead of direct SDK</what-built>
    <how-to-verify>
      1. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload
      2. Start frontend: npm run dev (in another terminal)
      3. Open http://localhost:5173 in browser
      4. Trigger a debate/conversation
      5. Verify in Network tab:
         - POST request to http://localhost:8000/api/debate/stream
         - Response type: event-stream
         - Data comes in chunks (not single response)
      6. Verify no CORS errors in console
      7. Test TTS: curl -X POST http://localhost:8000/api/tts/generate -H "Content-Type: application/json" -d '{"text":"Hello world"}' --output test.mp3
    </how-to-verify>
    <expected-behavior>
      - Debate responses stream progressively word-by-word
      - No "CORS policy" errors in browser console
      - Backend health check returns OK
      - TTS endpoint returns audio file
    </expected-behavior>
    <resume-signal>Type "verified" or describe any issues with streaming, CORS, or API calls</resume-signal>
  </checkpoint>
</checkpoints>
