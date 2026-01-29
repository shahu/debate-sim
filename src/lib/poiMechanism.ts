import { SpeakerRole } from '../types/debate';
import { checkPOIPeriod, isProtectedTime } from './debateRules';
import { useDebateStore } from '../store/debateStore';
import { TranscriptEntry } from '../store/debateStore';

// Define POI request interface
interface POIRequest {
  id: string;
  requester: SpeakerRole;
  target: SpeakerRole; // The speaker being interrupted
  content: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout';
  reason?: string; // Reason for rejection
}

// POI Manager class to handle all POI operations
class POIMechanism {
  private pendingRequests: Map<string, POIRequest> = new Map();
  private store = useDebateStore;

  /**
   * Requests a Point of Information (POI) to the current speaker
   * @param requester The role of the speaker requesting the POI
   * @param content The content of the POI request
   * @returns A promise resolving to the POI ID if successful
   */
  public async requestPOI(requester: SpeakerRole, content: string): Promise<string | null> {
    const state = this.store.getState();
    const currentSpeaker = state.currentSpeaker;

    if (!currentSpeaker) {
      console.error('Cannot request POI: no current speaker');
      return null;
    }

    // Check if the requester is not the current speaker
    if (requester === currentSpeaker) {
      console.error('Cannot request POI when you are the current speaker');
      return null;
    }

    // Check if it's a valid POI period (not protected time)
    const isValidPOIPeriod = checkPOIPeriod(currentSpeaker, state.currentSpeakerIndex);
    const isProtected = isProtectedTime(currentSpeaker, state.currentSpeakerIndex, state.timeRemaining);

    if (!isValidPOIPeriod || isProtected) {
      console.error(`Cannot request POI: invalid timing (protected time: ${isProtected}, valid period: ${isValidPOIPeriod})`);
      
      // Add to transcript as an invalid POI request
      this.store.getState().addTranscriptEntry({
        speaker: requester,
        content: `POI Request: ${content} (Rejected - Invalid timing)`,
        type: 'poi-request',
        wordCount: content.split(/\s+/).length
      });
      
      return null;
    }

    // Create POI request
    const poiId = `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const poiRequest: POIRequest = {
      id: poiId,
      requester,
      target: currentSpeaker,
      content,
      timestamp: new Date(),
      status: 'pending'
    };

    // Add to pending requests
    this.pendingRequests.set(poiId, poiRequest);

    // Add to transcript
    this.store.getState().addTranscriptEntry({
      speaker: requester,
      content: `POI Request: "${content}"`,
      type: 'poi-request',
      wordCount: content.split(/\s+/).length
    });

    // Automatically accept POI after a short delay if not explicitly handled
    setTimeout(() => {
      if (this.pendingRequests.has(poiId) && this.pendingRequests.get(poiId)?.status === 'pending') {
        this.timeoutPOI(poiId);
      }
    }, 5000); // 5 seconds to respond

    return poiId;
  }

  /**
   * Accepts a pending POI request
   * @param poiId The ID of the POI request to accept
   * @returns Boolean indicating success
   */
  public acceptPOI(poiId: string): boolean {
    const request = this.pendingRequests.get(poiId);
    
    if (!request || request.status !== 'pending') {
      console.error(`Cannot accept POI: request ${poiId} not found or not pending`);
      return false;
    }

    // Update request status
    request.status = 'accepted';
    this.pendingRequests.set(poiId, request);

    // Add to transcript
    this.store.getState().addTranscriptEntry({
      speaker: request.target,
      content: `Accepted POI from ${request.requester}: "${request.content}"`,
      type: 'poi-response',
      wordCount: request.content.split(/\s+/).length
    });

    // Process the POI content in the debate flow
    this.processPOIContent(request);

    return true;
  }

  /**
   * Rejects a pending POI request
   * @param poiId The ID of the POI request to reject
   * @param reason Optional reason for rejection
   * @returns Boolean indicating success
   */
  public rejectPOI(poiId: string, reason?: string): boolean {
    const request = this.pendingRequests.get(poiId);
    
    if (!request || request.status !== 'pending') {
      console.error(`Cannot reject POI: request ${poiId} not found or not pending`);
      return false;
    }

    // Update request status
    request.status = 'rejected';
    request.reason = reason || 'Not accepted at this time';
    this.pendingRequests.set(poiId, request);

    // Add to transcript
    this.store.getState().addTranscriptEntry({
      speaker: request.target,
      content: `Rejected POI from ${request.requester}: "${reason || 'Not accepted at this time'}"`,
      type: 'poi-response',
      wordCount: (reason || 'Not accepted at this time').split(/\s+/).length
    });

    return true;
  }

  /**
   * Times out a pending POI request
   * @param poiId The ID of the POI request to timeout
   * @returns Boolean indicating success
   */
  private timeoutPOI(poiId: string): boolean {
    const request = this.pendingRequests.get(poiId);
    
    if (!request || request.status !== 'pending') {
      console.error(`Cannot timeout POI: request ${poiId} not found or not pending`);
      return false;
    }

    // Update request status
    request.status = 'timeout';
    request.reason = 'Timeout - no response';
    this.pendingRequests.set(poiId, request);

    // Add to transcript
    this.store.getState().addTranscriptEntry({
      speaker: request.target,
      content: `POI timed out from ${request.requester}`,
      type: 'poi-response',
      wordCount: 4
    });

    return true;
  }

  /**
   * Validates a POI request based on timing and CPDL rules
   * @param requester The role requesting the POI
   * @param target The role being targeted for the POI
   * @returns Validation result
   */
  public validatePOIRequest(requester: SpeakerRole, target: SpeakerRole): { isValid: boolean; reason?: string } {
    const state = this.store.getState();
    const currentSpeaker = state.currentSpeaker;

    // POI can only be requested to the current speaker
    if (target !== currentSpeaker) {
      return {
        isValid: false,
        reason: `POI can only be requested to the current speaker (${currentSpeaker}), not ${target}`
      };
    }

    // Requester cannot be the current speaker
    if (requester === currentSpeaker) {
      return {
        isValid: false,
        reason: 'Current speaker cannot request a POI to themselves'
      };
    }

    // Check if it's a valid POI period
    const isValidPOIPeriod = checkPOIPeriod(currentSpeaker, state.currentSpeakerIndex);
    const isProtected = isProtectedTime(currentSpeaker, state.currentSpeakerIndex, state.timeRemaining);

    if (!isValidPOIPeriod) {
      return {
        isValid: false,
        reason: 'Not a valid POI period according to CPDL rules'
      };
    }

    if (isProtected) {
      return {
        isValid: false,
        reason: 'Currently in protected time - POIs not allowed'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Processes the content of an accepted POI
   * @param request The POI request to process
   */
  private processPOIContent(request: POIRequest): void {
    // Add the POI content to the transcript as an interruption
    this.store.getState().addTranscriptEntry({
      speaker: request.requester,
      content: request.content,
      type: 'poi-response', // Using response type since it's now integrated
      wordCount: request.content.split(/\s+/).length
    });

    // The current speaker should now address the POI
    // This would typically involve generating a response from the target speaker
    // which is handled in the debate engine
  }

  /**
   * Gets all pending POI requests
   * @returns Array of pending POI requests
   */
  public getPendingPOIs(): POIRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(request => request.status === 'pending');
  }

  /**
   * Gets a specific POI request by ID
   * @param poiId The ID of the POI request
   * @returns The POI request or null if not found
   */
  public getPOIById(poiId: string): POIRequest | null {
    return this.pendingRequests.get(poiId) || null;
  }

  /**
   * Clears all pending POI requests
   */
  public clearAllPOIs(): void {
    this.pendingRequests.clear();
  }

  /**
   * Checks if a speaker can request a POI at the current moment
   * @param speaker The speaker wanting to request a POI
   * @returns Boolean indicating if a POI can be requested
   */
  public canRequestPOI(speaker: SpeakerRole): boolean {
    const state = this.store.getState();
    const currentSpeaker = state.currentSpeaker;

    if (!currentSpeaker) return false;
    
    // Can't request POI if you're speaking
    if (speaker === currentSpeaker) return false;
    
    // Can't request POI if it's protected time
    const isProtected = isProtectedTime(currentSpeaker, state.currentSpeakerIndex, state.timeRemaining);
    
    return !isProtected;
  }

  /**
   * Gets the current number of pending POIs
   * @returns Number of pending POI requests
   */
  public getPendingPOICount(): number {
    return this.getPendingPOIs().length;
  }
}

// Export a singleton instance of the POI mechanism
export const poiMechanism = new POIMechanism();

// Export individual functions for easier access
export const requestPOI = async (requester: SpeakerRole, content: string): Promise<string | null> => {
  return await poiMechanism.requestPOI(requester, content);
};

export const acceptPOI = (poiId: string): boolean => {
  return poiMechanism.acceptPOI(poiId);
};

export const rejectPOI = (poiId: string, reason?: string): boolean => {
  return poiMechanism.rejectPOI(poiId, reason);
};

export const validatePOIRequest = (requester: SpeakerRole, target: SpeakerRole): { isValid: boolean; reason?: string } => {
  return poiMechanism.validatePOIRequest(requester, target);
};

export const getPendingPOIs = (): POIRequest[] => {
  return poiMechanism.getPendingPOIs();
};