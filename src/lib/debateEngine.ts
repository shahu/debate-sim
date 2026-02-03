import { SpeakerRole } from '../types/debate';
import { generateSpeakerContent, streamSpeakerContent } from './aiAgents';
import { timerService } from './timerService';
import type { DebateState } from '../store/debateStore';

// Store interface for type safety
interface StoreActions {
  getState: () => DebateState;
  startDebate: (motion: string) => void;
  nextSpeaker: () => void;
  addTranscriptEntry: (entry: any) => void;
  startStreamingEntry: (speaker: SpeakerRole, streamGenerator: AsyncIterable<string>) => void;
  cancelStreamingEntry: () => void;
  endDebate: () => void;
  pauseDebate: () => void;
  resumeDebate: () => void;
  resetDebate: () => void;
}

// Debate engine class to orchestrate the debate
class DebateEngine {
  private isRunning: boolean = false;
  private storeActions: StoreActions | null = null;
  
  /**
   * Sets the store actions - must be called before using the engine
   */
  public setStore(actions: StoreActions): void {
    this.storeActions = actions;
  }
  
  /**
   * Gets current store state
   */
  private getState(): DebateState {
    if (!this.storeActions) {
      throw new Error('Store not initialized. Call setStore() first.');
    }
    return this.storeActions.getState();
  }

  /**
   * Starts a new debate with the given motion
   * @param motion The debate motion
   */
  public startDebate(motion: string): void {
    if (this.isRunning) {
      console.warn('Debate is already running');
      return;
    }

    if (!this.storeActions) {
      console.error('Store not initialized');
      return;
    }

    // Initialize debate state
    this.storeActions.startDebate(motion);
    this.isRunning = true;
    
    // Start the timer countdown
    timerService.start();
    
    // Start the first speaker's turn
    this.handleTurn();
  }

  /**
   * Advances to the next speaker in the sequence
   */
  public nextSpeaker(): void {
    console.log('[DebateEngine] nextSpeaker() called');
    if (!this.storeActions) {
      console.error('[DebateEngine] Store not initialized!');
      return;
    }
    this.storeActions.nextSpeaker();
    this.handleTurn();
  }

  /**
   * Handles the current speaker's turn, including content generation
   */
  private async handleTurn(): Promise<void> {
    if (!this.storeActions) return;
    
    const state = this.getState();
    const currentSpeaker = state.currentSpeaker;

    if (!currentSpeaker) {
      console.error('No current speaker set');
      return;
    }

    try {
      // Get previous statements for context
      const previousStatements = state.transcript
        .filter(entry => entry.type === 'speech')
        .map(entry => ({
          role: entry.speaker,
          content: entry.content
        }));

      // Get stream generator for the current speaker
      const streamGen = streamSpeakerContent(
        currentSpeaker,
        state.motion || '',
        previousStatements
      );

      // Pass to store to start streaming entry (fire-and-forget)
      console.log(`Starting streaming for ${currentSpeaker}`);
      this.storeActions.startStreamingEntry(currentSpeaker, streamGen);

      // Timer service handles auto-advancing speakers when time runs out
      // Streaming happens in background via hooks, engine just initiates it
    } catch (error) {
      console.error(`Error handling turn for ${currentSpeaker}:`, error);
      // Cancel streaming if it fails
      this.storeActions.cancelStreamingEntry();
      // Move to next speaker even if there's an error
      this.nextSpeaker();
    }
  }

  /**
   * Processes a POI request during the debate
   * @param requester The speaker requesting the POI
   * @param poiContent The content of the POI
   */
  public async handlePOI(requester: SpeakerRole, poiContent: string): Promise<void> {
    if (!this.storeActions) return;
    
    const state = this.getState();
    const currentSpeaker = state.currentSpeaker;
    
    if (!currentSpeaker) {
      console.error('No current speaker to handle POI');
      return;
    }

    // Add POI request to transcript
    this.storeActions.addTranscriptEntry({
      speaker: requester,
      content: poiContent,
      type: 'poi-request'
    });

    // Get the current speaker's response to the POI
    try {
      // Get recent context for the current speaker
      const recentTranscript = state.transcript.slice(-5); // Get last 5 entries
      const previousStatements = recentTranscript.map(entry => ({
        role: entry.speaker,
        content: entry.content
      }));

      // Generate response to POI
      const content = await generateSpeakerContent(
        currentSpeaker,
        state.motion || '',
        previousStatements,
        { requester, content: poiContent }
      );

      // Add POI response to transcript
      this.storeActions.addTranscriptEntry({
        speaker: currentSpeaker,
        content: content.content,
        type: 'poi-response',
        wordCount: content.wordCount
      });
    } catch (error) {
      console.error(`Error handling POI for ${currentSpeaker}:`, error);
      
      // Add default response if AI generation fails
      this.storeActions.addTranscriptEntry({
        speaker: currentSpeaker,
        content: "I'm unable to address that POI right now, please continue with your argument.",
        type: 'poi-response'
      });
    }
  }

  /**
   * Ends the current debate
   */
  public endDebate(): void {
    if (!this.isRunning) {
      console.warn('Debate is not running');
      return;
    }

    if (this.storeActions) {
      this.storeActions.endDebate();
    }
    this.isRunning = false;
    
    // Stop the timer
    timerService.stop();
  }

  /**
   * Pauses the debate
   */
  public pauseDebate(): void {
    if (!this.isRunning) {
      console.warn('Debate is not running');
      return;
    }

    if (this.storeActions) {
      this.storeActions.pauseDebate();
    }
    this.isRunning = false;
    
    // Pause the timer
    timerService.pause();
  }

  /**
   * Resumes the debate
   */
  public resumeDebate(): void {
    const state = this.getState();
    if (state.status !== 'paused') {
      console.warn('Debate is not paused');
      return;
    }

    if (this.storeActions) {
      this.storeActions.resumeDebate();
    }
    this.isRunning = true;
    
    // Resume the timer
    timerService.resume();
    
    this.handleTurn(); // Continue with current speaker's turn
  }

  /**
   * Gets the current debate state
   */
  public getCurrentState(): DebateState {
    return this.getState();
  }

  /**
   * Resets the debate engine to initial state
   */
  public reset(): void {
    this.endDebate();
    if (this.storeActions) {
      this.storeActions.resetDebate();
    }
  }

  /**
   * Checks if the debate is currently active
   */
  public isActive(): boolean {
    return this.isRunning && this.getState().status === 'active';
  }
}

// Export a singleton instance of the debate engine
export const debateEngine = new DebateEngine();

// Export individual functions for more granular control
export const startDebate = (motion: string): void => {
  debateEngine.startDebate(motion);
};

export const nextSpeaker = (): void => {
  debateEngine.nextSpeaker();
};

export const handlePOI = async (requester: SpeakerRole, poiContent: string): Promise<void> => {
  return await debateEngine.handlePOI(requester, poiContent);
};

export const endDebate = (): void => {
  debateEngine.endDebate();
};
