"""
Debate module for handling LLM streaming via DeepSeek API.
Provides functions for streaming debate responses using Server-Sent Events (SSE).
"""

import json
from typing import AsyncGenerator, List, Optional

from openai import AsyncOpenAI

from .config import get_settings


async def stream_debate_response(
    messages: List[dict],
    model: Optional[str] = None,
    temperature: float = 0.7
) -> AsyncGenerator[str, None]:
    """
    Stream debate responses from DeepSeek API using SSE format.
    
    Args:
        messages: List of message dicts with 'role' and 'content' keys
        model: Model name (defaults to deepseek-chat)
        temperature: Sampling temperature (0.0 to 2.0)
    
    Yields:
        SSE-formatted data chunks as strings
    
    Example:
        messages = [
            {"role": "system", "content": "You are a debate participant."},
            {"role": "user", "content": "Argue for this motion..."}
        ]
        async for chunk in stream_debate_response(messages):
            print(chunk)  # "data: {\"content\": \"...\"}\n\n"
    """
    settings = get_settings()
    
    if not settings.deepseek_api_key:
        yield f"data: {json.dumps({'error': 'DeepSeek API key not configured'})}\n\n"
        return
    
    # Initialize DeepSeek client (OpenAI-compatible)
    client = AsyncOpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url
    )
    
    try:
        # Create streaming completion
        stream = await client.chat.completions.create(
            model=model or settings.deepseek_model,
            messages=messages,
            temperature=temperature,
            stream=True
        )
        
        # Stream chunks as SSE
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                data = {
                    "content": chunk.choices[0].delta.content,
                    "done": False
                }
                yield f"data: {json.dumps(data)}\n\n"
        
        # Send final done message
        yield f"data: {json.dumps({'done': True})}\n\n"
        
    except Exception as e:
        error_data = {"error": str(e), "done": True}
        yield f"data: {json.dumps(error_data)}\n\n"


async def generate_debate_response(
    messages: List[dict],
    model: Optional[str] = None,
    temperature: float = 0.7
) -> str:
    """
    Generate a complete debate response (non-streaming).
    
    Args:
        messages: List of message dicts with 'role' and 'content' keys
        model: Model name (defaults to deepseek-chat)
        temperature: Sampling temperature
    
    Returns:
        Complete response text
    """
    settings = get_settings()
    
    if not settings.deepseek_api_key:
        raise ValueError("DeepSeek API key not configured")
    
    client = AsyncOpenAI(
        api_key=settings.deepseek_api_key,
        base_url=settings.deepseek_base_url
    )
    
    response = await client.chat.completions.create(
        model=model or settings.deepseek_model,
        messages=messages,
        temperature=temperature,
        stream=False
    )
    
    return response.choices[0].message.content
