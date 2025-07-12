// components/common/HeaderDropdown.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, Settings, Trash2, Sun, Moon } from 'lucide-react';

interface HeaderDropdownProps {
  onClearStorage: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export function HeaderDropdown({ onClearStorage, onToggleTheme, isDarkMode }: HeaderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClearStorage = () => {
    onClearStorage();
    setIsOpen(false);
  };

  const handleToggleTheme = () => {
    onToggleTheme();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Settings menu"
      >
        <Settings className="h-4 w-4" />
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-1">
              <button
                onClick={handleToggleTheme}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleClearStorage}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Storage</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 