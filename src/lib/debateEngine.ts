import { SpeakerRole } from '../types/debate';
import { useDebateStore } from '../store/debateStore';
import { generateSpeakerContent } from './aiAgents';
import { TranscriptEntry } from '../store/debateStore';

// Define the structure for debate configuration
interface DebateConfig {
  motion: string;
  startTime?: Date;
  endTime?: Date;
  transcript: TranscriptEntry[];
}

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

      // Generate content for the current speaker
      const content = await generateSpeakerContent(
        currentSpeaker,
        state.motion || '',
        previousStatements
      );

      // Add the generated content to the transcript
      this.store.getState().addTranscriptEntry({
        speaker: content.role,
        content: content.content,
        type: 'speech',
        wordCount: content.wordCount
      });

      // Move to next speaker after a delay (simulating speaking time)
      setTimeout(() => {
        if (state.currentSpeakerIndex < state.speakingSequence.length - 1) {
          this.nextSpeaker();
        } else {
          this.endDebate();
        }
      }, Math.min(content.wordCount * 100, 30000)); // Simulate speaking time based on content length (max 30 seconds per turn)
    } catch (error) {
      console.error(`Error handling turn for ${currentSpeaker}:`, error);
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
  public getState(): typeof this.store.getState() {
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