import { useState, useEffect } from 'react';
import { DEBATE_MOTION_REGEX } from '../lib/constants';

interface MotionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MotionInput({ value, onChange, disabled = false }: MotionInputProps) {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate on value change
  useEffect(() => {
    setIsValid(DEBATE_MOTION_REGEX.test(value));
  }, [value]);

  const showError = touched && value.length > 0 && !isValid;
  const showValid = touched && isValid;

  return (
    <div className="w-full">
      <label 
        htmlFor="motion-input" 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Debate Motion
      </label>
      
      <textarea
        id="motion-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        rows={3}
        placeholder="This House believes that..."
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed text-gray-500 border-gray-200' 
            : showError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : showValid
                ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }
        `}
      />
      
      {/* Character count and validation message */}
      <div className="mt-2 flex justify-between items-center">
        <div>
          {showError && (
            <p className="text-sm text-red-600 animate-fade-in">
              Motion must start with "This House believes that..."
            </p>
          )}
          {showValid && (
            <p className="text-sm text-green-600 animate-fade-in">
              Valid motion format
            </p>
          )}
        </div>
        
        <span className={`text-xs ${value.length > 200 ? 'text-yellow-600' : 'text-gray-400'}`}>
          {value.length} characters
        </span>
      </div>
    </div>
  );
}

export default MotionInput;
