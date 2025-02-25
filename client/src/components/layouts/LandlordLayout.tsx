import React, { useState } from 'react';
import LandlordSidebar from '../shared/LandlordSidebar';

interface LandlordLayoutProps {
  children: React.ReactNode;
}

const LandlordLayout: React.FC<LandlordLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <LandlordSidebar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-10 lg:pl-12 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LandlordLayout; 