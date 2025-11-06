import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-electric-cyan text-white hover:shadow-neon focus:ring-primary transform hover:scale-105 active:scale-95',
    secondary: 'glass-strong text-primary dark:text-electric-cyan hover:shadow-glass dark:hover:shadow-glass-dark transform hover:scale-105 active:scale-95',
    success: 'bg-gradient-to-r from-electric-emerald to-electric-lime text-white hover:shadow-neon focus:ring-success transform hover:scale-105 active:scale-95',
    danger: 'bg-gradient-to-r from-electric-rose to-electric-pink text-white hover:shadow-neon focus:ring-danger transform hover:scale-105 active:scale-95',
    warning: 'bg-gradient-to-r from-electric-amber to-electric-orange text-white hover:shadow-neon focus:ring-warning transform hover:scale-105 active:scale-95',
    purple: 'bg-gradient-to-r from-electric-purple to-electric-pink text-white hover:shadow-neon focus:ring-electric-purple transform hover:scale-105 active:scale-95',
    pink: 'bg-gradient-to-r from-electric-pink to-electric-rose text-white hover:shadow-neon focus:ring-electric-pink transform hover:scale-105 active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled} {...props}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700" />

      {/* Content */}
      <span className="relative flex items-center">
        {Icon && <Icon className="w-5 h-5 mr-2" />}
        {children}
      </span>
    </button>
  );
};
