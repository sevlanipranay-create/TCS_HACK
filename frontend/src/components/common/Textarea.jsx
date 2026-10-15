import React from 'react';

/**
 * Common Textarea component.
 */
export const Textarea = ({
  label,
  id,
  rows = 4,
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-[#051F20] uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-[#C75C5C]">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full text-sm text-[#051F20] bg-white border rounded-[12px] p-3 transition-all duration-150 resize-y
          ${error ? 'border-[#C75C5C] focus:ring-2 focus:ring-[#C75C5C]/20' : 'border-[#8EB69B]/40 focus:border-[#051F20] focus:ring-2 focus:ring-[#8EB69B]/30'}
          disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-[#71877E]/70`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#C75C5C] font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#71877E]">{helperText}</p>}
    </div>
  );
};

export default Textarea;
