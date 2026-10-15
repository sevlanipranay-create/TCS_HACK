import React from 'react';
import Card from '../common/Card.jsx';
import ProgressBar from '../common/ProgressBar.jsx';

export const ScoreCard = ({
  title,
  score,
  maxScore = 100,
  status,
  description,
  className = ''
}) => {
  const percentage = Math.round((score / maxScore) * 100);

  const getProgressVariant = (p) => {
    if (p >= 85) return 'success';
    if (p >= 70) return 'mint';
    if (p >= 50) return 'warning';
    return 'error';
  };

  return (
    <Card
      variant="white"
      radius="md"
      padding="sm"
      className={`border border-[#DAF1DE] hover:border-[#8EB69B]/40 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-[#051F20] truncate">{title}</h4>
        <span className="text-sm font-extrabold text-[#051F20]">
          {score}
          <span className="text-[10px] text-[#71877E] font-normal">/{maxScore}</span>
        </span>
      </div>

      <ProgressBar
        value={score}
        max={maxScore}
        size="sm"
        variant={getProgressVariant(percentage)}
      />

      {(status || description) && (
        <div className="flex items-center justify-between mt-2 pt-1 text-[11px]">
          {status && (
            <span className="font-semibold text-[#49645C]">{status}</span>
          )}
          {description && (
            <span className="text-[#71877E] truncate ml-auto">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
};

export default ScoreCard;
