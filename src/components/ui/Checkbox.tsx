import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const checkboxClasses = `
      h-4 w-4 rounded border-gray-300 text-primary
      focus:ring-2 focus:ring-primary focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
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
            <label htmlFor={props.id} className="text-sm text-gray-700 cursor-pointer">
              {label}
            </label>
            {error && (
              <p className="mt-1 text-sm text-danger">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
