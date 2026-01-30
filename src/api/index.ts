/**
 * API module exports
 * Central export point for all API-related modules
 */

// Client and types
export { apiClient, APIError, getApiBaseUrl } from './client';
export type {
  ChatMessage,
  DebateStreamRequest,
  DebateGenerateRequest,
  DebateGenerateResponse,
  DebateStreamChunk,
  TTSRequest,
  TTSVoice,
  TTSVoicesResponse,
  HealthResponse,
} from './types';

// Debate API
export {
  streamDebateResponse,
  generateDebateResponse,
  isBackendHealthy,
} from './debate';

// TTS API
export {
  generateTTS,
  getTTSVoices,
  playAudio,
  speak,
} from './tts';
