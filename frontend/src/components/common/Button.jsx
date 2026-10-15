import React from 'react';

/**
 * Common Button component adhering to design system tokens.
 * Variants: primary, secondary, outline, ghost, danger, mint
 * Sizes: sm, md, lg
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none focus:outline-none focus:ring-2 focus:ring-[#8EB69B] focus:ring-offset-1';
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-[10px] gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-[11px] gap-2',
    lg: 'text-base px-5 py-3 rounded-[12px] gap-2.5 font-semibold'
  };

  const variantStyles = {
    primary: 'bg-[#051F20] text-white hover:bg-[#0B2B26] active:bg-[#163832] shadow-sm',
    secondary: 'bg-[#163832] text-white hover:bg-[#0B2B26] active:bg-[#051F20]',
    mint: 'bg-[#8EB69B] text-[#051F20] hover:bg-[#7ba689] active:bg-[#6c987a] font-semibold shadow-sm',
    outline: 'border border-[#8EB69B] text-[#051F20] bg-transparent hover:bg-[#DAF1DE]/40 active:bg-[#DAF1DE]',
    ghost: 'text-[#49645C] hover:text-[#051F20] hover:bg-[#DAF1DE]/50 active:bg-[#DAF1DE]',
    danger: 'bg-[#C75C5C] text-white hover:bg-[#b54f4f] active:bg-[#9f3f3f]'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
