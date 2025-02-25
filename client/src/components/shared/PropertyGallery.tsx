import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/constants';
import { PropertyImage } from '@shared/schema';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  propertyId: number;
  className?: string;
  showThumbnails?: boolean;
  maxHeight?: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  propertyId,
  className = '',
  showThumbnails = true,
  maxHeight = '400px',
}) => {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch property images
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const data = await response.json();
      setImages(data);
      
      // Set current index to primary image if available
      const primaryIndex = data.findIndex((img: PropertyImage) => img.isPrimary);
      if (primaryIndex !== -1) {
        setCurrentIndex(primaryIndex);
      }
    } catch (error) {
      console.error('Error fetching property images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property images',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, toast]);

  useEffect(() => {
    if (propertyId) {
      fetchImages();
    }
  }, [propertyId, fetchImages]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const openLightbox = () => {
    setIsLightboxOpen(true);
    // Add event listener for keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    // Remove event listener when lightbox is closed
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  };

  // Clean up event listener on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (isLoading) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-lg",
          className
        )}
        style={{ height: maxHeight }}
      >
        <div className="animate-pulse flex flex-col items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-400 mt-2">Loading images...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-lg",
          className
        )}
        style={{ height: maxHeight }}
      >
        <div className="flex flex-col items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-400 mt-2">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main image */}
      <div 
        className="relative rounded-lg overflow-hidden bg-gray-100"
        style={{ height: maxHeight }}
      >
        <img
          src={images[currentIndex]?.imageUrl}
          alt={`Property image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Fullscreen button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={openLightbox}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        
        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="grid grid-cols-6 gap-2 mt-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "relative rounded-md overflow-hidden cursor-pointer transition-all",
                index === currentIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={image.imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-16 object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/20 text-white border-white/20 hover:bg-black/40"
                onClick={closeLightbox}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-1 rounded-md">
              {currentIndex + 1} / {images.length}
            </div>
            
            {/* Main image container */}
            <div className="flex-1 flex items-center justify-center p-10">
              <img
                src={images[currentIndex]?.imageUrl}
                alt={`Property image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Navigation arrows - larger for lightbox */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/20 text-white border-white/20 hover:bg-black/40"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/20 text-white border-white/20 hover:bg-black/40"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Thumbnails in lightbox */}
            <div className="p-4 bg-black/60">
              <div className="flex justify-center gap-2 overflow-x-auto py-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={cn(
                      "relative rounded-md overflow-hidden cursor-pointer transition-all",
                      index === currentIndex ? "ring-2 ring-primary" : "opacity-50 hover:opacity-100"
                    )}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-14 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyGallery; 