import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Eye, 
  Copy, 
  Check, 
  Settings,
  FileText,
  QrCode
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyQRCode, Property } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  existingQRCodes?: PropertyQRCode[];
}

type QRCodeSize = 256 | 384 | 512;
type QRCodeLevel = 'L' | 'M' | 'Q' | 'H';

interface QRFormData {
  title: string;
  description: string;
  qrCodeData: string;
  size: QRCodeSize;
  errorCorrectionLevel: QRCodeLevel;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, property, existingQRCodes = [] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [formData, setFormData] = useState<QRFormData>({
    title: `${property.address} - Property Info`,
    description: `QR code for property at ${property.address}`,
    qrCodeData: `${window.location.origin}/screening/${property.screeningPageSlug || `property-${property.id}`}`,
    size: 256,
    errorCorrectionLevel: 'M'
  });

  // Create QR code mutation
  const createQRCodeMutation = useMutation({
    mutationFn: async (data: Omit<QRFormData, 'size' | 'errorCorrectionLevel'>) => {
      const response = await apiRequest('POST', `/api/properties/${property.id}/qrcodes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id, 'qrcodes'] });
      toast({
        title: "Success",
        description: "QR code created successfully",
      });
      setActiveTab('existing');
    },
    onError: (error) => {
      console.error('Error creating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to create QR code. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete QR code mutation
  const deleteQRCodeMutation = useMutation({
    mutationFn: async (qrCodeId: number) => {
      const response = await apiRequest('DELETE', `/api/properties/qrcodes/${qrCodeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id, 'qrcodes'] });
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting QR code:', error);
      toast({
        title: "Error",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof QRFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast({
        title: "Copied",
        description: "URL copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = (qrCodeId: string, filename: string) => {
    const svg = document.getElementById(qrCodeId);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = formData.size;
        canvas.height = formData.size;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.qrCodeData) {
      toast({
        title: "Validation Error",
        description: "Please provide both title and URL for the QR code",
        variant: "destructive",
      });
      return;
    }

    createQRCodeMutation.mutate({
      title: formData.title,
      description: formData.description,
      qrCodeData: formData.qrCodeData
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-qr-code">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Manager - {property.address}
          </DialogTitle>
          <DialogDescription>
            Generate and manage QR codes for your property. Share easy access to property information.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" data-testid="tab-generate">Generate New</TabsTrigger>
            <TabsTrigger value="existing" data-testid="tab-existing">
              Existing Codes ({existingQRCodes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">QR Code Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a title for this QR code"
                    data-testid="input-qr-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    data-testid="input-qr-description"
                  />
                </div>

                <div>
                  <Label htmlFor="url">Target URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={formData.qrCodeData}
                      onChange={(e) => handleInputChange('qrCodeData', e.target.value)}
                      placeholder="Enter the URL the QR code should link to"
                      data-testid="input-qr-url"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyUrl(formData.qrCodeData)}
                      data-testid="button-copy-url"
                    >
                      {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Select 
                      value={formData.size.toString()} 
                      onValueChange={(value) => handleInputChange('size', parseInt(value) as QRCodeSize)}
                    >
                      <SelectTrigger data-testid="select-qr-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256">256x256 (Small)</SelectItem>
                        <SelectItem value="384">384x384 (Medium)</SelectItem>
                        <SelectItem value="512">512x512 (Large)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="errorLevel">Error Correction</Label>
                    <Select 
                      value={formData.errorCorrectionLevel} 
                      onValueChange={(value) => handleInputChange('errorCorrectionLevel', value as QRCodeLevel)}
                    >
                      <SelectTrigger data-testid="select-error-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (~7%)</SelectItem>
                        <SelectItem value="M">Medium (~15%)</SelectItem>
                        <SelectItem value="Q">Quartile (~25%)</SelectItem>
                        <SelectItem value="H">High (~30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <Label>QR Code Preview</Label>
                <Card>
                  <CardContent className="p-6 text-center">
                    {formData.qrCodeData ? (
                      <div className="space-y-4">
                        <QRCodeSVG
                          id="preview-qr-code"
                          value={formData.qrCodeData}
                          size={formData.size}
                          level={formData.errorCorrectionLevel}
                          includeMargin={true}
                          data-testid="preview-qr-code"
                        />
                        <div className="text-sm text-muted-foreground">
                          {formData.title}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadQR('preview-qr-code', 'qr-preview')}
                          data-testid="button-download-preview"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Preview
                        </Button>
                      </div>
                    ) : (
                      <div className="text-muted-foreground py-8">
                        Enter a URL to see QR code preview
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createQRCodeMutation.isPending}
                data-testid="button-create-qr"
              >
                {createQRCodeMutation.isPending ? 'Creating...' : 'Create QR Code'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="existing" className="space-y-4">
            {existingQRCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No QR codes created yet</p>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab('generate')}
                  data-testid="link-create-first-qr"
                >
                  Create your first QR code
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingQRCodes.map((qrCode) => (
                  <Card key={qrCode.id} className="relative">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <QRCodeSVG
                          id={`qr-code-${qrCode.id}`}
                          value={`${window.location.origin}/qr/${qrCode.id}`}
                          size={128}
                          level="M"
                          includeMargin={true}
                          data-testid={`qr-code-${qrCode.id}`}
                        />
                        
                        <div>
                          <h4 className="font-medium text-sm">{qrCode.title}</h4>
                          {qrCode.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {qrCode.description}
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            {qrCode.scanCount} scans
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyUrl(`${window.location.origin}/qr/${qrCode.id}`)}
                            data-testid={`button-copy-${qrCode.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(`qr-code-${qrCode.id}`, qrCode.title)}
                            data-testid={`button-download-${qrCode.id}`}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteQRCodeMutation.mutate(qrCode.id)}
                            disabled={deleteQRCodeMutation.isPending}
                            data-testid={`button-delete-${qrCode.id}`}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;