import React from 'react';

export const PageContainer = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#8EB69B]/20">
          <div>
            <div className="flex items-center gap-2.5">
              {title && (
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#051F20] tracking-tight">
                  {title}
                </h1>
              )}
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm md:text-base text-[#49645C] font-normal max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Page Content */}
      <main className="space-y-6 animate-fadeIn">
        {children}
      </main>
    </div>
  );
};

export default PageContainer;
