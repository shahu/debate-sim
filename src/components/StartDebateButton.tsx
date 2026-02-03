import { useDebateStore } from '../store/debateStore';
import { debateEngine } from '../lib/debateEngine';
import { DEBATE_MOTION_REGEX } from '../lib/constants';

interface StartDebateButtonProps {
  motion: string;
  disabled?: boolean;
}

export function StartDebateButton({ motion, disabled = false }: StartDebateButtonProps) {
  const { startDebate, status } = useDebateStore();

  const isValidMotion = DEBATE_MOTION_REGEX.test(motion);
  const isLoading = status === 'preparing';
  const isDisabled = disabled || !isValidMotion || status !== 'idle';

  const handleClick = () => {
    if (isValidMotion && status === 'idle') {
      // First update store state
      startDebate(motion);
      // Then trigger engine to start streaming and timer
      debateEngine.startDebate(motion);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex items-center justify-center gap-3 px-8 py-3 text-lg font-semibold rounded-lg
        transition-all duration-200 shadow-sm
        ${isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:scale-[0.98]'
        }
      `}
      aria-label={isLoading ? 'Preparing debate...' : 'Start debate'}
    >
      {isLoading ? (
        <>
          {/* Spinner */}
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" cy="12" r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Preparing...</span>
        </>
      ) : (
        <>
          {/* Play icon */}
          <span className="text-xl">▶</span>
          <span>Start Debate</span>
        </>
      )}
    </button>
  );
}

export default StartDebateButton;
