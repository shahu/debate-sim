import { useState, useEffect, useRef } from 'react';
import { DebateTimer, SpeakerRole } from '../types/debate';
import { DEFAULT_TIMERS } from '../lib/constants';

interface UseDebateTimerProps {
  initialTime?: number;
  role?: SpeakerRole;
  onTick?: (remaining: number) => void;
  onTimeout?: () => void;
}

export const useDebateTimer = ({ initialTime, role, onTick, onTimeout }: UseDebateTimerProps = {}) => {
  const [timer, setTimer] = useState<DebateTimer>({
    timeRemaining: initialTime || (role ? DEFAULT_TIMERS[role] : 0),
    isRunning: false,
    startTime: undefined,
    currentTime: undefined,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Start the timer
  const start = () => {
    if (!timer.isRunning) {
      const startTime = new Date();
      startTimeRef.current = startTime;
      
      setTimer(prev => ({
        ...prev,
        isRunning: true,
        startTime,
        currentTime: startTime,
      }));

      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.timeRemaining <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            // Call timeout callback if provided
            if (onTimeout) {
              setTimeout(onTimeout, 0); // Execute in next tick to avoid blocking state update
            }
            return {
              ...prev,
              timeRemaining: 0,
              isRunning: false,
            };
          }
          
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // Call tick callback if provided
          if (onTick) {
            onTick(newTimeRemaining);
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining,
            currentTime: new Date(),
          };
        });
      }, 1000);
    }
  };

  // Pause the timer
  const pause = () => {
    if (timer.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      setTimer(prev => ({
        ...prev,
        isRunning: false,
      }));
    }
  };

  // Reset the timer
  const reset = (newTime?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const timeToSet = newTime !== undefined 
      ? newTime 
      : (role ? DEFAULT_TIMERS[role] : initialTime || 0);
    
    setTimer({
      timeRemaining: timeToSet,
      isRunning: false,
      startTime: undefined,
      currentTime: undefined,
    });
  };

  // Set a specific time remaining
  const setTime = (newTime: number) => {
    setTimer(prev => ({
      ...prev,
      timeRemaining: newTime,
    }));
    
    // Call tick callback if provided
    if (onTick) {
      onTick(newTime);
    }
  };

  // Format time as MM:SS
  const formatTime = (): string => {
    const minutes = Math.floor(timer.timeRemaining / 60);
    const seconds = timer.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate elapsed time
  const getElapsedTime = (): number => {
    if (!timer.startTime) return 0;
    const now = timer.currentTime || new Date();
    return Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timer,
    start,
    pause,
    reset,
    setTime,
    formatTime,
    getElapsedTime,
    isRunning: timer.isRunning,
    timeRemaining: timer.timeRemaining,
  };
};

export default useDebateTimer;