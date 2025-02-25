import React, { useState } from 'react';
import LandlordSidebar from '../shared/LandlordSidebar';
import BaseLayout from './BaseLayout';

interface LandlordLayoutProps {
  children: React.ReactNode;
}

const LandlordLayout: React.FC<LandlordLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BaseLayout
      sidebar={
        <LandlordSidebar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
      }
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {children}
    </BaseLayout>
  );
};

export default LandlordLayout; 