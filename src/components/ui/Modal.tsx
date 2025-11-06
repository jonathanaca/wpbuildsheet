import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay with blur */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className={`relative inline-block align-bottom glass-strong rounded-2xl text-left overflow-hidden shadow-glass dark:shadow-glass-dark transform transition-all sm:my-8 sm:align-middle w-full border border-primary/20 dark:border-electric-cyan/20 animate-scale-in ${sizeClasses[size]}`}>
          {/* Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-electric-purple to-electric-pink" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-primary/10 dark:border-electric-cyan/10">
            <h3 className="text-xl font-black gradient-text">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-primary dark:hover:text-electric-cyan focus:outline-none transition-colors p-2 hover:bg-primary/10 dark:hover:bg-electric-cyan/10 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-thin">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 glass border-t border-primary/10 dark:border-electric-cyan/10 flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
