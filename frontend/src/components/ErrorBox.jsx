import React from 'react';

export function ErrorBox({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-box" role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        <span style={{ fontWeight: 600 }}>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss error"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default ErrorBox;
