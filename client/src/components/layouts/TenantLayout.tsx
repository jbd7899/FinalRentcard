import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Menu,
  X
} from 'lucide-react';
import OneClickShareButton from '../shared/OneClickShareButton';
import { ROUTES } from "@/constants";
import { Link } from "wouter";
import TenantSidebar from '../shared/TenantSidebar';
import BaseLayout from './BaseLayout';

interface TenantLayoutProps {
  children: React.ReactNode;
  activeRoute?: string;
}

const TenantLayout: React.FC<TenantLayoutProps> = ({ children, activeRoute = ROUTES.TENANT.DASHBOARD }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mobile header component for tenant view
  const mobileHeader = (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10">
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span className="text-base sm:text-lg font-semibold text-blue-600">MyRentCard</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <OneClickShareButton 
            variant="outline" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            showText={false}
            mode="simple"
            data-testid="button-share-mobile-header"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <BaseLayout
      sidebar={<TenantSidebar activeRoute={activeRoute} mobileMenuOpen={mobileMenuOpen} />}
      mobileHeader={mobileHeader}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {children}
    </BaseLayout>
  );
};

export default TenantLayout; 