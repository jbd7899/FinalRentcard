import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Star, 
  Inbox, 
  LogOut,
  Loader2,
  Home,
  UserCheck,
  User,
  Building2,
  Users
} from 'lucide-react';
import OneClickShareButton from './OneClickShareButton';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES } from "@/constants";
import { Link, useLocation } from "wouter";

interface TenantSidebarProps {
  activeRoute: string;
  mobileMenuOpen?: boolean;
}

const TenantSidebar: React.FC<TenantSidebarProps> = ({ 
  activeRoute,
  mobileMenuOpen = false
}) => {
  const { logout, user } = useAuthStore();
  const { setLoading, loadingStates, addToast } = useUIStore();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      setLoading('logout', true);
      await logout();
      addToast({
        title: 'Success',
        description: 'You have been logged out successfully.',
        type: 'success'
      });
      setLocation(ROUTES.AUTH);
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        type: 'destructive'
      });
    } finally {
      setLoading('logout', false);
    }
  };

  const navigationItems = [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", route: ROUTES.TENANT.DASHBOARD, active: activeRoute === ROUTES.TENANT.DASHBOARD },
    { icon: <Star className="w-5 h-5" />, label: "My RentCard", route: ROUTES.TENANT.RENTCARD, active: activeRoute === ROUTES.TENANT.RENTCARD },
    { icon: <FileText className="w-5 h-5" />, label: "Documents", route: ROUTES.TENANT.DOCUMENTS, active: activeRoute === ROUTES.TENANT.DOCUMENTS },
    { icon: <UserCheck className="w-5 h-5" />, label: "References", route: ROUTES.TENANT.REFERENCES, active: activeRoute === ROUTES.TENANT.REFERENCES },
    { icon: <Users className="w-5 h-5" />, label: "Referrals", route: ROUTES.TENANT.REFERRALS, active: activeRoute === ROUTES.TENANT.REFERRALS },
    { icon: <Inbox className="w-5 h-5" />, label: "Individual Landlord Connections", route: ROUTES.TENANT.INTERESTS, active: activeRoute === ROUTES.TENANT.INTERESTS }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-4 md:p-6 border-b">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer mb-4">
              <Building2 className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
              <span className="text-lg md:text-xl font-semibold text-blue-600">MyRentCard</span>
            </div>
          </Link>
          <OneClickShareButton 
            variant="default" 
            size="default"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            showText={true}
            mode="simple"
            data-testid="button-share-sidebar"
          />
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1 md:space-y-2">
            {navigationItems.map((item) => (
              <li key={item.route}>
                <Link href={item.route} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-md transition-colors ${
                    item.active 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    {item.icon}
                    <span>{item.label}</span>
                    {item.active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    )}
                </Link>
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
              <p className="text-xs md:text-sm text-gray-500">Tenant</p>
            </div>
          </div>
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
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden p-4 bg-white border-b">
          <div className="mb-4">
            <OneClickShareButton 
              variant="default" 
              size="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              showText={true}
              mode="simple"
              data-testid="button-share-mobile-menu"
            />
          </div>
          <ul className="space-y-1 sm:space-y-2">
            {navigationItems.map((item) => (
              <li key={item.route}>
                <Link href={item.route} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    item.active 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}>
                    {item.icon}
                    <span>{item.label}</span>
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

export default TenantSidebar; 