import React from 'react';

export function Card({
  children,
  variant = 'white', // 'white' | 'hero' | 'dark' | 'mint'
  className = '',
  onClick,
  ...props
}) {
  const variantClass = {
    white: 'card',
    hero: 'card card-hero',
    dark: 'card card-dark',
    mint: 'card card-mint'
  }[variant] || 'card';

  return (
    <div
      className={`${variantClass} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
