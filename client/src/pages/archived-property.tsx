import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { Building, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ArchivedPropertyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: property, isLoading } = useQuery({
    queryKey: ['archivedProperty', slug],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', API_ENDPOINTS.PROPERTIES.SCREENING.BY_SLUG(slug || ''));
        return response.json();
      } catch (error) {
        console.error('Error fetching property:', error);
        return null;
      }
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Property Not Available</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            This property is no longer accepting prequalification or screening requests.
          </p>
          
          {property && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Building className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="font-medium">{property.address}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {property.bedrooms} bed • {property.bathrooms} bath • ${property.rent}/month
              </p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            The landlord has archived this property listing. It may become available again in the future, or the property might have been rented.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={ROUTES.HOME}>
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ArchivedPropertyPage; 