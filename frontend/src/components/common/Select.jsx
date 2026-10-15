import React from 'react';

/**
 * Common Select dropdown component.
 */
export const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#051F20] uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-[#C75C5C]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full text-sm text-[#051F20] bg-white border rounded-[11px] px-3.5 py-2.5 appearance-none transition-all duration-150 pr-9
            ${error ? 'border-[#C75C5C] focus:ring-2 focus:ring-[#C75C5C]/20' : 'border-[#8EB69B]/40 focus:border-[#051F20] focus:ring-2 focus:ring-[#8EB69B]/30'}
            disabled:bg-gray-100 disabled:cursor-not-allowed`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#71877E]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-[#C75C5C] font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#71877E]">{helperText}</p>}
    </div>
  );
};

export default Select;
