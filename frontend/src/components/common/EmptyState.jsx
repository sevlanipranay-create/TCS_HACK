import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Common EmptyState component.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by running analysis or adding a new item.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center bg-white border border-[#DAF1DE] rounded-[16px] ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#DAF1DE]/60 text-[#49645C] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[#051F20] mb-1">{title}</h4>
      <p className="text-xs text-[#71877E] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="mint" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
