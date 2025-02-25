import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Upload, X, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/constants';

interface DocumentUploadProps {
  onUploadSuccess?: (document: any) => void;
}

const DOCUMENT_TYPES = [
  { value: 'id', label: 'ID Document' },
  { value: 'payslip', label: 'Payslip' },
  { value: 'reference', label: 'Reference Letter' },
  { value: 'employment', label: 'Employment Verification' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'tax_return', label: 'Tax Return' },
  { value: 'other', label: 'Other Document' },
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setLoading, addToast } = useUIStore();
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !documentType) {
      addToast({
        title: 'Missing Information',
        description: 'Please select a file and document type',
        type: 'error',
      });
      return;
    }

    try {
      setLoading('uploadingDocument', true);
      
      // For the mock API, we don't actually need to send the file
      // In a real implementation, this would upload the file to a storage service
      
      // Create a mock response for development
      if (import.meta.env.DEV) {
        // The mock API will handle this request
        const response = await fetch(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
          method: 'POST',
          body: JSON.stringify({
            documentType,
            tenantId: user?.id || 1,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload document');
        }
        
        const data = await response.json();
        
        addToast({
          title: 'Document Uploaded',
          description: 'Your document has been successfully uploaded',
          type: 'success',
        });
        
        setFile(null);
        setDocumentType('');
        
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }
      } else {
        // In production, we would use FormData
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', documentType);
        formData.append('tenantId', user?.id?.toString() || '');
        
        const response = await fetch(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload document');
        }
        
        const data = await response.json();
        
        addToast({
          title: 'Document Uploaded',
          description: 'Your document has been successfully uploaded',
          type: 'success',
        });
        
        setFile(null);
        setDocumentType('');
        
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      addToast({
        title: 'Upload Failed',
        description: 'There was an error uploading your document',
        type: 'error',
      });
    } finally {
      setLoading('uploadingDocument', false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary",
              file ? "bg-green-50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-green-600">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Check className="h-6 w-6 text-green-600 mt-2" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">
                  Drag and drop your file here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpload} 
          disabled={!file || !documentType}
          className="w-full sm:w-auto"
        >
          Upload Document
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload; 