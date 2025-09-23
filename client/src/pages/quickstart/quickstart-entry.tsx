import { useState } from 'react';
import { useLocation } from 'wouter';
import { Building2, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/shared/navbar';

export default function QuickStartEntry() {
  const [, setLocation] = useLocation();

  const handleRoleSelect = (role: 'tenant' | 'landlord') => {
    localStorage.setItem('selectedRole', role);
    setLocation(`/quickstart/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 -left-32 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Quick Start
            </span>
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Choose what you'd like to do first. This takes about 2 minutes.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Card 
            className="group cursor-pointer border-2 border-transparent hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all"
            onClick={() => handleRoleSelect('tenant')}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    I'm looking for a place to rent
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Create your RentCard once and share it with any private landlord. No more filling out forms for every pre-qualification.
                  </p>
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    Create your RentCard
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer border-2 border-transparent hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 transition-all"
            onClick={() => handleRoleSelect('landlord')}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    I have property to rent out
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Create property profiles and QR codes. Collect organized tenant interest without chasing paperwork.
                  </p>
                  <div className="flex items-center text-sm font-medium text-emerald-600">
                    Add your property
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Don't worry - you can always create profiles for both sides later.
          </p>
        </div>
      </main>
    </div>
  );
}