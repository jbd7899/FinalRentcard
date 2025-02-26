import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, MESSAGES } from '@/constants';

interface PropertyImage {
  url: string;
  isPrimary: boolean;
  id?: number;
}

interface PropertyScreeningImageUploadProps {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
  propertyId?: number;
  maxImages?: number;
}

const PropertyScreeningImageUpload: React.FC<PropertyScreeningImageUploadProps> = ({
  images = [],
  onChange,
  propertyId,
  maxImages = 10
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [localImages, setLocalImages] = useState<PropertyImage[]>(images);

  // Update local state when prop changes
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  // Handle file uploads
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (localImages.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload a maximum of ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, we'll simulate uploads by creating object URLs
    // In production, these would be uploaded to a server or cloud storage
    setIsUploading(true);
    try {
      const newImages = acceptedFiles.map(file => ({
        url: URL.createObjectURL(file),
        isPrimary: localImages.length === 0, // First image is primary by default
        // In a real app, we'd get the ID from the server response
        id: Math.floor(Math.random() * 10000)
      }));
      
      const updatedImages = [...localImages, ...newImages];
      setLocalImages(updatedImages);
      onChange(updatedImages);
      
      // Simulate a delay for the upload process
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${acceptedFiles.length} image(s)`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload one or more images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [localImages, maxImages, onChange, toast]);

  // Set an image as primary
  const setPrimaryImage = (index: number) => {
    const updatedImages = localImages.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setLocalImages(updatedImages);
    onChange(updatedImages);
    
    toast({
      title: "Primary image set",
      description: "The selected image is now the primary image for this property."
    });
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...localImages];
    newImages.splice(index, 1);
    
    // If we removed the primary image and we still have images, set the first one as primary
    if (localImages[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    setLocalImages(newImages);
    onChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    disabled: isUploading || localImages.length >= maxImages
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isUploading || localImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-4">
          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
          {isUploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : localImages.length >= maxImages ? (
            <p className="text-sm text-gray-500">Maximum number of images reached ({maxImages})</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Drag and drop images here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse files</p>
              <p className="text-xs text-gray-500 mt-2">
                {localImages.length > 0 
                  ? `${localImages.length} of ${maxImages} images uploaded`
                  : `Upload up to ${maxImages} images`}
              </p>
            </>
          )}
        </div>
      </div>

      {localImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {localImages.map((image, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group">
              <div className="relative aspect-[4/3]">
                <img
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.isPrimary && (
                  <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs py-1 px-2 rounded-full flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Primary
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {!image.isPrimary && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 left-2 text-xs py-1 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPrimaryImage(index)}
                >
                  Set as Primary
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyScreeningImageUpload;