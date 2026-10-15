import React from 'react';

/**
 * Common Card component with radius and color tokens.
 * Variants: white, dark, forest, mintLight, outline
 */
export const Card = ({
  children,
  variant = 'white',
  radius = 'md', // sm (8px), md (12px), lg (16px), hero (20px)
  padding = 'md', // none, sm, md, lg
  className = '',
  onClick,
  ...props
}) => {
  const radiusStyles = {
    sm: 'rounded-[8px]',
    md: 'rounded-[12px]',
    lg: 'rounded-[16px]',
    hero: 'rounded-[20px]'
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  };

  const variantStyles = {
    white: 'bg-white text-[#051F20] border border-[#8EB69B]/20 shadow-[0_2px_8px_rgba(5,31,32,0.04)]',
    dark: 'bg-[#0B2B26] text-white border border-[#163832]',
    forest: 'bg-[#163832] text-white border border-[#0B2B26]',
    deepest: 'bg-[#051F20] text-white border border-[#0B2B26]',
    mintLight: 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/40',
    outline: 'bg-transparent text-[#051F20] border-2 border-dashed border-[#8EB69B]/40'
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`transition-all duration-200 ${radiusStyles[radius] || radiusStyles.md} ${paddingStyles[padding] || paddingStyles.md} ${variantStyles[variant] || variantStyles.white} ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-[#8EB69B]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
