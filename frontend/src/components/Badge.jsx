import React from 'react';

export function Badge({ children, variant = 'mint', className = '' }) {
  const variantClass = {
    mint: 'badge-mint',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info'
  }[variant] || 'badge-mint';

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
