import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoreSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  persistKey?: string; // For localStorage persistence
  testId?: string;
}

export function MoreSection({ 
  title, 
  children, 
  defaultExpanded = false,
  className,
  persistKey,
  testId 
}: MoreSectionProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`more-section-${persistKey}`);
      return saved ? JSON.parse(saved) : defaultExpanded;
    }
    return defaultExpanded;
  });

  const toggleExpanded = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(`more-section-${persistKey}`, JSON.stringify(newValue));
    }
  };

  return (
    <div className={cn("border border-border rounded-lg", className)}>
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        data-testid={testId ? `toggle-more-${testId}` : undefined}
      >
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}