import React from 'react';

/**
 * Common ProgressBar with custom brand coloring and optional status thresholds.
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md', // sm, md, lg
  showLabel = false,
  label = '',
  variant = 'mint', // mint, forest, success, warning, error
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const variantStyles = {
    mint: 'bg-[#8EB69B]',
    forest: 'bg-[#163832]',
    deep: 'bg-[#051F20]',
    success: 'bg-[#4F8A6A]',
    warning: 'bg-[#C99A3D]',
    error: 'bg-[#C75C5C]'
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-medium text-[#49645C] mb-1.5">
          <span>{label}</span>
          <span className="font-semibold text-[#051F20]">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-[#DAF1DE] rounded-full overflow-hidden ${sizeStyles[size] || sizeStyles.md}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${variantStyles[variant] || variantStyles.mint}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
