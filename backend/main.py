"""
FastAPI main application for CPDL Debate Simulator backend.
Provides endpoints for debate streaming and TTS generation.
"""

import json
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel

from src.config import get_settings
from src.debate import stream_debate_response, generate_debate_response
from src.tts import generate_tts, get_available_voices

# Configure logging
settings = get_settings()
log_level = logging.DEBUG if settings.debug else logging.INFO
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


# Pydantic models for request/response
class ChatMessage(BaseModel):
    role: str  # "system", "user", "assistant"
    content: str


class DebateStreamRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "deepseek-chat"
    temperature: Optional[float] = 0.7


class DebateResponseRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "deepseek-chat"
    temperature: Optional[float] = 0.7


class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    provider: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    settings = get_settings()
    print(f"Starting Debate Backend on {settings.host}:{settings.port}")
    print(f"CORS origins: {settings.cors_origins}")
    print(f"TTS Provider: {settings.tts_provider}")
    if settings.debug:
        print("🔍 DEBUG MODE ENABLED - All prompts and responses will be logged")
    yield
    # Shutdown
    print("Shutting down Debate Backend")


# Initialize FastAPI app
app = FastAPI(
    title="CPDL Debate Simulator API",
    description="Backend API for LLM streaming and TTS generation",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")


@app.post("/api/debate/stream")
async def debate_stream(request: DebateStreamRequest):
    """
    Stream debate responses from DeepSeek LLM.
    
    Returns SSE (Server-Sent Events) stream with text chunks.
    Each chunk is formatted as: data: {"content": "...", "done": false}\n\n
    Final chunk has done: true.
    """
    try:
        # Convert pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        async def event_generator():
            async for chunk in stream_debate_response(
                messages=messages,
                model=request.model,
                temperature=request.temperature or 0.7
            ):
                yield chunk
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming error: {str(e)}")


@app.post("/api/debate/generate")
async def debate_generate(request: DebateResponseRequest):
    """
    Generate a complete debate response (non-streaming).
    
    Returns the full response text.
    """
    try:
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        response = await generate_debate_response(
            messages=messages,
            model=request.model,
            temperature=request.temperature or 0.7
        )
        
        return {"content": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")


@app.post("/api/tts/generate")
async def tts_generate(request: TTSRequest):
    """
    Generate TTS audio from text.
    
    Returns audio bytes in the appropriate format:
    - pyttsx3: WAV format
    - elevenlabs: MP3 format
    """
    try:
        audio_bytes = await generate_tts(
            text=request.text,
            voice_id=request.voice_id,
            provider=request.provider
        )
        
        # Determine content type based on provider
        content_type = "audio/mpeg" if request.provider == "elevenlabs" else "audio/wav"
        
        return Response(
            content=audio_bytes,
            media_type=content_type,
            headers={
                "Content-Disposition": "attachment; filename=audio.{}".format(
                    "mp3" if request.provider == "elevenlabs" else "wav"
                )
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")


@app.get("/api/tts/voices")
async def tts_voices():
    """
    Get available TTS voices.
    
    Returns list of voice objects with id and name.
    """
    try:
        voices = get_available_voices()
        return {"voices": voices}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice listing error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(app, host=settings.host, port=settings.port)
