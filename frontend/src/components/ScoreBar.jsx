import React from 'react';

export function ScoreBar({ score = 1, max = 5 }) {
  const current = Math.max(1, Math.min(max, Number(score) || 1));

  return (
    <div className="score-5-segments" title={`Score: ${current} of ${max}`}>
      {[1, 2, 3, 4, 5].map((seg) => (
        <div
          key={seg}
          className={`score-segment ${seg <= current ? 'active' : ''}`}
        />
      ))}
      <span style={{ fontSize: '11px', fontWeight: 700, marginLeft: '4px' }}>
        {current}/{max}
      </span>
    </div>
  );
}

export default ScoreBar;
