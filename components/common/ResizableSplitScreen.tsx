// components/common/ResizableSplitScreen.tsx
'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResizableSplitScreenProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  isVisible: boolean;
  onClose: () => void;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export function ResizableSplitScreen({
  leftPanel,
  rightPanel,
  isVisible,
  onClose,
  minWidth = 300,
  maxWidth = 800,
  defaultWidth = 400,
}: ResizableSplitScreenProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      

      
      // Constrain the width within bounds
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
  
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Restore normal cursor and selection
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, minWidth, maxWidth]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) {
    return <div className="flex-1 flex flex-col min-h-full">{leftPanel}</div>;
  }

  if (isMinimized) {
    return (
      <div className="flex flex-1 min-h-full">
        <div className="flex-1 flex flex-col min-h-full">{leftPanel}</div>
        <div className="w-8 bg-card border-l border-border flex flex-col items-center justify-center">
          <button
            onClick={toggleMinimize}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Expand panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-1 min-h-full ${isResizing ? 'select-none' : ''}`}>
      <div className="flex-1 flex flex-col min-h-full">{leftPanel}</div>
      
      {/* Resize handle - made wider and more visible */}
      <div
        ref={resizeRef}
        className={`w-4 bg-border hover:bg-primary/50 cursor-col-resize transition-colors relative z-10 ${
          isResizing ? 'bg-primary' : ''
        }`}
        onMouseDown={handleResizeStart}
        style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
      >
        <div className="absolute inset-y-0 -left-2 -right-2" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-muted-foreground/50 rounded-full" />
      </div>

      {/* Right panel */}
      <div
        className="bg-card shadow-sm border-l border-border flex flex-col"
        style={{ width: `${width}px` }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card pr-20">
          <h3 className="text-sm font-medium text-foreground">Chart View</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMinimize}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
              title="Minimize panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
              title="Close panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L6 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {rightPanel}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 