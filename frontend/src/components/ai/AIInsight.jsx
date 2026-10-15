import React from 'react';
import Card from '../common/Card.jsx';
import { AlertCircle, CheckCircle, Info, Flame } from 'lucide-react';

/**
 * AIInsight component for callouts, risks, strengths, and edge cases.
 * Types: tip, warning, success, risk
 */
export const AIInsight = ({
  type = 'tip',
  title,
  children,
  className = ''
}) => {
  const configs = {
    tip: {
      bg: 'bg-[#DAF1DE]/50',
      border: 'border-[#8EB69B]',
      icon: Info,
      iconColor: 'text-[#49645C]',
      titleColor: 'text-[#051F20]'
    },
    warning: {
      bg: 'bg-[#C99A3D]/10',
      border: 'border-[#C99A3D]/40',
      icon: AlertCircle,
      iconColor: 'text-[#C99A3D]',
      titleColor: 'text-[#051F20]'
    },
    risk: {
      bg: 'bg-[#C75C5C]/10',
      border: 'border-[#C75C5C]/40',
      icon: Flame,
      iconColor: 'text-[#C75C5C]',
      titleColor: 'text-[#051F20]'
    },
    success: {
      bg: 'bg-[#4F8A6A]/10',
      border: 'border-[#4F8A6A]/40',
      icon: CheckCircle,
      iconColor: 'text-[#4F8A6A]',
      titleColor: 'text-[#051F20]'
    }
  };

  const current = configs[type] || configs.tip;
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-[12px] border ${current.bg} ${current.border} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
        <div className="space-y-1 text-xs md:text-sm">
          {title && (
            <h5 className={`font-bold ${current.titleColor}`}>{title}</h5>
          )}
          <div className="text-[#49645C] leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsight;
