/**
 * Voice registry for role-based TTS voice mapping
 * Maps CPDL debate roles to distinct voice IDs for different TTS providers
 */

import { SpeakerRole } from '../types/debate';

/**
 * Voice configuration interface
 */
export interface VoiceConfig {
  id: string;           // Voice identifier (index for pyttsx3, UUID for ElevenLabs)
  name: string;          // Human-readable voice name
  provider: 'pyttsx3' | 'elevenlabs';
}

/**
 * Voice registry for pyttsx3 (local TTS)
 * Uses voice indices mapped to system voices
 */
export const PYTTSX3_VOICE_REGISTRY: Record<SpeakerRole, VoiceConfig> = {
  [SpeakerRole.PM]: {
    id: '0',
    name: 'Voice 0',
    provider: 'pyttsx3'
  },
  [SpeakerRole.LO]: {
    id: '1',
    name: 'Voice 1',
    provider: 'pyttsx3'
  },
  [SpeakerRole.MO]: {
    id: '2',
    name: 'Voice 2',
    provider: 'pyttsx3'
  },
  [SpeakerRole.PW]: {
    id: '3',
    name: 'Voice 3',
    provider: 'pyttsx3'
  }
};

/**
 * Voice registry for ElevenLabs (cloud TTS)
 * Uses specific voice IDs from ElevenLabs library
 */
export const ELEVENLABS_VOICE_REGISTRY: Record<SpeakerRole, VoiceConfig> = {
  [SpeakerRole.PM]: {
    id: 'pNInz6obpgDQGcFmaJgB',  // Adam - deeper, authoritative
    name: 'Adam',
    provider: 'elevenlabs'
  },
  [SpeakerRole.LO]: {
    id: 'EXAVITQu4vr4xnSDxMaL',  // Bella - confident, clear
    name: 'Bella',
    provider: 'elevenlabs'
  },
  [SpeakerRole.MO]: {
    id: 'IKne3meq5aSn9XLyUdCD',  // Charlie - analytical, measured
    name: 'Charlie',
    provider: 'elevenlabs'
  },
  [SpeakerRole.PW]: {
    id: 'MF3mGyEYCl7XYWbV9V6O',  // Elli - energetic, engaging
    name: 'Elli',
    provider: 'elevenlabs'
  }
};

/**
 * Get voice ID for a given role and provider
 *
 * @param role - The speaker role (PM, LO, MO, PW)
 * @param provider - The TTS provider ('pyttsx3' or 'elevenlabs')
 * @returns The voice ID string for the specified role and provider
 * @throws Error if role is not found in registry
 */
export function getVoiceIdForRole(
  role: SpeakerRole,
  provider: 'pyttsx3' | 'elevenlabs' = 'pyttsx3'
): string {
  const registry = provider === 'elevenlabs'
    ? ELEVENLABS_VOICE_REGISTRY
    : PYTTSX3_VOICE_REGISTRY;

  const voiceConfig = registry[role];

  if (!voiceConfig) {
    throw new Error(`No voice configured for role: ${role} with provider: ${provider}`);
  }

  return voiceConfig.id;
}

/**
 * Get full voice configuration for a given role and provider
 *
 * @param role - The speaker role (PM, LO, MO, PW)
 * @param provider - The TTS provider ('pyttsx3' or 'elevenlabs')
 * @returns The complete VoiceConfig object
 * @throws Error if role is not found in registry
 */
export function getVoiceConfigForRole(
  role: SpeakerRole,
  provider: 'pyttsx3' | 'elevenlabs' = 'pyttsx3'
): VoiceConfig {
  const registry = provider === 'elevenlabs'
    ? ELEVENLABS_VOICE_REGISTRY
    : PYTTSX3_VOICE_REGISTRY;

  const voiceConfig = registry[role];

  if (!voiceConfig) {
    throw new Error(`No voice configured for role: ${role} with provider: ${provider}`);
  }

  return voiceConfig;
}

/**
 * Export all registry configurations for easy access
 */
export const VOICE_REGISTRY = {
  pyttsx3: PYTTSX3_VOICE_REGISTRY,
  elevenlabs: ELEVENLABS_VOICE_REGISTRY
};
