import React from 'react';

/**
 * Common Badge component.
 * Variants: success, warning, error, info, mint, dark, neutral
 */
export const Badge = ({
  children,
  variant = 'mint',
  size = 'md',
  className = '',
  icon: Icon
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-[6px] gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-[8px] gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-[10px] gap-1.5 font-semibold'
  };

  const variantStyles = {
    mint: 'bg-[#DAF1DE] text-[#0B2B26] border border-[#8EB69B]/40',
    dark: 'bg-[#051F20] text-white',
    forest: 'bg-[#163832] text-[#DAF1DE]',
    success: 'bg-[#4F8A6A]/15 text-[#4F8A6A] border border-[#4F8A6A]/30',
    warning: 'bg-[#C99A3D]/15 text-[#C99A3D] border border-[#C99A3D]/30',
    error: 'bg-[#C75C5C]/15 text-[#C75C5C] border border-[#C75C5C]/30',
    info: 'bg-[#5C8AC7]/15 text-[#5C8AC7] border border-[#5C8AC7]/30',
    neutral: 'bg-gray-100 text-[#49645C] border border-gray-200'
  };

  return (
    <span className={`inline-flex items-center tracking-wide ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.mint} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
