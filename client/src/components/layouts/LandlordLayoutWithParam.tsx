import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Building, Menu, X } from 'lucide-react';
import { Link } from "wouter";
import Sidebar from '../shared/Sidebar';
import BaseLayout from './BaseLayout';

interface LandlordLayoutProps {
  children: React.ReactNode;
}

const LandlordLayoutWithParam: React.FC<LandlordLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile header for landlord view
  const mobileHeader = (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10">
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Building className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span className="text-base sm:text-lg font-semibold text-blue-600">MyRentCard</span>
          </div>
        </Link>
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
  );

  return (
    <BaseLayout
      sidebar={
        <Sidebar 
          role="landlord" 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
      }
      mobileHeader={mobileHeader}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {children}
    </BaseLayout>
  );
};

export default LandlordLayoutWithParam;