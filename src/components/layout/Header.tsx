import React from 'react';
import { Download, Upload, Trash2, Save, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  onExportExcel: () => void;
  onExportJSON: () => void;
  onImport: () => void;
  onClear: () => void;
  onSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportExcel,
  onExportJSON,
  onImport,
  onClear,
  onSave,
}) => {
  return (
    <header className="glass-strong border-b border-primary/10 dark:border-electric-cyan/10 shadow-glass dark:shadow-glass-dark sticky top-0 z-40 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 group">
              {/* Animated gradient logo */}
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-electric-purple to-electric-pink flex items-center justify-center text-white font-bold text-xl shadow-neon group-hover:shadow-neon-lg transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black gradient-text">PlaceOS</h1>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Workplace Onboarding Build Sheet</p>
              </div>
            </div>
          </div>

          {/* Actions and theme toggle */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-primary/30 dark:via-electric-cyan/30 to-transparent" />

            <Button variant="purple" size="sm" onClick={onSave} icon={Save}>
              Save
            </Button>
            <Button variant="secondary" size="sm" onClick={onImport} icon={Upload}>
              Import
            </Button>
            <Button variant="primary" size="sm" onClick={onExportExcel} icon={Download}>
              Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={onExportJSON} icon={Download}>
              JSON
            </Button>
            <Button variant="danger" size="sm" onClick={onClear} icon={Trash2}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary dark:via-electric-cyan to-transparent" />
    </header>
  );
};
