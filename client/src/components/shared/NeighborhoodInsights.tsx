import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Map,
  ShieldCheck,
  Train,
  Bus,
  CarFront,
  Footprints,
  School,
  Utensils,
  ShoppingBag,
  Landmark,
  Dumbbell,
  ParkingCircle,
  Heart,
  CircleAlert,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/constants';

export interface NeighborhoodInsightProps {
  propertyId?: number;
}

// Type for neighborhood insights data
interface NeighborhoodData {
  safetyRating: number;
  walkabilityScore: number;
  transitScore: number;
  nearbyAmenities: Array<{
    name: string;
    type: string;
    distance: number;
    rating?: number;
  }>;
  publicTransport: Array<{
    type: string;
    line: string;
    station: string;
    distance: number;
  }>;
}

// Type for amenity
type AmenityType = 'grocery' | 'restaurant' | 'school' | 'park' | 'healthcare' | 'gym' | 'shopping' | 'entertainment';
type TransportType = 'bus' | 'subway' | 'train' | 'tram' | 'ferry';

// Icons for different amenity types
const amenityIcons: Record<AmenityType, React.ReactNode> = {
  grocery: <ShoppingBag className="w-4 h-4" />,
  restaurant: <Utensils className="w-4 h-4" />,
  school: <School className="w-4 h-4" />,
  park: <Landmark className="w-4 h-4" />,
  healthcare: <Heart className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  entertainment: <Landmark className="w-4 h-4" />,
};

// Icons for different transport types
const transportIcons: Record<TransportType, React.ReactNode> = {
  bus: <Bus className="w-4 h-4" />,
  subway: <Train className="w-4 h-4" />,
  train: <Train className="w-4 h-4" />,
  tram: <Train className="w-4 h-4" />,
  ferry: <Landmark className="w-4 h-4" />,
};

export function NeighborhoodInsights({ propertyId }: NeighborhoodInsightProps) {
  const { data: neighborhoodData, isLoading, error } = useQuery({
    queryKey: [API_ENDPOINTS.PROPERTIES.NEIGHBORHOOD, propertyId],
    enabled: !!propertyId,
  });

  // If no property ID is provided, show limited/demo info
  const isDemoMode = !propertyId;

  // Demo data for when no propertyId is provided or when loading fails
  const demoData = {
    safetyRating: 4.2,
    walkabilityScore: 85,
    transitScore: 73,
    nearbyAmenities: [
      { name: 'Whole Foods Market', type: 'grocery', distance: 0.3, rating: 4.5 },
      { name: 'Jefferson Elementary', type: 'school', distance: 0.5, rating: 4.8 },
      { name: 'City Park', type: 'park', distance: 0.7, rating: 4.7 },
      { name: 'Urgent Care Clinic', type: 'healthcare', distance: 0.8, rating: 4.2 },
      { name: 'Fitness Center', type: 'gym', distance: 0.4, rating: 4.3 },
    ],
    publicTransport: [
      { type: 'bus', line: '42', station: 'Main St & 5th Ave', distance: 0.2 },
      { type: 'subway', line: 'Blue', station: 'Central Station', distance: 0.6 },
    ],
  };

  // Use demo data if in demo mode or if there's an error
  const insights: NeighborhoodData = isDemoMode || error || !neighborhoodData ? demoData : (neighborhoodData as NeighborhoodData);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">½</span>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading && !isDemoMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full max-w-[250px]" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full max-w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-600" />
          Neighborhood Insights
          {isDemoMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="ml-2 text-xs">
                    <Info className="h-3 w-3 mr-1" /> Sample Data
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  This is sample neighborhood data. Actual data will be provided when viewing a specific property.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <CardDescription>
          Explore information about the neighborhood, including safety, walkability, and nearby amenities.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-6 space-y-6">
        {/* Safety and Walkability Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Safety Rating</span>
              </div>
              <span className="text-lg font-bold">{insights.safetyRating.toFixed(1)}/5.0</span>
            </div>
            <div className="h-2 relative bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 absolute left-0 top-0 rounded-full" 
                style={{ width: `${(insights.safetyRating / 5) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Footprints className="w-4 h-4 text-blue-600" />
                <span>Walkability</span>
              </div>
              <span className="text-lg font-bold">{insights.walkabilityScore}/100</span>
            </div>
            <div className="h-2 relative bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full absolute left-0 top-0 rounded-full", getScoreColor(insights.walkabilityScore))} 
                style={{ width: `${insights.walkabilityScore}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Train className="w-4 h-4 text-blue-600" />
                <span>Transit Score</span>
              </div>
              <span className="text-lg font-bold">{insights.transitScore}/100</span>
            </div>
            <div className="h-2 relative bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full absolute left-0 top-0 rounded-full", getScoreColor(insights.transitScore))} 
                style={{ width: `${insights.transitScore}%` }}
              />
            </div>
          </div>
        </div>

        <Separator />
        
        {/* Nearby Amenities */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Nearby Amenities</h3>
          <div className="space-y-3">
            {insights.nearbyAmenities.map((amenity: { name: string; type: string; distance: number; rating?: number }, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {amenityIcons[amenity.type as AmenityType] || <Landmark className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{amenity.name}</span>
                    <span className="text-sm text-gray-500">{amenity.distance} mi</span>
                  </div>
                  {amenity.rating && (
                    <div className="text-xs">{getRatingStars(amenity.rating)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Public Transport */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Public Transportation</h3>
          <div className="space-y-3">
            {insights.publicTransport.map((transport: { type: string; line: string; station: string; distance: number }, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {transportIcons[transport.type as TransportType] || <Bus className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {transport.type.charAt(0).toUpperCase() + transport.type.slice(1)} {transport.line}
                    </span>
                    <span className="text-sm text-gray-500">{transport.distance} mi</span>
                  </div>
                  <div className="text-sm text-gray-600">{transport.station}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}