import React from 'react';

export function FeasibilityBanner({ feasibility }) {
  if (!feasibility) return null;

  const { verdict, score, budget_points, used_points, message } = feasibility;
  const bannerClass = {
    realistic: 'banner-realistic',
    tight: 'banner-tight',
    overscoped: 'banner-overscoped'
  }[verdict] || 'banner-realistic';

  const verdictLabel = {
    realistic: 'Scope Realistic',
    tight: 'Scope Tight',
    overscoped: 'Scope Overscoped'
  }[verdict] || verdict;

  return (
    <div className={`banner-feasibility ${bannerClass}`} role="region" aria-label="Feasibility Assessment">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <strong style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Feasibility Verdict: {verdictLabel}
          </strong>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>
            ({score} / 100)
          </span>
        </div>
        <p style={{ fontSize: '12px', lineHeight: 1.4 }}>
          {message}
        </p>
      </div>
      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '11px', display: 'block', opacity: 0.85 }}>Capacity Points</span>
        <strong style={{ fontSize: '13px' }}>
          {used_points} used / {budget_points} budget
        </strong>
      </div>
    </div>
  );
}

export default FeasibilityBanner;
