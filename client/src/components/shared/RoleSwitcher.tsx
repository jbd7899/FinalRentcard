import { useState } from 'react';
import { useLocation } from 'wouter';
import { Building2, User, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { USER_ROLES, SOCIAL_PROOF_STATS } from '@/constants';

interface RoleSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  currentRole: 'tenant' | 'landlord';
  preserveParams?: boolean;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'toggle' | 'buttons' | 'compact';
}

export default function RoleSwitcher({ 
  currentRole, 
  preserveParams = true, 
  showStats = true,
  size = 'md',
  variant = 'toggle',
  className = '',
  ...props
}: RoleSwitcherProps) {
  const [, setLocation] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  // Explicit color mappings to prevent Tailwind purging
  const colorClasses = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      text: 'text-green-600',
      bg: 'bg-green-50', 
      hover: 'hover:bg-green-50',
      border: 'border-green-200'
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      hover: 'hover:bg-purple-50', 
      border: 'border-purple-200'
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      hover: 'hover:bg-orange-50',
      border: 'border-orange-200'
    }
  };

  const handleRoleSwitch = (newRole: 'tenant' | 'landlord') => {
    if (newRole === currentRole) return;
    
    setIsAnimating(true);
    
    // Preserve URL parameters if needed
    const currentSearch = preserveParams ? window.location.search : '';
    const targetPath = newRole === 'tenant' ? '/tenant' : '/landlord';
    
    // Add smooth transition delay
    setTimeout(() => {
      setLocation(`${targetPath}${currentSearch}`);
      setIsAnimating(false);
    }, 150);
  };

  const roles = [
    {
      id: 'tenant' as const,
      label: 'For Tenants',
      shortLabel: 'Tenants',
      icon: User,
      description: 'Find apartments faster',
      stat: SOCIAL_PROOF_STATS.VERIFIED_RENTERS,
      statLabel: 'verified renters',
      color: 'blue',
      bgColor: currentRole === 'tenant' ? 'bg-blue-600' : 'bg-gray-100',
      textColor: currentRole === 'tenant' ? 'text-white' : 'text-gray-600',
      hoverColor: 'hover:bg-blue-50'
    },
    {
      id: 'landlord' as const,
      label: 'For Landlords',
      shortLabel: 'Landlords',
      icon: Building2,
      description: 'Screen tenants faster',
      stat: SOCIAL_PROOF_STATS.VERIFIED_LANDLORDS,
      statLabel: 'trusted landlords',
      color: 'green',
      bgColor: currentRole === 'landlord' ? 'bg-green-600' : 'bg-gray-100',
      textColor: currentRole === 'landlord' ? 'text-white' : 'text-gray-600',
      hoverColor: 'hover:bg-green-50'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2" data-testid="role-switcher-compact">
        <span className="text-sm text-gray-500">I am a:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {roles.map((role) => (
            <Button
              key={role.id}
              variant="ghost"
              size="sm"
              onClick={() => handleRoleSwitch(role.id)}
              className={`relative px-3 py-1 rounded-md transition-all duration-200 ${
                currentRole === role.id
                  ? role.bgColor + ' ' + role.textColor + ' shadow-sm'
                  : 'text-gray-600 hover:bg-white'
              }`}
              disabled={isAnimating}
              data-testid={`role-switch-${role.id}`}
            >
              <role.icon className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium">{role.shortLabel}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className="flex flex-col sm:flex-row gap-3" data-testid="role-switcher-buttons">
        {roles.map((role) => (
          <Button
            key={role.id}
            variant={currentRole === role.id ? 'default' : 'outline'}
            onClick={() => handleRoleSwitch(role.id)}
            className={`group relative flex-1 p-4 h-auto transition-all duration-200 ${
              currentRole === role.id 
                ? role.bgColor + ' ' + role.textColor + ' shadow-lg' 
                : `border-2 ${role.hoverColor} hover:shadow-md`
            }`}
            disabled={isAnimating}
            data-testid={`role-switch-${role.id}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  currentRole === role.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <role.icon className={`w-5 h-5 ${
                    currentRole === role.id ? 'text-white' : colorClasses[role.color as keyof typeof colorClasses].text
                  }`} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{role.label}</div>
                  {showStats && (
                    <div className="text-sm opacity-80">{role.description}</div>
                  )}
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 transition-transform ${
                currentRole !== role.id ? 'group-hover:translate-x-1' : ''
              }`} />
            </div>
            {showStats && currentRole !== role.id && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 text-xs"
              >
                {role.stat}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  // Default toggle variant
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const buttonSizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <div className="flex flex-col items-center gap-3" data-testid="role-switcher-toggle">
      {showStats && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{SOCIAL_PROOF_STATS.VERIFIED_RENTERS} renters</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4 text-green-600" />
            <span>{SOCIAL_PROOF_STATS.VERIFIED_LANDLORDS} landlords</span>
          </div>
        </div>
      )}
      
      <div 
        className={`bg-gray-100 rounded-xl ${sizeClasses[size]} relative transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-80' : ''
        }`}
      >
        <div className="flex relative">
          {/* Background slider */}
          <div 
            className={`absolute top-1.5 ${sizeClasses[size]} bg-white rounded-lg shadow-md transition-all duration-300 ease-out ${
              size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10'
            }`}
            style={{
              width: '50%',
              transform: `translateX(${currentRole === 'landlord' ? '100%' : '0%'})`
            }}
          />
          
          {roles.map((role) => (
            <Button
              key={role.id}
              variant="ghost"
              onClick={() => handleRoleSwitch(role.id)}
              className={`relative z-10 ${buttonSizeClasses[size]} rounded-lg transition-all duration-200 ${
                currentRole === role.id 
                  ? 'text-gray-900 font-semibold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              disabled={isAnimating}
              data-testid={`role-switch-${role.id}`}
            >
              <role.icon className="w-4 h-4 mr-2" />
              <span>{role.label}</span>
              {currentRole === role.id && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {showStats && (
        <div className="text-center">
          <div className="text-sm text-gray-600">
            Join {currentRole === 'tenant' ? SOCIAL_PROOF_STATS.VERIFIED_RENTERS : SOCIAL_PROOF_STATS.VERIFIED_LANDLORDS} {currentRole === 'tenant' ? 'renters' : 'landlords'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentRole === 'tenant' 
              ? `Get approved in ${SOCIAL_PROOF_STATS.APPLICATION_PROCESSING_IMPROVEMENT}` 
              : `Save ${SOCIAL_PROOF_STATS.LANDLORD_TIME_SAVED_WEEKLY} per week`
            }
          </div>
        </div>
      )}
    </div>
  );
}

// Cross-linking component for discovery
interface RoleCrossLinkProps {
  currentRole: 'tenant' | 'landlord';
  className?: string;
}

export function RoleCrossLink({ currentRole, className = "" }: RoleCrossLinkProps) {
  const [, setLocation] = useLocation();
  
  const crossLinkData = {
    tenant: {
      message: "Are you a landlord looking to screen tenants?",
      cta: "View landlord tools",
      targetPath: "/landlord",
      icon: Building2,
      stat: SOCIAL_PROOF_STATS.VERIFIED_LANDLORDS,
      benefit: "Save 40+ hours per week"
    },
    landlord: {
      message: "Are you a renter looking for an apartment?", 
      cta: "View tenant tools",
      targetPath: "/tenant",
      icon: User,
      stat: SOCIAL_PROOF_STATS.VERIFIED_RENTERS,
      benefit: "Get approved faster"
    }
  };

  const crossLink = crossLinkData[currentRole];

  return (
    <div 
      className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-blue-500 ${className}`}
      data-testid="role-cross-link"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <crossLink.icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">{crossLink.message}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {crossLink.stat} users
              </Badge>
              <span className="text-xs text-blue-600">{crossLink.benefit}</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation(crossLink.targetPath)}
          className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
          data-testid="cross-link-button"
        >
          {crossLink.cta}
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}