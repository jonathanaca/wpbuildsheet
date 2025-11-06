import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = `
      w-full px-4 py-2.5 rounded-xl glass
      focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-electric-cyan focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-300
      text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
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
        <input ref={ref} className={inputClasses} {...props} />
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

Input.displayName = 'Input';
