/**
 * TypeScript type definitions for API requests and responses.
 * Mirrors the backend Pydantic models.
 */

/**
 * Chat message structure for LLM conversations
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Request body for debate streaming endpoint
 */
export interface DebateStreamRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}

/**
 * Request body for debate generation endpoint (non-streaming)
 */
export interface DebateGenerateRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}

/**
 * Response from debate generation endpoint
 */
export interface DebateGenerateResponse {
  content: string;
}

/**
 * SSE chunk data structure for streaming responses
 */
export interface DebateStreamChunk {
  content?: string;
  done: boolean;
  error?: string;
}

/**
 * Request body for TTS generation endpoint
 */
export interface TTSRequest {
  text: string;
  voice_id?: string;
  provider?: 'pyttsx3' | 'elevenlabs';
}

/**
 * Response from TTS voices endpoint
 */
export interface TTSVoice {
  id: string;
  name: string;
}

/**
 * Response from TTS voices list endpoint
 */
export interface TTSVoicesResponse {
  voices: TTSVoice[];
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
  version: string;
}
