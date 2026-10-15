import React from 'react';

export function Spinner({ size = 'md', text = 'Loading...' }) {
  const dim = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} role="status">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      {text && <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Spinner;
