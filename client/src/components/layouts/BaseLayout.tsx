import React, { ReactNode } from 'react';

export interface BaseLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  mobileHeader?: ReactNode;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ 
  children, 
  sidebar,
  mobileHeader,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar rendered based on prop */}
      {sidebar}
      
      {/* Mobile Header - displayed only on mobile */}
      {mobileHeader}
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-10 lg:pl-12 mt-16 md:mt-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
      
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[9]"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default BaseLayout;