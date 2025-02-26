import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';

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

/**
 * Component for uploading and managing property images for the property screening page.
 * This is a simplified version that works with locally stored image URLs in development
 * and can be expanded to use the Cloudinary API in production.
 */
const PropertyScreeningImageUpload: React.FC<PropertyScreeningImageUploadProps> = ({
  images,
  onChange,
  propertyId,
  maxImages = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Handle file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (images.length >= maxImages) {
      alert(`Maximum of ${maxImages} images allowed`);
      return;
    }

    // For demo purposes, simulate uploading by creating object URLs
    // In production, this would upload to Cloudinary and get real URLs
    setIsUploading(true);
    setTimeout(() => {
      const newImages = acceptedFiles.slice(0, maxImages - images.length).map(file => ({
        url: URL.createObjectURL(file),
        isPrimary: images.length === 0, // First image is primary by default
        // No ID for new uploads until they're saved to the server
      }));

      onChange([...images, ...newImages]);
      setIsUploading(false);
    }, 1000); // Simulate upload delay
  }, [images, onChange, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: maxImages - images.length,
    disabled: isUploading || images.length >= maxImages
  });

  // Set an image as the primary image
  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onChange(updatedImages);
  };

  // Remove an image
  const removeImage = (index: number) => {
    // If removing the primary image, make the first remaining image primary
    const isPrimaryRemoved = images[index].isPrimary;
    const remainingImages = images.filter((_, i) => i !== index);
    
    if (isPrimaryRemoved && remainingImages.length > 0) {
      remainingImages[0].isPrimary = true;
    }
    
    onChange(remainingImages);
  };

  // Move image up in the list
  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const updatedImages = [...images];
    [updatedImages[index - 1], updatedImages[index]] = [updatedImages[index], updatedImages[index - 1]];
    onChange(updatedImages);
  };

  // Move image down in the list
  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const updatedImages = [...images];
    [updatedImages[index], updatedImages[index + 1]] = [updatedImages[index + 1], updatedImages[index]];
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Image list */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="p-2 relative">
              <div className="group relative aspect-video overflow-hidden rounded-md">
                <img 
                  src={image.url} 
                  alt={`Property Image ${index + 1}`} 
                  className={cn(
                    "w-full h-full object-cover transition-transform group-hover:brightness-90",
                    image.isPrimary && "ring-2 ring-blue-500"
                  )}
                />
                
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-sm">
                    Primary
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-1">
                    {!image.isPrimary && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white text-blue-600 hover:bg-blue-50"
                        onClick={() => setPrimaryImage(index)}
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  Image {index + 1} of {images.length}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => moveImageUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => moveImageDown(index)}
                    disabled={index === images.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" 
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      {images.length < maxImages && (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
            isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="p-3 bg-blue-50 rounded-full">
              <ImageIcon className="h-6 w-6 text-blue-500" />
            </div>
            {isUploading ? (
              <p className="text-sm text-gray-500">Uploading images...</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drag 'n' drop images here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG or WebP (max. {maxImages - images.length} file{maxImages - images.length !== 1 ? 's' : ''})
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image count indicator */}
      <div className="text-sm text-gray-500 text-right">
        {images.length} of {maxImages} images
      </div>
    </div>
  );
};

export default PropertyScreeningImageUpload;