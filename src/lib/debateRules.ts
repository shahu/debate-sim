import { DebateState, SpeakerRole, DebateTranscriptEntry } from '../types/debate';
import { ROLE_DESCRIPTIONS, DEFAULT_TIMERS, DEBATE_MOTION_REGEX } from './constants';

/**
 * CPDL (Canadian Parliamentary Debate League) Format Rules
 * Enforces the specific rules and regulations of the CPDL debate format
 */

// Validate debate motion format
export const validateMotion = (motion: string): boolean => {
  return DEBATE_MOTION_REGEX.test(motion.trim());
};

// Get the motion without the "This House believes that" prefix
export const extractMotionCore = (motion: string): string => {
  const match = motion.match(DEBATE_MOTION_REGEX);
  if (match) {
    // Extract everything after "This House believes that"
    return motion.substring(match[0].indexOf('that') + 4).trim();
  }
  return motion.trim();
};

// Check if it's the speaker's turn
export const isCurrentSpeaker = (state: DebateState, role: SpeakerRole): boolean => {
  return state.currentSpeaker === role;
};

// Check if a role can offer POI at the current time
export const canOfferPOI = (state: DebateState, fromRole: SpeakerRole): boolean => {
  // Can't offer POI if it's your turn to speak
  if (state.currentSpeaker === fromRole) {
    return false;
  }

  // Can't offer POI during protected time
  if (state.protectedTime) {
    return false;
  }

  // Can't offer POI if already a pending POI
  if (state.currentPOIOfferer) {
    return false;
  }

  // Can't offer POI if not allowed to offer POI
  return state.canOfferPOI;
};

// Check if a POI can be accepted by the current speaker
export const canAcceptPOI = (state: DebateState): boolean => {
  // Can only accept POI if it's your turn speaking
  if (state.currentSpeaker !== state.currentSpeaker) {
    return false;
  }

  // Can't accept during protected time
  if (state.protectedTime) {
    return false;
  }

  // Must have a POI being offered
  return !!state.currentPOIOfferer;
};

// Get the next speaker in CPDL sequence
export const getNextSpeaker = (currentSpeaker: SpeakerRole | null): SpeakerRole | null => {
  const order: SpeakerRole[] = ['PM', 'LO', 'MO', 'PW'];
  
  if (currentSpeaker === null) {
    return 'PM'; // First speaker is always PM
  }

  const currentIndex = order.indexOf(currentSpeaker);
  if (currentIndex === -1) {
    return null; // Invalid current speaker
  }

  // For a single round, return the next speaker in sequence
  // For multiple rounds, this would need to account for round progression
  if (currentIndex < order.length - 1) {
    return order[currentIndex + 1];
  }

  // If we've reached the end of the round, return null or restart for next round
  return null;
};

// Check if a speaker is speaking in their designated time
export const isValidSpeakingTurn = (state: DebateState, speakingRole: SpeakerRole): boolean => {
  // First check if it's actually their turn
  if (state.currentSpeaker !== speakingRole) {
    return false;
  }

  return true;
};

// Validate that LO challenges PM's definition (rule specific to LO role)
export const validateLOChallenge = (transcript: DebateTranscriptEntry[], pmDefinition?: string): boolean => {
  // Find the LO's speaking entries
  const loEntries = transcript.filter(entry => entry.speaker === 'LO');
  
  // If LO hasn't spoken yet, no challenge needed yet
  if (loEntries.length === 0) {
    return true;
  }

  // Simple validation: check if LO's content references PM's content
  // More sophisticated validation would require semantic analysis
  return true; // Placeholder - detailed validation would be more complex
};

// Validate that MO/PW don't introduce new arguments (they can only extend or rebut)
export const validateNoNewArguments = (transcript: DebateTranscriptEntry[], role: 'MO' | 'PW'): boolean => {
  // For now, this is a placeholder that always returns true
  // Actual implementation would require semantic analysis to determine
  // if new arguments are being introduced vs. extending existing ones
  return true;
};

// Check if a speaker has exceeded their allocated time
export const isTimeExceeded = (elapsedTime: number, role: SpeakerRole): boolean => {
  const allocatedTime = DEFAULT_TIMERS[role];
  return elapsedTime > allocatedTime;
};

// Validate role-specific responsibilities
export const validateRoleResponsibilities = (
  state: DebateState, 
  role: SpeakerRole, 
  content: string
): { isValid: boolean; message?: string } => {
  switch (role) {
    case 'PM':
      // PM opens the debate and defines the motion
      return { isValid: true }; // PM has the most flexibility
    
    case 'LO':
      // LO should challenge PM's definition and present opposition case
      // For now, just ensure basic compliance
      return { isValid: true };
    
    case 'MO':
      // MO should not introduce new arguments, only extend/rebut
      return { isValid: true }; // Placeholder
    
    case 'PW':
      // PW should defend government position and rebut opposition
      // Should not introduce new arguments
      return { isValid: true }; // Placeholder
    
    default:
      return { isValid: false, message: `Unknown role: ${role}` };
  }
};

// Get role description for reference
export const getRoleDescription = (role: SpeakerRole): string => {
  return ROLE_DESCRIPTIONS[role] || 'No description available';
};

// Check if the debate format is properly structured
export const validateCPDLFormat = (state: DebateState): boolean => {
  // Basic validation that all required roles are represented
  const speakerRoles = state.speakers.map(speaker => speaker.role);
  
  // Check if all 4 CPDL roles are present
  const requiredRoles: SpeakerRole[] = ['PM', 'LO', 'MO', 'PW'];
  const hasAllRoles = requiredRoles.every(role => speakerRoles.includes(role));
  
  // Validate motion format
  const validMotion = validateMotion(state.motion);
  
  return hasAllRoles && validMotion;
};

// Get time allocation for a specific role
export const getTimeAllocation = (role: SpeakerRole): number => {
  return DEFAULT_TIMERS[role] || 0;
};

// Check if we're in protected time (first or last minute of a speech)
export const isInProtectedTime = (elapsedTime: number, totalTime: number): boolean => {
  // Protected time is the first and last minute
  return elapsedTime <= 60 || (totalTime - elapsedTime) <= 60;
};