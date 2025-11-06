import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative glass-strong rounded-2xl shadow-glass dark:shadow-glass-dark border border-primary/20 dark:border-electric-cyan/20 overflow-hidden group animate-fade-in ${className}`}>
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-electric-purple to-electric-pink opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />

      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-electric-purple to-electric-pink" />

      {title && (
        <div className="relative px-6 py-4 border-b border-primary/10 dark:border-electric-cyan/10">
          <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-electric-purple dark:from-electric-cyan dark:to-electric-purple bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
      )}
      <div className="relative p-6">{children}</div>
    </div>
  );
};
