import React from 'react';
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Building2,
  Users, 
  CheckSquare,
  Plus,
  LogOut,
  Loader2,
  User,
  Home,
  Menu,
  X,
  Globe,
  Send,
  FileText, 
  Star, 
  UserCheck,
  Settings,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES } from '@/constants';

export type UserRole = 'tenant' | 'landlord';

interface SidebarProps {
  role: UserRole;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  activeRoute?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  role,
  mobileMenuOpen, 
  setMobileMenuOpen,
  activeRoute,
}) => {
  const { user } = useAuth();
  const { logout } = useAuthStore();
  const { setLoading, loadingStates, openModal, addToast } = useUIStore();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      setLoading('loggingOut', true);
      await logout();

      if (role === 'tenant') {
        addToast?.({
          title: 'Success',
          description: 'You have been logged out successfully.',
          type: 'success'
        });
        setLocation(ROUTES.AUTH);
      } else {
        setLocation(ROUTES.HOME);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      if (role === 'tenant') {
        addToast?.({
          title: 'Error',
          description: 'Failed to log out. Please try again.',
          type: 'destructive'
        });
      }
    } finally {
      setLoading('loggingOut', false);
    }
  };

  const isActive = (path: string) => {
    if (role === 'tenant' && activeRoute) {
      return activeRoute === path;
    }
    return location === path;
  };

  // Define navigation items based on role
  const navigationItems = role === 'landlord' 
    ? [
        { 
          icon: <Home className="w-5 h-5" />, 
          label: "Dashboard", 
          route: ROUTES.LANDLORD.DASHBOARD, 
          active: isActive(ROUTES.LANDLORD.DASHBOARD) 
        },
        { 
          icon: <Globe className="w-5 h-5" />, 
          label: "Screening Pages", 
          route: ROUTES.LANDLORD.SCREENING, 
          active: isActive(ROUTES.LANDLORD.SCREENING)
        },
        { 
          icon: <Users className="w-5 h-5" />, 
          label: "Interest Tracking", 
          route: ROUTES.LANDLORD.APPLICATIONS, 
          active: isActive(ROUTES.LANDLORD.APPLICATIONS) 
        },
        { 
          icon: <MessageSquare className="w-5 h-5" />, 
          label: "Contact Management", 
          route: ROUTES.LANDLORD.CONTACT_MANAGEMENT, 
          active: isActive(ROUTES.LANDLORD.CONTACT_MANAGEMENT)
        },
        { 
          icon: <Send className="w-5 h-5" />, 
          label: "Request RentCard", 
          action: () => openModal('requestRentCard'),
          active: false
        }
      ]
    : [
        { 
          icon: <Home className="w-5 h-5" />, 
          label: "Dashboard", 
          route: ROUTES.TENANT.DASHBOARD, 
          active: isActive(ROUTES.TENANT.DASHBOARD) 
        },
        { 
          icon: <Star className="w-5 h-5" />, 
          label: "My RentCard", 
          route: ROUTES.TENANT.RENTCARD, 
          active: isActive(ROUTES.TENANT.RENTCARD) 
        },
        { 
          icon: <FileText className="w-5 h-5" />, 
          label: "Documents", 
          route: ROUTES.TENANT.DOCUMENTS, 
          active: isActive(ROUTES.TENANT.DOCUMENTS) 
        },
        { 
          icon: <UserCheck className="w-5 h-5" />, 
          label: "References", 
          route: ROUTES.TENANT.REFERENCES, 
          active: isActive(ROUTES.TENANT.REFERENCES)
        },
        { 
          icon: <Users className="w-5 h-5" />, 
          label: "Contacts", 
          route: ROUTES.TENANT.CONTACTS, 
          active: isActive(ROUTES.TENANT.CONTACTS) 
        },
        { 
          icon: <BookOpen className="w-5 h-5" />, 
          label: "Message Templates", 
          route: ROUTES.TENANT.MESSAGE_TEMPLATES, 
          active: isActive(ROUTES.TENANT.MESSAGE_TEMPLATES) 
        },
        { 
          icon: <Building2 className="w-5 h-5" />, 
          label: "Interest Tracking", 
          route: ROUTES.TENANT.APPLICATIONS, 
          active: isActive(ROUTES.TENANT.APPLICATIONS) 
        },
        { 
          icon: <Settings className="w-5 h-5" />, 
          label: "Contact Preferences", 
          route: ROUTES.TENANT.CONTACT_PREFERENCES, 
          active: isActive(ROUTES.TENANT.CONTACT_PREFERENCES)
        }
      ];

  // Choose the appropriate logo based on role
  const LogoIcon = role === 'landlord' ? Building : Building2;

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-4 md:p-6 border-b">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <LogoIcon className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
              <span className="text-lg md:text-xl font-semibold text-blue-600">MyRentCard</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1 md:space-y-2">
            {navigationItems.map((item) => (
              <li key={item.label || item.route}>
                {item.route ? (
                  <Link href={item.route}>
                    <a className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-md transition-colors ${
                      item.active 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}>
                      {item.icon}
                      <span className="text-sm md:text-base">{item.label}</span>
                      {item.active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      )}
                    </a>
                  </Link>
                ) : (
                  <div 
                    onClick={item.action}
                    className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-md transition-colors cursor-pointer
                      text-gray-600 hover:bg-gray-100
                    `}
                  >
                    {item.icon}
                    <span className="text-sm md:text-base">{item.label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm md:text-base truncate">{user?.email}</p>
              <p className="text-xs md:text-sm text-gray-500">{role === 'landlord' ? 'Landlord' : 'Tenant'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loadingStates.loggingOut}
            className="w-full flex items-center gap-2 justify-center text-xs md:text-sm h-8 md:h-9"
          >
            {loadingStates.loggingOut ? (
              <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header for Landlord */}
      {role === 'landlord' && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <LogoIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                <span className="text-base sm:text-lg font-semibold text-blue-600">MyRentCard</span>
              </div>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </Button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="p-4 bg-white border-b">
              <ul className="space-y-1 sm:space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.label || item.route}>
                    {item.route ? (
                      <Link href={item.route} className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-md transition-colors ${
                        item.active 
                          ? "bg-blue-50 text-blue-600" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}>
                        {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    ) : (
                      <div 
                        onClick={item.action}
                        className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer
                          text-gray-600 hover:bg-gray-100
                        `}
                      >
                        {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                        <span className="text-sm">{item.label}</span>
                      </div>
                    )}
                  </li>
                ))}
                <li className="pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={loadingStates.loggingOut}
                    className="w-full flex items-center gap-2 justify-center text-xs sm:text-sm h-8 sm:h-9 mt-2"
                  >
                    {loadingStates.loggingOut ? (
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    Logout
                  </Button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {/* Mobile Menu for Tenant */}
      {role === 'tenant' && mobileMenuOpen && (
        <nav className="md:hidden p-4 bg-white border-b">
          <ul className="space-y-1 sm:space-y-2">
            {navigationItems.map((item) => (
              <li key={item.label || item.route}>
                <Link href={item.route}>
                  <a className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    item.active 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t mt-2">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loadingStates.loggingOut}
                className="w-full flex items-center gap-2 justify-center"
              >
                {loadingStates.loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Logout
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Sidebar;