"""
Configuration module for the debate backend.
Loads environment variables and provides settings for the application.
"""

import json
import os
from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # DeepSeek API Configuration
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    
    # ElevenLabs API Configuration (optional)
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")
    
    # TTS Provider Configuration
    tts_provider: str = os.getenv("TTS_PROVIDER", "pyttsx3")
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Debug Configuration
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from environment variable."""
        origins_str = os.getenv("CORS_ORIGINS", '["http://localhost:5173"]')
        try:
            return json.loads(origins_str)
        except json.JSONDecodeError:
            return ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra env vars that don't match fields


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
