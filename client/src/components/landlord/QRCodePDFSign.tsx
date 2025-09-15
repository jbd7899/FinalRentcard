import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { Property, PropertyQRCode } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';

interface QRCodePDFSignProps {
  property: Property;
  qrCode: PropertyQRCode;
  signType?: 'standard' | 'compact' | 'detailed';
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 5
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 30
  },
  leftColumn: {
    flex: 2,
    paddingRight: 30
  },
  rightColumn: {
    flex: 1,
    alignItems: 'center'
  },
  propertyInfo: {
    marginBottom: 15
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'bold',
    marginBottom: 3
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 10
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: 20,
    border: '2 solid #e5e7eb',
    borderRadius: 8
  },
  qrCodeTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    textAlign: 'center'
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 10
  },
  qrCodeDescription: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 150
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #e5e7eb',
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center'
  },
  compact: {
    padding: 20
  },
  compactTitle: {
    fontSize: 18,
    marginBottom: 15
  },
  compactQR: {
    width: 120,
    height: 120
  }
});

// PDF Document Component
const PropertyQRPDF: React.FC<{property: Property; qrCode: PropertyQRCode; qrCodeImageData: string; signType: string}> = ({ 
  property, 
  qrCode, 
  qrCodeImageData, 
  signType 
}) => {
  const isCompact = signType === 'compact';
  
  return (
    <Document>
      <Page size="A4" style={[styles.page, ...(isCompact ? [styles.compact] : [])]}>
        <View style={styles.header}>
          <Text style={[styles.title, ...(isCompact ? [styles.compactTitle] : [])]}>
            Property Information
          </Text>
          <Text style={styles.subtitle}>
            Scan QR Code for Details
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.leftColumn}>
            <View style={styles.propertyInfo}>
              <Text style={styles.label}>ADDRESS</Text>
              <Text style={styles.value}>{property.address}</Text>
            </View>

            <View style={styles.propertyInfo}>
              <Text style={styles.label}>RENT</Text>
              <Text style={styles.value}>${property.rent.toLocaleString()}/month</Text>
            </View>

            <View style={styles.propertyInfo}>
              <Text style={styles.label}>BEDROOMS & BATHROOMS</Text>
              <Text style={styles.value}>{property.bedrooms} bed • {property.bathrooms} bath</Text>
            </View>

            {property.parking && (
              <View style={styles.propertyInfo}>
                <Text style={styles.label}>PARKING</Text>
                <Text style={styles.value}>{property.parking}</Text>
              </View>
            )}

            {property.availableFrom && (
              <View style={styles.propertyInfo}>
                <Text style={styles.label}>AVAILABLE FROM</Text>
                <Text style={styles.value}>
                  {new Date(property.availableFrom).toLocaleDateString()}
                </Text>
              </View>
            )}

            {signType === 'detailed' && property.description && (
              <View style={styles.propertyInfo}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <Text style={styles.value}>{property.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCodeTitle}>
                Scan for Property Details
              </Text>
              <Image 
                style={[styles.qrCode, ...(isCompact ? [styles.compactQR] : [])]} 
                src={qrCodeImageData}
              />
              <Text style={styles.qrCodeDescription}>
                {qrCode.title}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Generated on {new Date().toLocaleDateString()} | MyRentCard Property System
          </Text>
          <Text style={{marginTop: 5}}>
            QR Code ID: {qrCode.id} | {qrCode.scanCount} total scans
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Main Component
const QRCodePDFSign: React.FC<QRCodePDFSignProps> = ({ 
  property, 
  qrCode, 
  signType = 'standard' 
}) => {
  const { toast } = useToast();
  
  const generateQRCodeImage = async (data: string, size: number = 256): Promise<string> => {
    try {
      // Generate real QR code as data URL using qrcode library
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Generate QR code image data using trackable URL
      const trackableUrl = `${window.location.origin}/qr/${qrCode.id}`;
      const qrCodeImageData = await generateQRCodeImage(trackableUrl);
      
      // Create PDF document
      const pdfDoc = (
        <PropertyQRPDF 
          property={property}
          qrCode={qrCode}
          qrCodeImageData={qrCodeImageData}
          signType={signType}
        />
      );
      
      // Generate PDF blob
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `property-sign-${property.id}-${qrCode.id}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "PDF sign downloaded successfully",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF sign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSignTypeLabel = () => {
    switch (signType) {
      case 'compact': return 'Compact Sign';
      case 'detailed': return 'Detailed Sign';
      default: return 'Standard Sign';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Printable Property Sign</h4>
          <p className="text-sm text-muted-foreground">
            Generate a professional PDF sign with QR code for your property
          </p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2"
          data-testid="button-download-pdf-sign"
        >
          <FileText className="w-4 h-4" />
          Download {getSignTypeLabel()}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['standard', 'compact', 'detailed'] as const).map((type) => (
          <Button
            key={type}
            variant={signType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              // This would update the sign type in the parent component
              // For now, we'll just generate the current type
              handleDownloadPDF();
            }}
            className="text-xs"
            data-testid={`button-sign-type-${type}`}
          >
            <Download className="w-3 h-3 mr-1" />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
        <p><strong>Standard:</strong> Property info + QR code in A4 format</p>
        <p><strong>Compact:</strong> Smaller version for yard signs</p>
        <p><strong>Detailed:</strong> Includes full description and amenities</p>
      </div>
    </div>
  );
};

export default QRCodePDFSign;