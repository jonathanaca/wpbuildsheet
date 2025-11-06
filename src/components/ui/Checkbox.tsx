import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const checkboxClasses = `
      h-5 w-5 rounded-lg border-2 border-primary/30 dark:border-electric-cyan/30 text-primary dark:text-electric-cyan
      focus:ring-2 focus:ring-primary dark:focus:ring-electric-cyan focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-300
      checked:bg-gradient-to-br checked:from-primary checked:to-electric-cyan
      checked:border-transparent
      ${className}
    `;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={checkboxClasses}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3">
            <label htmlFor={props.id} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              {label}
            </label>
            {error && (
              <p className="mt-1 text-sm text-electric-rose font-medium">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
