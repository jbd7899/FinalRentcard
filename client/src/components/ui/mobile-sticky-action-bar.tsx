import { cn } from "@/lib/utils";

interface MobileStickyActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileStickyActionBar({ children, className }: MobileStickyActionBarProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50",
      className
    )}>
      {children}
    </div>
  );
}