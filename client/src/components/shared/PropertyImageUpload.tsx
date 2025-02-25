import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { API_ENDPOINTS } from '@/constants';
import { PropertyImage } from '@shared/schema';

interface PropertyImageUploadProps {
  propertyId: number;
  onImagesChange?: (images: PropertyImage[]) => void;
  maxImages?: number;
  className?: string;
}

export const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  propertyId,
  onImagesChange,
  maxImages = 10,
  className = '',
}) => {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [reordering, setReordering] = useState(false);
  const { toast } = useToast();

  // Fetch existing images
  const fetchImages = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        API_ENDPOINTS.PROPERTIES.IMAGES.LIST(propertyId), 
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
      }
      
      // Safely parse the JSON response
      let data = [];
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Error parsing image response:', parseError);
        // Return empty array instead of throwing
        data = [];
      }
      
      setImages(data);
      if (onImagesChange) onImagesChange(data);
    } catch (error) {
      // Don't throw if it's an abort error
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Image fetch aborted');
        return;
      }
      
      console.error('Error fetching property images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property images. Using cached data if available.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, onImagesChange, toast]);

  useEffect(() => {
    if (propertyId) {
      fetchImages();
    }
  }, [propertyId, fetchImages]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast({
          title: 'Too many images',
          description: `You can upload a maximum of ${maxImages} images`,
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      
      for (const file of acceptedFiles) {
        try {
          // Create a unique ID for this upload
          const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Initialize progress for this upload
          setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
          
          const formData = new FormData();
          formData.append('image', file);

          const xhr = new XMLHttpRequest();
          
          // Set up progress tracking
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(prev => ({ ...prev, [uploadId]: percentComplete }));
            }
          });

          // Create a promise to handle the XHR request
          const uploadPromise = new Promise<PropertyImage>((resolve, reject) => {
            xhr.open('POST', API_ENDPOINTS.PROPERTIES.IMAGES.UPLOAD(propertyId));
            
            // Set up authorization header if needed
            const token = localStorage.getItem('token');
            if (token) {
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            };
            
            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(formData);
          });

          const newImage = await uploadPromise;
          
          // Remove this upload from progress tracking
          setUploadProgress(prev => {
            const { [uploadId]: _, ...rest } = prev;
            return rest;
          });
          
          setImages(prev => [...prev, newImage]);
          if (onImagesChange) onImagesChange([...images, newImage]);
          
          toast({
            title: 'Image uploaded',
            description: 'Property image uploaded successfully',
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: 'Upload failed',
            description: 'Failed to upload property image',
            variant: 'destructive',
          });
        }
      }
      
      setIsLoading(false);
    },
    [images, maxImages, propertyId, onImagesChange, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isLoading || images.length >= maxImages,
  });

  const handleDelete = async (imageId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.PROPERTIES.IMAGES.DELETE(imageId), {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete image');
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      if (onImagesChange) onImagesChange(images.filter(img => img.id !== imageId));
      
      toast({
        title: 'Image deleted',
        description: 'Property image deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete property image',
        variant: 'destructive',
      });
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.PROPERTIES.IMAGES.SET_PRIMARY(imageId), {
        method: 'PUT',
      });
      
      if (!response.ok) throw new Error('Failed to set primary image');
      
      // Update local state
      setImages(prev => 
        prev.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        }))
      );
      
      if (onImagesChange) {
        onImagesChange(images.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        })));
      }
      
      toast({
        title: 'Primary image set',
        description: 'Primary property image updated successfully',
      });
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to set primary image',
        variant: 'destructive',
      });
    }
  };

  // Render upload progress indicators
  const renderProgress = () => {
    return Object.entries(uploadProgress).map(([id, progress]) => (
      <div key={id} className="w-full mt-2">
        <div className="text-sm text-gray-500 mb-1">Uploading... {progress}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    ));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'}
          ${isLoading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-500" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop images here'
              : images.length >= maxImages
              ? `Maximum ${maxImages} images reached`
              : 'Drag & drop images here, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Supports JPG, PNG, WEBP (max {maxImages} images)
          </p>
        </div>
      </div>

      {renderProgress()}

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Property Images</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setReordering(!reordering)}
              disabled={images.length <= 1}
            >
              {reordering ? 'Done' : 'Reorder Images'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`relative group rounded-lg overflow-hidden border ${
                  image.isPrimary ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt="Property"
                  className="w-full h-32 object-cover"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-1">
                    {!image.isPrimary && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 bg-white"
                        onClick={() => handleSetPrimary(image.id)}
                        title="Set as primary image"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 bg-white text-destructive hover:text-white hover:bg-destructive"
                      onClick={() => handleDelete(image.id)}
                      title="Delete image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyImageUpload; 