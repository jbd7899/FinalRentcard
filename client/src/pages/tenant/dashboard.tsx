import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Star, 
  Clock, 
  Building2, 
  ArrowRight,
  CheckCircle,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/shared/navbar";
import { ROUTES, CONFIG, MESSAGES, APPLICATION_STATUS, type ApplicationStatus } from "@/constants";
import { Link } from "wouter";

const generateRoute = {
  application: (id: string) => `/tenant/applications/${id}`
};

const TenantDashboard = () => {
  const { logoutMutation } = useAuth();

  // Demo data
  const rentCardStatus = {
    score: 4.8,
    verifiedReferences: 2,
    completionStatus: 85,
    lastUpdated: "Feb 15, 2025"
  };

  const applications = [
    {
      id: 1,
      property: "123 Main Street Unit A",
      landlord: "John Smith",
      status: APPLICATION_STATUS.PENDING as ApplicationStatus,
      submittedAt: "2025-02-18T10:30:00",
      requirements: {
        creditScore: "✓ Meets requirement",
        income: "✓ 3.5x monthly rent",
        employment: "✓ Verified",
        references: "✓ 2 verified references"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">Tenant Dashboard</h1>
              <p className="text-muted-foreground">Manage your RentCard and applications</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Logout
            </Button>
          </div>

          {/* RentCard Status */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium mb-2">Your RentCard</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified Profile
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Last updated: {rentCardStatus.lastUpdated}
                    </span>
                  </div>
                </div>
                <Link href={ROUTES.TENANT.RENTCARD}>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    View RentCard
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Rental Score</p>
                        <p className="text-2xl font-semibold mt-1">{rentCardStatus.score}</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Verified References</p>
                        <p className="text-2xl font-semibold mt-1">{rentCardStatus.verifiedReferences}</p>
                      </div>
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Profile Completion</p>
                        <p className="text-2xl font-semibold mt-1">{rentCardStatus.completionStatus}%</p>
                      </div>
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Active Applications */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Active Applications</h2>
              <Link href={ROUTES.TENANT.APPLICATIONS}>
                <Button variant="outline">View All Applications</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{app.property}</h3>
                        <p className="text-sm text-muted-foreground">Applied to {app.landlord}'s property</p>
                      </div>
                      <Badge variant="secondary">
                        {app.status === APPLICATION_STATUS.PENDING ? MESSAGES.APPLICATION_STATUS.PENDING : app.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {Object.entries(app.requirements).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-muted-foreground capitalize">
                            {key.replace('_', ' ')}
                          </p>
                          <p>{value}</p>
                        </div>
                      ))}
                    </div>

                    <Link href={generateRoute.application(app.id.toString())}>
                      <Button variant="outline" className="w-full">
                        View Application Status
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;