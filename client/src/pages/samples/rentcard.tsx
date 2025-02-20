import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  CheckCircle,
  ArrowRight,
  Building2,
  Users,
  Shield
} from 'lucide-react';

const SampleRentCard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">RentCard Sample Profile</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how RentCard helps landlords make informed decisions with verified tenant profiles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-2">Verified References</h3>
                <p className="text-sm text-muted-foreground">
                  Real landlord references verified by our team
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Rental Score</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive scoring based on rental history
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-2">Verified Data</h3>
                <p className="text-sm text-muted-foreground">
                  Employment, income, and credit information verified
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sample Profile */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold">Sarah Johnson</h2>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-muted-foreground">RentCard member since January 2025</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-muted-foreground">Rental Score</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <p className="text-2xl font-semibold text-green-600">100%</p>
                <p className="text-sm text-muted-foreground">On-time Payments</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">2</p>
                <p className="text-sm text-muted-foreground">Verified References</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">3+ yrs</p>
                <p className="text-sm text-muted-foreground">Rental History</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h3 className="text-xl font-medium mb-4">Ready to create your RentCard?</h3>
          <Button size="lg">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SampleRentCard;
