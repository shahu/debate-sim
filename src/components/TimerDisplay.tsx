interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
}

// Format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function TimerDisplay({ timeRemaining, isRunning }: TimerDisplayProps) {
  // Determine urgency level
  const isWarning = timeRemaining <= 60 && timeRemaining > 30;
  const isCritical = timeRemaining <= 30 && timeRemaining > 0;
  const isPaused = !isRunning && timeRemaining > 0;
  
  // Dynamic styling based on urgency
  let textColor = 'text-gray-800';
  let animationClass = '';
  
  if (isCritical) {
    textColor = 'text-red-600';
    animationClass = 'animate-pulse';
  } else if (isWarning) {
    textColor = 'text-yellow-600';
    animationClass = 'animate-pulse';
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
      {/* Timer Display */}
      <div className={`font-mono text-6xl font-bold ${textColor} ${animationClass} transition-colors duration-300`}>
        {formatTime(timeRemaining)}
      </div>
      
      {/* Status Indicator */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {isPaused ? (
          <>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-600 font-medium">PAUSED</span>
          </>
        ) : isRunning ? (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">SPEAKING</span>
          </>
        ) : (
          <>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500 font-medium">READY</span>
          </>
        )}
      </div>
      
      {/* Urgency Warning */}
      {isCritical && (
        <div className="mt-3 text-red-600 text-sm font-medium animate-bounce">
          Time is running out!
        </div>
      )}
      {isWarning && !isCritical && (
        <div className="mt-3 text-yellow-600 text-sm font-medium">
          Less than one minute remaining
        </div>
      )}
    </div>
  );
}

export default TimerDisplay;
