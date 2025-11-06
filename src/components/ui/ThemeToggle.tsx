import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-10 w-20 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 glass-strong glow-on-hover group"
      aria-label="Toggle theme"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-electric-purple opacity-20 group-hover:opacity-30 transition-opacity" />

      {/* Toggle circle */}
      <div
        className={`
          relative flex items-center justify-center h-8 w-8 rounded-full
          transition-all duration-300 ease-in-out transform
          ${theme === 'dark' ? 'translate-x-10 bg-gradient-to-br from-electric-purple to-electric-pink' : 'translate-x-1 bg-gradient-to-br from-electric-amber to-electric-orange'}
          shadow-lg
        `}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Icons on the track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={`w-4 h-4 transition-opacity ${theme === 'light' ? 'opacity-0' : 'opacity-40'} text-electric-amber`} />
        <Moon className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'opacity-0' : 'opacity-40'} text-electric-purple`} />
      </div>
    </button>
  );
};
