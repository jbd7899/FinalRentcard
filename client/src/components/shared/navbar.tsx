import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  User, 
  LogOut, 
  Home,
  FileText,
  CheckSquare,
  UserCheck,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { ComingSoonBadge } from "@/components/ui/coming-soon";
import { ROUTES } from "@/constants";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import RoleSwitcher from "@/components/shared/RoleSwitcher";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };
  const [location, setLocation] = useLocation();
  
  // Detect role context from current page
  const isOnLandingPage = location === '/tenant' || location === '/landlord';
  const currentLandingRole = location === '/tenant' ? 'tenant' : location === '/landlord' ? 'landlord' : null;
  const isOnTenantPages = location.startsWith('/tenant');
  const isOnLandlordPages = location.startsWith('/landlord');

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-blue-600">MyRentCard</span>
            </div>
          </div>
        </Link>

        {/* Role Context / Breadcrumbs */}
        {(isOnLandingPage || isOnTenantPages || isOnLandlordPages) && (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            {isOnLandingPage ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">
                  {currentLandingRole === 'tenant' ? 'For Tenants' : 'For Individual Landlords'}
                </span>
                <Badge variant="outline" className={`text-xs ${
                  currentLandingRole === 'tenant' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-green-600 border-green-600'
                }`}>
                  Landing Page
                </Badge>
              </div>
            ) : isOnTenantPages && !location.includes('/dashboard') ? (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Tenant Tools
                </span>
                {location !== '/tenant/dashboard' && (
                  <>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700">
                      {location.includes('/rentcard') ? 'RentCard' :
                       location.includes('/documents') ? 'Documents' :
                       location.includes('/references') ? 'References' :
                       location.includes('/applications') ? 'Applications' :
                       'Dashboard'}
                    </span>
                  </>
                )}
              </div>
            ) : isOnLandlordPages && !location.includes('/dashboard') ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Landlord Tools
                </span>
                {location !== '/landlord/dashboard' && (
                  <>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-700">
                      {location.includes('/applications') ? 'Applications' :
                       location.includes('/screening') ? 'Screening' :
                       location.includes('/properties') ? 'Properties' :
                       location.includes('/verify-documents') ? 'Verify Documents' :
                       'Dashboard'}
                    </span>
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* About Link - visible to all users */}
          <Link href="/about" className="text-muted-foreground hover:text-foreground font-medium" data-testid="navbar-about-link">
            About
          </Link>

          {/* Role Switcher for Landing Pages */}
          {isOnLandingPage && !user && (
            <div className="block">
              <RoleSwitcher 
                currentRole={currentLandingRole!} 
                size="sm" 
                variant="compact"
                showStats={false}
                data-testid="navbar-role-switcher"
              />
            </div>
          )}

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center gap-6 mr-4">
              {user.userType === 'landlord' ? (
                <>
                  <Link href="/landlord/dashboard">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      Network Hub
                    </span>
                  </Link>
                  <Link href="/landlord/applications">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Verified Applicants
                    </span>
                  </Link>
                  <Link href="/landlord/verify-documents">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <CheckSquare className="w-4 h-4" />
                      Verify Documents
                      <ComingSoonBadge type="feature" size="sm" title="Beta" />
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/tenant/dashboard">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      Network Hub
                    </span>
                  </Link>
                  <Link href="/tenant/rentcard">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      My Network Profile
                    </span>
                  </Link>
                  <Link href="/tenant/documents">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Documents
                    </span>
                  </Link>
                  <Link href="/tenant/references">
                    <span className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <UserCheck className="w-4 h-4" />
                      References
                      <ComingSoonBadge type="feature" size="sm" title="Beta" />
                    </span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Notification Bell for Tenants */}
          {user && user.userType === 'tenant' && (
            <NotificationCenter userId={parseInt(user.id)} />
          )}

          {/* User Menu or Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link href={user.userType === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard"}>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="gap-2 text-red-600 cursor-pointer"
                  onClick={() => {
                    handleLogout();
                    setLocation("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="px-6 cursor-pointer flex items-center gap-2"
                  variant="default"
                  type="button"
                  data-testid="button-login-dropdown"
                >
                  Login
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-blue-600"
                  onClick={() => {
                    localStorage.setItem("selectedRole", "tenant");
                    window.location.href = "/api/login";
                  }}
                  data-testid="button-login-tenant"
                >
                  <User className="h-4 w-4" />
                  <span>🏠 Login as Tenant</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-green-600"
                  onClick={() => {
                    localStorage.setItem("selectedRole", "landlord");
                    window.location.href = "/api/login";
                  }}
                  data-testid="button-login-landlord"
                >
                  <Building2 className="h-4 w-4" />
                  <span>🏢 Login as Landlord</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}