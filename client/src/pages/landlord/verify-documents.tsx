import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import DocumentList from '@/components/shared/DocumentList';
import { FileText, Search, CheckCircle, XCircle } from 'lucide-react';
import LandlordLayout from '@/components/layouts/LandlordLayout';

interface Tenant {
  id: number;
  userId: number;
  name: string;
  email: string;
}

const VerifyDocumentsPage = () => {
  const { user } = useAuthStore();
  const { setLoading, addToast } = useUIStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for tenants - in a real app, this would come from an API
  useEffect(() => {
    // Simulate loading tenants
    const mockTenants = [
      { id: 1, userId: 101, name: 'John Doe', email: 'john@example.com' },
      { id: 2, userId: 102, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, userId: 103, name: 'Bob Johnson', email: 'bob@example.com' },
    ];
    
    setTenants(mockTenants);
  }, []);

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LandlordLayout>
      <div>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Verify Tenant Documents</h1>
          <p className="text-gray-500 mt-1">
            Review and verify tenant documents
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column - Tenant list */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search tenants..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    {filteredTenants.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No tenants found</p>
                    ) : (
                      filteredTenants.map(tenant => (
                        <div 
                          key={tenant.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedTenant?.id === tenant.id 
                              ? 'bg-blue-100 border border-blue-300' 
                              : 'hover:bg-gray-100 border border-gray-200'
                          }`}
                          onClick={() => setSelectedTenant(tenant)}
                        >
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Document list */}
          <div className="lg:col-span-3">
            {selectedTenant ? (
              <DocumentList 
                tenantId={selectedTenant.id}
                isLandlord={true}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Tenant Selected</h3>
                  <p className="text-gray-500">
                    Select a tenant from the list to view and verify their documents
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </LandlordLayout>
  );
};

export default VerifyDocumentsPage; 