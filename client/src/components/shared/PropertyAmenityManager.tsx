import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Wifi, Droplets, Zap, Car, Home, MapPin, Building, Utensils, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/constants';
import { PropertyAmenity } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Define amenity categories and types
const AMENITY_CATEGORIES = {
  UTILITIES: 'utilities',
  FEATURES: 'features',
  NEARBY: 'nearby',
} as const;

type AmenityCategory = typeof AMENITY_CATEGORIES[keyof typeof AMENITY_CATEGORIES];

interface AmenityType {
  value: string;
  label: string;
  icon: React.ReactNode;
  category: AmenityCategory;
}

const AMENITY_TYPES: AmenityType[] = [
  // Utilities
  { value: 'wifi', label: 'WiFi Included', icon: <Wifi className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
  { value: 'water', label: 'Water Included', icon: <Droplets className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
  { value: 'electricity', label: 'Electricity Included', icon: <Zap className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
  { value: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" />, category: AMENITY_CATEGORIES.UTILITIES },
  
  // Features
  { value: 'laundry', label: 'In-unit Laundry', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
  { value: 'ac', label: 'Air Conditioning', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
  { value: 'dishwasher', label: 'Dishwasher', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
  { value: 'balcony', label: 'Balcony', icon: <Home className="h-4 w-4" />, category: AMENITY_CATEGORIES.FEATURES },
  
  // Nearby Services
  { value: 'transit', label: 'Public Transit', icon: <MapPin className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
  { value: 'shopping', label: 'Shopping', icon: <Building className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
  { value: 'restaurants', label: 'Restaurants', icon: <Utensils className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
  { value: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" />, category: AMENITY_CATEGORIES.NEARBY },
];

interface PropertyAmenityManagerProps {
  propertyId: number;
  onAmenitiesChange?: (amenities: PropertyAmenity[]) => void;
  className?: string;
}

export const PropertyAmenityManager: React.FC<PropertyAmenityManagerProps> = ({
  propertyId,
  onAmenitiesChange,
  className = '',
}) => {
  const [amenities, setAmenities] = useState<PropertyAmenity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { toast } = useToast();

  // Fetch existing amenities
  const fetchAmenities = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        API_ENDPOINTS.PROPERTIES.AMENITIES.LIST(propertyId),
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch amenities: ${response.status} ${response.statusText}`);
      }
      
      // Safely parse the JSON response
      let data = [];
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Error parsing amenities response:', parseError);
        // Return empty array instead of throwing
        data = [];
      }
      
      setAmenities(data);
      if (onAmenitiesChange) onAmenitiesChange(data);
    } catch (error) {
      // Don't throw if it's an abort error
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Amenities fetch aborted');
        return;
      }
      
      console.error('Error fetching property amenities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property amenities. Using cached data if available.',
        variant: 'destructive',
      });
    }
  }, [propertyId, onAmenitiesChange, toast]);

  useEffect(() => {
    if (propertyId) {
      fetchAmenities();
    }
  }, [propertyId, fetchAmenities]);

  const handleAddAmenity = async () => {
    if (!selectedType) {
      toast({
        title: 'Error',
        description: 'Please select an amenity type',
        variant: 'destructive',
      });
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(API_ENDPOINTS.PROPERTIES.AMENITIES.CREATE(propertyId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amenityType: selectedType,
          description: description.trim() || null,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to add amenity: ${response.status} ${response.statusText}`);
      }
      
      // Safely parse the JSON response
      let newAmenity = null;
      try {
        const text = await response.text();
        if (text) {
          newAmenity = JSON.parse(text);
        } else {
          throw new Error('Empty response received');
        }
      } catch (parseError) {
        console.error('Error parsing add amenity response:', parseError);
        throw new Error('Failed to parse server response');
      }
      
      if (!newAmenity) {
        throw new Error('No amenity data received from server');
      }
      
      // Update state with the new amenity
      setAmenities(prev => [...prev, newAmenity]);
      if (onAmenitiesChange) onAmenitiesChange([...amenities, newAmenity]);
      
      // Reset form
      setSelectedType('');
      setDescription('');
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Amenity added successfully',
      });
    } catch (error) {
      // Don't show error if it's an abort error
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Add amenity request aborted');
        return;
      }
      
      console.error('Error adding amenity:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add amenity',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAmenity = async (amenityId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.PROPERTIES.AMENITIES.DELETE(amenityId), {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete amenity');
      
      setAmenities(prev => prev.filter(amenity => amenity.id !== amenityId));
      if (onAmenitiesChange) onAmenitiesChange(amenities.filter(amenity => amenity.id !== amenityId));
      
      toast({
        title: 'Amenity deleted',
        description: 'Property amenity deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property amenity',
        variant: 'destructive',
      });
    }
  };

  // Group amenities by category
  const amenitiesByCategory = amenities.reduce<Record<AmenityCategory, PropertyAmenity[]>>((acc, amenity) => {
    const amenityType = AMENITY_TYPES.find(type => type.value === amenity.amenityType);
    const category = amenityType?.category || AMENITY_CATEGORIES.FEATURES;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(amenity);
    return acc;
  }, {
    [AMENITY_CATEGORIES.UTILITIES]: [],
    [AMENITY_CATEGORIES.FEATURES]: [],
    [AMENITY_CATEGORIES.NEARBY]: [],
  });

  // Get icon for amenity type
  const getAmenityIcon = (amenityType: string) => {
    return AMENITY_TYPES.find(type => type.value === amenityType)?.icon || <Home className="h-4 w-4" />;
  };

  // Get label for amenity type
  const getAmenityLabel = (amenityType: string) => {
    return AMENITY_TYPES.find(type => type.value === amenityType)?.label || amenityType;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Property Amenities</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Property Amenity</DialogTitle>
              <DialogDescription>
                Select an amenity type and provide an optional description.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amenity Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amenity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <h4 className="mb-2 text-sm font-semibold">Utilities</h4>
                      {AMENITY_TYPES
                        .filter(type => type.category === AMENITY_CATEGORIES.UTILITIES)
                        .map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              {type.icon}
                              <span className="ml-2">{type.label}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </div>
                    <div className="p-2 border-t">
                      <h4 className="mb-2 text-sm font-semibold">Features</h4>
                      {AMENITY_TYPES
                        .filter(type => type.category === AMENITY_CATEGORIES.FEATURES)
                        .map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              {type.icon}
                              <span className="ml-2">{type.label}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </div>
                    <div className="p-2 border-t">
                      <h4 className="mb-2 text-sm font-semibold">Nearby Services</h4>
                      {AMENITY_TYPES
                        .filter(type => type.category === AMENITY_CATEGORIES.NEARBY)
                        .map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              {type.icon}
                              <span className="ml-2">{type.label}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </div>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about this amenity..."
                  className="resize-none"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAmenity}>
                Add Amenity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => (
        categoryAmenities.length > 0 && (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-medium uppercase text-gray-500">
              {category === AMENITY_CATEGORIES.UTILITIES ? 'Utilities' : 
               category === AMENITY_CATEGORIES.FEATURES ? 'Features' : 
               'Nearby Services'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryAmenities.map(amenity => (
                <Badge 
                  key={amenity.id} 
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  <div className="flex items-center">
                    {getAmenityIcon(amenity.amenityType)}
                    <span className="ml-1">{getAmenityLabel(amenity.amenityType)}</span>
                    {amenity.description && (
                      <span className="ml-1 text-xs text-gray-500">
                        - {amenity.description}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 text-gray-500 hover:text-destructive"
                    onClick={() => handleDeleteAmenity(amenity.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )
      ))}
      
      {amenities.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No amenities added yet</p>
          <p className="text-xs mt-1">Add amenities to highlight the features of your property</p>
        </div>
      )}
    </div>
  );
};

export default PropertyAmenityManager; 