import React from 'react';

/**
 * Common LoadingState indicator with contextual hackathon mentor text.
 */
export const LoadingState = ({
  message = 'AI Mentor is analyzing your hackathon project...',
  subtext = 'Validating assumptions and computing recommendations.',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#DAF1DE] border-t-[#051F20] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-sm">
          🧠
        </div>
      </div>
      <p className="text-base font-semibold text-[#051F20]">{message}</p>
      {subtext && <p className="text-xs text-[#71877E] mt-1.5 max-w-sm">{subtext}</p>}
    </div>
  );
};

export default LoadingState;
