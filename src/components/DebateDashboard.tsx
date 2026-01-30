import { useState } from 'react';
import { useDebateStore } from '../store/debateStore';
import { SpeakerIndicator } from './SpeakerIndicator';
import { TimerDisplay } from './TimerDisplay';
import { DebateFlowIndicator } from './DebateFlowIndicator';
import { DebateControls } from './DebateControls';
import { TranscriptPanel } from './TranscriptPanel';
import { MotionInput } from './MotionInput';
import { StartDebateButton } from './StartDebateButton';
import { POIControls } from './POIControls';
import { SpeakerRole } from '../types/debate';
import { AudioControls } from './AudioControls';

export function DebateDashboard() {
  const { 
    currentSpeaker, 
    timeRemaining, 
    status, 
    motion: storeMotion
  } = useDebateStore();

  const [motionInput, setMotionInput] = useState('');
  const isRunning = status === 'active';
  const isIdle = status === 'idle';

  return (
    <div className="space-y-6">
      {/* Debate Flow Indicator - Always visible */}
      <DebateFlowIndicator />

      {/* Motion Input Section - Only when idle */}
      {isIdle && (
        <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Start a New Debate</h2>
              <p className="text-gray-500 mt-1">
                Enter your motion below to begin the CPDL debate simulation
              </p>
            </div>
            
            <MotionInput 
              value={motionInput}
              onChange={setMotionInput}
              disabled={!isIdle}
            />
            
            <div className="flex justify-center">
              <StartDebateButton 
                motion={motionInput}
                disabled={!isIdle}
              />
            </div>
          </div>
        </div>
      )}

      {/* Motion Display - When debate is active */}
      {!isIdle && storeMotion && (
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500 animate-fade-in">
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            Motion
          </div>
          <div className="text-lg text-gray-800 font-medium">
            {storeMotion}
          </div>
        </div>
      )}

      {/* Speaker and Timer Section - Only when not idle */}
      {!isIdle && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Current Speaker Indicator */}
          <div key={currentSpeaker || 'none'} className="animate-speaker-pop">
            <SpeakerIndicator speaker={currentSpeaker as SpeakerRole | null} />
          </div>
          
          {/* Timer Display */}
          <TimerDisplay 
            timeRemaining={timeRemaining} 
            isRunning={isRunning} 
          />
        </div>
      )}

      {/* Controls Section - Only when not idle */}
      {!isIdle && (
        <div className="space-y-4 animate-fade-in">
          <DebateControls />
          <POIControls />
        </div>
      )}

      {/* Audio Controls - Always visible */}
      <AudioControls className="animate-fade-in" />

      {/* Transcript Section - Always visible but different states */}
      <TranscriptPanel />

      {/* Status Bar - Always visible */}
      <div className="bg-gray-800 text-white rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-green-400 animate-pulse' :
            status === 'paused' ? 'bg-yellow-400' :
            status === 'completed' ? 'bg-blue-400' :
            'bg-gray-400'
          }`}></div>
          <span className="text-sm font-medium capitalize">{status}</span>
        </div>
        
        <div className="text-sm text-gray-400">
          {currentSpeaker 
            ? `Current: ${currentSpeaker}` 
            : 'No active speaker'
          }
        </div>
      </div>
    </div>
  );
}

export default DebateDashboard;
