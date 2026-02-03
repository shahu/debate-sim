// Timer service to manage debate countdown
// This runs outside the store to avoid circular dependencies and state management issues

import { useDebateStore } from '../store/debateStore';
import { debateEngine } from './debateEngine';

class TimerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      const state = useDebateStore.getState();
      
      // Only decrement if debate is active and time remains
      if (state.status === 'active' && state.timeRemaining > 0) {
        useDebateStore.getState().setTimeRemaining(state.timeRemaining - 1);
      }
      
      // Auto-advance to next speaker when time runs out
      if (state.status === 'active' && state.timeRemaining <= 1) {
        // Time's up - move to next speaker
        const { currentSpeakerIndex, speakingSequence } = state;
        if (currentSpeakerIndex < speakingSequence.length - 1) {
          // IMPORTANT: Use debateEngine.nextSpeaker() to trigger streaming
          // Don't call store.nextSpeaker() directly or streaming won't start
          debateEngine.nextSpeaker();
        } else {
          // Last speaker finished
          this.stop();
          useDebateStore.getState().endDebate();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  pause() {
    this.stop();
  }

  resume() {
    this.start();
  }
}

// Export singleton instance
export const timerService = new TimerService();
