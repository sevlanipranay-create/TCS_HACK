import React from 'react';

/**
 * Common Input component with label, error, and icon support.
 */
export const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#051F20] uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-[#C75C5C]">*</span>}
        </label>
      )}
      <div className="relative rounded-[11px] shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71877E]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full text-sm text-[#051F20] bg-white border rounded-[11px] transition-all duration-150 py-2.5 
            ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'}
            ${error ? 'border-[#C75C5C] focus:ring-2 focus:ring-[#C75C5C]/20' : 'border-[#8EB69B]/40 focus:border-[#051F20] focus:ring-2 focus:ring-[#8EB69B]/30'}
            disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-[#71877E]/70`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#C75C5C] font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#71877E]">{helperText}</p>}
    </div>
  );
};

export default Input;
