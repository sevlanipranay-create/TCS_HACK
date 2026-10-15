import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Common ErrorState component with retry action.
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load mentor data. Please try again or check your connectivity.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white border border-[#C75C5C]/30 rounded-[16px] text-center max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#C75C5C]/10 text-[#C75C5C] flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[#051F20] mb-1">{title}</h4>
      <p className="text-xs text-[#71877E] mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RotateCcw}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
