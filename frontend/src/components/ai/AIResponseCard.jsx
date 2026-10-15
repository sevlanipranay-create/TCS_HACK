import React from 'react';
import Card from '../common/Card.jsx';
import Badge from '../common/Badge.jsx';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';

export const AIResponseCard = ({
  title = 'AI Mentor Analysis',
  subtitle,
  category = 'Recommendation',
  children,
  actions,
  className = ''
}) => {
  return (
    <Card
      variant="white"
      radius="lg"
      className={`border-l-4 border-l-[#8EB69B] shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#051F20] flex items-center justify-center font-bold text-sm shadow-2xs">
            🧠
          </div>
          <div>
            <h3 className="text-base font-bold text-[#051F20] flex items-center gap-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#71877E]">{subtitle}</p>
            )}
          </div>
        </div>
        <Badge variant="mint" size="sm">
          {category}
        </Badge>
      </div>

      <div className="text-sm text-[#051F20] space-y-3 leading-relaxed">
        {children}
      </div>

      {actions && (
        <div className="mt-4 pt-3 border-t border-[#DAF1DE] flex items-center justify-end gap-2.5">
          {actions}
        </div>
      )}
    </Card>
  );
};

export default AIResponseCard;
