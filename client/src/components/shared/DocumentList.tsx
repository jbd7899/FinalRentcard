import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Eye, Trash2, CheckCircle, XCircle, FileText, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import { API_ENDPOINTS } from '@/constants';

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

interface DocumentListProps {
  tenantId?: number;
  isLandlord?: boolean;
  onDocumentDeleted?: () => void;
  filterFn?: (document: Document) => boolean;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'id': 'ID Document',
  'payslip': 'Payslip',
  'reference': 'Reference Letter',
  'employment': 'Employment Verification',
  'bank_statement': 'Bank Statement',
  'tax_return': 'Tax Return',
  'other': 'Other Document',
};

const DocumentList: React.FC<DocumentListProps> = ({ tenantId, isLandlord = false, onDocumentDeleted, filterFn }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { setLoading, addToast } = useUIStore();
  const { user } = useAuthStore();

  const fetchDocuments = async () => {
    try {
      setLoading('fetchingDocuments', true);
      const id = tenantId || user?.id;
      
      if (!id) {
        addToast({
          title: 'Error',
          description: 'Tenant ID not found',
          type: 'error',
        });
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.DOCUMENTS.BY_TENANT(id));
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      
      // Apply filter if provided
      const filteredData = filterFn ? data.filter(filterFn) : data;
      setDocuments(filteredData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load documents',
        type: 'error',
      });
    } finally {
      setLoading('fetchingDocuments', false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [tenantId, user?.id]);

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      setLoading('deletingDocument', true);
      
      const response = await fetch(API_ENDPOINTS.DOCUMENTS.DELETE(id), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      addToast({
        title: 'Document Deleted',
        description: 'The document has been successfully deleted',
        type: 'success',
      });
      
      // Refresh the document list
      fetchDocuments();
      
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete document',
        type: 'error',
      });
    } finally {
      setLoading('deletingDocument', false);
    }
  };

  const handleVerifyDocument = async (id: number) => {
    try {
      setLoading('verifyingDocument', true);
      
      const response = await fetch(API_ENDPOINTS.DOCUMENTS.VERIFY(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verifiedBy: user?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify document');
      }
      
      addToast({
        title: 'Document Verified',
        description: 'The document has been successfully verified',
        type: 'success',
      });
      
      // Refresh the document list
      fetchDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
      addToast({
        title: 'Error',
        description: 'Failed to verify document',
        type: 'error',
      });
    } finally {
      setLoading('verifyingDocument', false);
    }
  };

  const getDocumentIcon = (documentType: string, documentUrl: string) => {
    if (documentUrl.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (documentUrl.endsWith('.jpg') || documentUrl.endsWith('.jpeg') || documentUrl.endsWith('.png')) {
      return <FileImage className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  const isImage = (url: string) => {
    return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png');
  };

  const isPdf = (url: string) => {
    return url.endsWith('.pdf');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm mt-1">
              {isLandlord 
                ? 'This tenant has not uploaded any documents yet.' 
                : 'Upload your documents to complete your profile.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getDocumentIcon(doc.documentType, doc.documentUrl)}
                    {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                  </TableCell>
                  <TableCell>
                    {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {doc.isVerified ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={previewOpen && selectedDocument?.id === doc.id} onOpenChange={(open) => {
                        setPreviewOpen(open);
                        if (!open) setSelectedDocument(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedDocument && DOCUMENT_TYPE_LABELS[selectedDocument.documentType]}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedDocument && (
                            <div className="mt-4">
                              {isImage(selectedDocument.documentUrl) ? (
                                <img 
                                  src={selectedDocument.documentUrl} 
                                  alt="Document Preview" 
                                  className="max-h-[70vh] mx-auto"
                                />
                              ) : isPdf(selectedDocument.documentUrl) ? (
                                <iframe 
                                  src={`${selectedDocument.documentUrl}#toolbar=0`} 
                                  className="w-full h-[70vh]"
                                  title="PDF Document"
                                />
                              ) : (
                                <div className="text-center py-8">
                                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                  <p>Preview not available</p>
                                  <Button 
                                    className="mt-4"
                                    onClick={() => window.open(selectedDocument.documentUrl, '_blank')}
                                  >
                                    Download Document
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {isLandlord && !doc.isVerified && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                          onClick={() => handleVerifyDocument(doc.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {!isLandlord && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList; 