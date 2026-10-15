import React from 'react';
import Card from '../common/Card.jsx';
import { HelpCircle } from 'lucide-react';

export const AIQuestion = ({
  number,
  question,
  hint,
  children,
  className = ''
}) => {
  return (
    <Card
      variant="white"
      radius="md"
      className={`border border-[#DAF1DE] hover:border-[#8EB69B]/50 transition-colors ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#051F20] text-[#DAF1DE] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          {number || '?'}
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold text-[#051F20] leading-snug">
            {question}
          </h4>
          {hint && (
            <p className="text-xs text-[#71877E] leading-relaxed">
              💡 {hint}
            </p>
          )}
          {children && (
            <div className="pt-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AIQuestion;
