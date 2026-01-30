"""
TTS (Text-to-Speech) module for generating audio from text.
Supports both local pyttsx3 and ElevenLabs API.
"""

import os
import tempfile
from typing import Optional
from pathlib import Path

import httpx

from .config import get_settings


def generate_tts_pyttsx3(text: str) -> bytes:
    """
    Generate TTS audio using local pyttsx3 engine.
    
    Args:
        text: Text to convert to speech
    
    Returns:
        Audio bytes (WAV format)
    """
    import pyttsx3
    
    # Initialize TTS engine
    engine = pyttsx3.init()
    
    # Set properties for good quality
    engine.setProperty('rate', 175)  # Speaking rate
    engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
        tmp_path = tmp_file.name
    
    try:
        # Save to file
        engine.save_to_file(text, tmp_path)
        engine.runAndWait()
        
        # Read the audio file
        with open(tmp_path, 'rb') as f:
            audio_bytes = f.read()
        
        return audio_bytes
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


async def generate_tts_elevenlabs(
    text: str,
    voice_id: Optional[str] = None,
    api_key: Optional[str] = None
) -> bytes:
    """
    Generate TTS audio using ElevenLabs API.
    
    Args:
        text: Text to convert to speech
        voice_id: ElevenLabs voice ID (defaults to 'Adam')
        api_key: ElevenLabs API key (defaults to env var)
    
    Returns:
        Audio bytes (MP3 format)
    """
    settings = get_settings()
    api_key = api_key or settings.elevenlabs_api_key
    
    if not api_key:
        raise ValueError("ElevenLabs API key not configured")
    
    voice_id = voice_id or "pNInz6obpgDQGcFmaJgB"  # Adam voice
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data, headers=headers)
        response.raise_for_status()
        return response.content


async def generate_tts(
    text: str,
    voice_id: Optional[str] = None,
    provider: Optional[str] = None
) -> bytes:
    """
    Generate TTS audio using configured provider.
    
    Args:
        text: Text to convert to speech
        voice_id: Voice ID (for ElevenLabs) or None (for pyttsx3)
        provider: TTS provider ('pyttsx3' or 'elevenlabs'), defaults to env setting
    
    Returns:
        Audio bytes
    """
    settings = get_settings()
    provider = provider or settings.tts_provider
    
    if provider == "elevenlabs":
        return await generate_tts_elevenlabs(text, voice_id)
    else:
        # Default to pyttsx3
        return generate_tts_pyttsx3(text)


def get_available_voices() -> list:
    """
    Get list of available voices for the configured TTS provider.
    
    Returns:
        List of voice dictionaries with id and name
    """
    settings = get_settings()
    
    if settings.tts_provider == "elevenlabs":
        # Return common ElevenLabs voices
        return [
            {"id": "pNInz6obpgDQGcFmaJgB", "name": "Adam"},
            {"id": "IKne3meq5aSn9XLyUdCD", "name": "Charlie"},
            {"id": "EXAVITQu4vr4xnSDxMaL", "name": "Bella"},
            {"id": "MF3mGyEYCl7XYWbV9V6O", "name": "Elli"},
            {"id": "TxGEqnHWrfWFTfGW9XjX", "name": "Josh"}
        ]
    else:
        # pyttsx3 voices
        import pyttsx3
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        return [
            {"id": str(i), "name": voice.name}
            for i, voice in enumerate(voices)
        ]
