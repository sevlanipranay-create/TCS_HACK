import React from 'react';

export function EmptyState({
  icon = '🧠',
  title = 'Create a brief first',
  description = 'Paste your hackathon problem statement to generate an architecture, MVP scope, and timeboxed sprint plan.',
  actionLabel = 'Go to Brief Page',
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-mint btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
