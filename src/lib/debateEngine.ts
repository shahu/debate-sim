import { SpeakerRole } from '../types/debate';
import { useDebateStore } from '../store/debateStore';
import { generateSpeakerContent, streamSpeakerContent } from './aiAgents';
import { DebateState } from '../store/debateStore';

// Debate engine class to orchestrate the debate
class DebateEngine {
  private store = useDebateStore;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Starts a new debate with the given motion
   * @param motion The debate motion
   */
  public startDebate(motion: string): void {
    if (this.isRunning) {
      console.warn('Debate is already running');
      return;
    }

    // Initialize debate state
    this.store.getState().startDebate(motion);
    this.isRunning = true;
    
    // Start the first speaker's turn
    this.handleTurn();
  }

  /**
   * Advances to the next speaker in the sequence
   */
  public nextSpeaker(): void {
    this.store.getState().nextSpeaker();
    this.handleTurn();
  }

  /**
   * Handles the current speaker's turn, including content generation
   */
  private async handleTurn(): Promise<void> {
    const state = this.store.getState();
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
      const store = this.store.getState();
      store.startStreamingEntry(currentSpeaker, streamGen);

      // Move to next speaker after a delay (simulating speaking time)
      // Note: Streaming happens in background via hooks, engine just initiates it
      setTimeout(() => {
        const currentState = this.store.getState();
        if (currentState.currentSpeakerIndex < currentState.speakingSequence.length - 1) {
          this.nextSpeaker();
        } else {
          this.endDebate();
        }
      }, 30000); // Fixed 30 seconds per turn for now (will be refined based on actual streaming completion)
    } catch (error) {
      console.error(`Error handling turn for ${currentSpeaker}:`, error);
      // Cancel streaming if it fails
      this.store.getState().cancelStreamingEntry();
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
    const state = this.store.getState();
    const currentSpeaker = state.currentSpeaker;
    
    if (!currentSpeaker) {
      console.error('No current speaker to handle POI');
      return;
    }

    // Add POI request to transcript
    this.store.getState().addTranscriptEntry({
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
      this.store.getState().addTranscriptEntry({
        speaker: currentSpeaker,
        content: content.content,
        type: 'poi-response',
        wordCount: content.wordCount
      });
    } catch (error) {
      console.error(`Error handling POI for ${currentSpeaker}:`, error);
      
      // Add default response if AI generation fails
      this.store.getState().addTranscriptEntry({
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

    this.store.getState().endDebate();
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Pauses the debate
   */
  public pauseDebate(): void {
    if (!this.isRunning) {
      console.warn('Debate is not running');
      return;
    }

    this.store.getState().pauseDebate();
    this.isRunning = false;
  }

  /**
   * Resumes the debate
   */
  public resumeDebate(): void {
    const state = this.store.getState();
    if (state.status !== 'paused') {
      console.warn('Debate is not paused');
      return;
    }

    this.store.getState().resumeDebate();
    this.isRunning = true;
    this.handleTurn(); // Continue with current speaker's turn
  }

  /**
   * Gets the current debate state
   */
  public getState(): DebateState {
    return this.store.getState();
  }

  /**
   * Resets the debate engine to initial state
   */
  public reset(): void {
    this.endDebate();
    this.store.getState().resetDebate();
  }

  /**
   * Checks if the debate is currently active
   */
  public isActive(): boolean {
    return this.isRunning && this.store.getState().status === 'active';
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