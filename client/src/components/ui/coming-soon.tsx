import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Zap, Star, Calendar, Bell, Wrench, Users } from "lucide-react";

type ComingSoonVariant = "badge" | "card" | "section" | "inline";
type ComingSoonSize = "sm" | "md" | "lg";
type ComingSoonType = "feature" | "analytics" | "integration" | "premium" | "beta";

interface ComingSoonProps {
  variant?: ComingSoonVariant;
  size?: ComingSoonSize;
  type?: ComingSoonType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
  estimatedDate?: string;
  notifyButton?: boolean;
  onNotifyClick?: () => void;
}

const getTypeConfig = (type: ComingSoonType) => {
  switch (type) {
    case "analytics":
      return {
        icon: <Sparkles className="w-4 h-4" />,
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        title: "Analytics Coming Soon",
        description: "Advanced analytics and insights will be available soon."
      };
    case "integration":
      return {
        icon: <Zap className="w-4 h-4" />,
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        title: "Integration Coming Soon",
        description: "This integration feature is currently in development."
      };
    case "premium":
      return {
        icon: <Star className="w-4 h-4" />,
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        title: "Premium Feature",
        description: "This premium feature will be available soon."
      };
    case "beta":
      return {
        icon: <Wrench className="w-4 h-4" />,
        badgeColor: "bg-green-100 text-green-800 border-green-200",
        title: "Beta Feature",
        description: "This feature is currently in beta testing."
      };
    default:
      return {
        icon: <Clock className="w-4 h-4" />,
        badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
        title: "Coming Soon",
        description: "This feature is currently under development."
      };
  }
};

const getSizeClasses = (size: ComingSoonSize, variant: ComingSoonVariant) => {
  if (variant === "badge") {
    switch (size) {
      case "sm": return "text-xs px-2 py-1";
      case "lg": return "text-sm px-3 py-1.5";
      default: return "text-xs px-2.5 py-1";
    }
  }

  if (variant === "card" || variant === "section") {
    switch (size) {
      case "sm": return "p-4";
      case "lg": return "p-8";
      default: return "p-6";
    }
  }

  return "";
};

export function ComingSoon({
  variant = "card",
  size = "md",
  type = "feature",
  title,
  description,
  icon,
  showIcon = true,
  className = "",
  children,
  estimatedDate,
  notifyButton = false,
  onNotifyClick,
}: ComingSoonProps) {
  const typeConfig = getTypeConfig(type);
  const finalTitle = title || typeConfig.title;
  const finalDescription = description || typeConfig.description;
  const finalIcon = showIcon ? (icon || typeConfig.icon) : null;

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge 
        variant="outline" 
        className={`${typeConfig.badgeColor} ${getSizeClasses(size, variant)} ${className}`}
        data-testid="coming-soon-badge"
      >
        {finalIcon && <span className="mr-1">{finalIcon}</span>}
        {finalTitle}
      </Badge>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`} data-testid="coming-soon-inline">
        {finalIcon}
        <span className="text-sm text-gray-600">{finalTitle}</span>
        {estimatedDate && (
          <span className="text-xs text-gray-500">({estimatedDate})</span>
        )}
      </div>
    );
  }

  // Section variant
  if (variant === "section") {
    return (
      <div className={`text-center ${getSizeClasses(size, variant)} ${className}`} data-testid="coming-soon-section">
        {finalIcon && <div className="flex justify-center mb-3">{finalIcon}</div>}
        <h3 className={`font-medium mb-2 ${size === "lg" ? "text-lg" : "text-base"}`}>
          {finalTitle}
        </h3>
        <p className={`text-gray-600 ${size === "lg" ? "text-base" : "text-sm"}`}>
          {finalDescription}
        </p>
        {estimatedDate && (
          <div className="flex items-center justify-center gap-1 mt-3 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Expected: {estimatedDate}</span>
          </div>
        )}
        {notifyButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={onNotifyClick}
            data-testid="button-notify-me"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me
          </Button>
        )}
        {children}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={`${className}`} data-testid="coming-soon-card">
      <CardContent className={getSizeClasses(size, variant)}>
        <div className="text-center">
          {finalIcon && <div className="flex justify-center mb-4 opacity-60">{finalIcon}</div>}
          <h3 className={`font-medium mb-2 ${size === "lg" ? "text-lg" : "text-base"}`}>
            {finalTitle}
          </h3>
          <p className={`text-gray-600 mb-4 ${size === "lg" ? "text-base" : "text-sm"}`}>
            {finalDescription}
          </p>
          
          {estimatedDate && (
            <div className="flex items-center justify-center gap-1 mb-4 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Expected: {estimatedDate}</span>
            </div>
          )}

          {notifyButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onNotifyClick}
              data-testid="button-notify-me"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          )}

          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Convenience components for specific use cases
export function ComingSoonBadge({ type = "feature", className = "", ...props }: Omit<ComingSoonProps, 'variant'>) {
  return <ComingSoon variant="badge" type={type} className={className} {...props} />;
}

export function ComingSoonSection({ type = "feature", className = "", ...props }: Omit<ComingSoonProps, 'variant'>) {
  return <ComingSoon variant="section" type={type} className={className} {...props} />;
}

export function ComingSoonCard({ type = "feature", className = "", ...props }: Omit<ComingSoonProps, 'variant'>) {
  return <ComingSoon variant="card" type={type} className={className} {...props} />;
}

export function ComingSoonInline({ type = "feature", className = "", ...props }: Omit<ComingSoonProps, 'variant'>) {
  return <ComingSoon variant="inline" type={type} className={className} {...props} />;
}

// Mock data components for showing placeholder content
export function ComingSoonWithMockData({ 
  mockDataComponent, 
  overlay = true,
  ...comingSoonProps 
}: ComingSoonProps & { 
  mockDataComponent: React.ReactNode;
  overlay?: boolean;
}) {
  return (
    <div className="relative">
      {mockDataComponent}
      {overlay && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
          <ComingSoon variant="section" {...comingSoonProps} />
        </div>
      )}
    </div>
  );
}