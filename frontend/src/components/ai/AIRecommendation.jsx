import React from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import { Lightbulb, ArrowRight, CheckCircle2 } from '../common/Icons.jsx';

export const AIRecommendation = ({
  title = 'AI Mentor Recommendation',
  description,
  rationale,
  actionText = 'Apply Recommendation',
  onAction,
  factors = [],
  className = ''
}) => {
  return (
    <Card
      variant="mintLight"
      radius="lg"
      className={`border border-[#8EB69B] shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#051F20] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Lightbulb className="w-5 h-5 text-[#8EB69B]" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#163832]">
                Mentor Verdict
              </span>
            </div>
            <h4 className="text-base font-bold text-[#051F20]">{title}</h4>
            {description && (
              <p className="text-sm text-[#49645C] font-normal leading-relaxed">
                {description}
              </p>
            )}

            {factors && factors.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {factors.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-[10px] bg-white/80 border border-[#8EB69B]/30 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#051F20]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4F8A6A]" />
                      <span>{f.factor || f.name}</span>
                    </div>
                    {f.comment && (
                      <p className="text-[11px] text-[#71877E] mt-1">{f.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {actionText && onAction && (
          <div className="shrink-0 self-start sm:self-center">
            <Button
              variant="primary"
              size="sm"
              onClick={onAction}
              icon={ArrowRight}
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIRecommendation;
