import { useDebateStore } from '../store/debateStore';

export function DebateControls() {
  const { status, pauseDebate, resumeDebate, resetDebate } = useDebateStore();

  // Don't show controls when idle
  if (status === 'idle') {
    return null;
  }

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart the debate? All progress will be lost.')) {
      resetDebate();
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Pause/Resume Button */}
      {status === 'active' ? (
        <button
          onClick={pauseDebate}
          className="flex items-center gap-2 min-w-28 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
          aria-label="Pause debate"
        >
          <span className="text-lg">⏸</span>
          <span>Pause</span>
        </button>
      ) : status === 'paused' ? (
        <button
          onClick={resumeDebate}
          className="flex items-center gap-2 min-w-28 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
          aria-label="Resume debate"
        >
          <span className="text-lg">▶</span>
          <span>Resume</span>
        </button>
      ) : null}

      {/* Restart Button - Always visible when not idle */}
      <button
        onClick={handleRestart}
        className="flex items-center gap-2 min-w-28 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
        aria-label="Restart debate"
      >
        <span className="text-lg">↺</span>
        <span>Restart</span>
      </button>
    </div>
  );
}

export default DebateControls;
