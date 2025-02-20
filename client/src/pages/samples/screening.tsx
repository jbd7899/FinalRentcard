import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle,
  ArrowRight,
  Shield,
  Filter,
  Clock
} from 'lucide-react';

const SampleScreening = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Sample Screening Page</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how easy it is to collect and review tenant applications with RentCard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Filter className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-2">Pre-screening</h3>
                <p className="text-sm text-muted-foreground">
                  Set requirements and automatically filter applicants
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-2">Save Time</h3>
                <p className="text-sm text-muted-foreground">
                  Review verified applications in minutes, not hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-2">Verified Data</h3>
                <p className="text-sm text-muted-foreground">
                  All tenant information is pre-verified
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sample Screening Page */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-2xl font-semibold">123 Main Street Apartments</h2>
                <p className="text-muted-foreground">2 bed · 2 bath · $2,500/month</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Requirements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Minimum Credit Score: 650</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Income: 3x Monthly Rent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Employment Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Clean Rental History</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="font-medium mb-2">How It Works</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge>1</Badge>
                    Create or share your RentCard profile
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge>2</Badge>
                    We verify your information automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge>3</Badge>
                    Landlord reviews your complete profile
                  </li>
                </ol>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Submit Your RentCard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <h3 className="text-xl font-medium mb-4">Are you a landlord?</h3>
          <Button variant="outline" size="lg">
            Create Your Screening Page
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SampleScreening;
