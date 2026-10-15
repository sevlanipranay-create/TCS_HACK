import React from 'react';

/**
 * Common Tabs navigation component.
 */
export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1.5 p-1 bg-[#DAF1DE]/60 rounded-[12px] border border-[#8EB69B]/30 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-[9px] transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#051F20] text-white shadow-xs'
                : 'text-[#49645C] hover:text-[#051F20] hover:bg-[#DAF1DE]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-[#8EB69B] text-[#051F20]' : 'bg-[#8EB69B]/30 text-[#051F20]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
