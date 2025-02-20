import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { TenantProfile, LandlordProfile, Property, Application } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Home, Building, CheckCircle2, XCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery<
    TenantProfile | LandlordProfile
  >({
    queryKey: [`/api/profile/${user?.userType}/${user?.id}`],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", user?.userType === "landlord" ? user.id : null],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<
    Application[]
  >({
    queryKey: [
      "/api/applications",
      user?.userType === "tenant"
        ? { tenantId: user.id }
        : { landlordId: user.id },
    ],
  });

  if (profileLoading || propertiesLoading || applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user?.userType === "tenant" ? (
                <Home className="h-6 w-6" />
              ) : (
                <Building className="h-6 w-6" />
              )}
              Welcome, {user?.username}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {user?.userType === "tenant"
                ? "Manage your RentCard and track your applications"
                : "Manage your properties and review applications"}
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {user?.userType === "tenant" ? (
              <>
                {/* Tenant Profile */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Your RentCard</CardTitle>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {profile ? (
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">Move-in Date</p>
                          <p className="text-muted-foreground">
                            {new Date(
                              (profile as TenantProfile).moveInDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Max Rent</p>
                          <p className="text-muted-foreground">
                            ${(profile as TenantProfile).maxRent}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Employment</p>
                          <p className="text-muted-foreground">
                            {(profile as TenantProfile).employmentInfo.employer} -{" "}
                            {(profile as TenantProfile).employmentInfo.position}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button>Create RentCard</Button>
                    )}
                  </CardContent>
                </Card>

                {/* Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications?.length ? (
                      <div className="space-y-4">
                        {applications.map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">Property #{app.propertyId}</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.status === "approved" ? (
                                <CheckCircle2 className="text-green-500" />
                              ) : app.status === "rejected" ? (
                                <XCircle className="text-red-500" />
                              ) : (
                                <Loader2 className="animate-spin text-yellow-500" />
                              )}
                              <span className="capitalize">{app.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No applications yet</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Landlord Profile */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Company Profile</CardTitle>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {profile ? (
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium">Company Name</p>
                          <p className="text-muted-foreground">
                            {(profile as LandlordProfile).companyName}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Screening Criteria</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                              Min Credit Score:{" "}
                              {(profile as LandlordProfile).screeningCriteria.minCreditScore}
                            </li>
                            <li>
                              Min Income: $
                              {(profile as LandlordProfile).screeningCriteria.minIncome}
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <Button>Complete Profile</Button>
                    )}
                  </CardContent>
                </Card>

                {/* Properties */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Your Properties</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {properties?.length ? (
                      <div className="space-y-4">
                        {properties.map((property) => (
                          <div
                            key={property.id}
                            className="p-4 border rounded-lg space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{property.address}</p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  property.available
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {property.available ? "Available" : "Rented"}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              Rent: ${property.rent}/month
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No properties listed</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right Column - Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder activity items */}
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Profile Updated</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">New Message</p>
                  <p className="text-sm text-muted-foreground">5 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
