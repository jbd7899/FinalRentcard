import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import DocumentUpload from '@/components/shared/DocumentUpload';
import DocumentList from '@/components/shared/DocumentList';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import TenantLayout from '@/components/layouts/TenantLayout';

interface Document {
  id: number;
  tenantId: number;
  documentType: string;
  documentUrl: string;
  isVerified: boolean;
  verifiedBy?: number;
  verifiedAt?: string;
  uploadedAt: string;
}

const DocumentDashboard = () => {
  const { user } = useAuthStore();
  const { loadingStates, setLoading } = useUIStore();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = async () => {
    try {
      setLoading('fetchingDocuments', true);
      const id = user?.id;
      
      if (!id) {
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.DOCUMENTS.BY_TENANT(id));
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading('fetchingDocuments', false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id, refreshTrigger]);

  const handleDocumentUploaded = () => {
    // Trigger a refresh of the document list
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate document stats
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(doc => doc.isVerified).length;
  const pendingDocuments = totalDocuments - verifiedDocuments;

  return (
    <TenantLayout activeRoute={ROUTES.TENANT.DOCUMENTS}>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
              <p className="text-gray-500 mt-1">
                Upload and manage your important documents
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Document stats and upload */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Status</CardTitle>
                  <CardDescription>Overview of your document verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>Total Documents</span>
                      </div>
                      <span className="font-medium">
                        {loadingStates.fetchingDocuments ? '...' : totalDocuments}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Verified Documents</span>
                      </div>
                      <span className="font-medium">
                        {loadingStates.fetchingDocuments ? '...' : verifiedDocuments}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span>Pending Verification</span>
                      </div>
                      <span className="font-medium">
                        {loadingStates.fetchingDocuments ? '...' : pendingDocuments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <DocumentUpload onUploadSuccess={handleDocumentUploaded} />
            </div>
            
            {/* Right column - Document list */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Documents</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <DocumentList 
                    key={`all-${refreshTrigger}`} 
                    onDocumentDeleted={handleDocumentUploaded} 
                  />
                </TabsContent>
                
                <TabsContent value="verified" className="mt-0">
                  <DocumentList 
                    key={`verified-${refreshTrigger}`}
                    onDocumentDeleted={handleDocumentUploaded}
                    filterFn={(doc) => doc.isVerified}
                  />
                </TabsContent>
                
                <TabsContent value="pending" className="mt-0">
                  <DocumentList 
                    key={`pending-${refreshTrigger}`}
                    onDocumentDeleted={handleDocumentUploaded}
                    filterFn={(doc) => !doc.isVerified}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </TenantLayout>
  );
};

export default DocumentDashboard; 