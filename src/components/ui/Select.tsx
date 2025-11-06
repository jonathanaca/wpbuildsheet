import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    const selectClasses = `
      w-full px-4 py-2.5 rounded-xl glass
      focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-electric-cyan focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-300
      text-gray-900 dark:text-white
      ${error ? 'ring-2 ring-danger focus:ring-danger' : 'border-primary/20 dark:border-electric-cyan/20'}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold mb-2 text-primary-700 dark:text-electric-cyan">
            {label}
            {props.required && <span className="text-electric-rose ml-1">*</span>}
          </label>
        )}
        <select ref={ref} className={selectClasses} {...props}>
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-electric-rose font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
