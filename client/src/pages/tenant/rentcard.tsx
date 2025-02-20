import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Building2,
  Briefcase,
  DollarSign,
  CreditCard,
  CheckCircle,
  Share2,
  Download
} from 'lucide-react';

const RentCard = () => {
  // Demo data
  const rentCardData = {
    tenant: {
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "(555) 123-4567",
      since: "January 2025"
    },
    score: {
      overall: 4.8,
      payment: 5.0,
      maintenance: 4.7,
      communication: 4.8
    },
    employment: {
      status: "Full-time",
      employer: "Tech Company Inc.",
      position: "Software Developer",
      income: "85,000",
      duration: "3+ years"
    },
    creditInfo: {
      score: "720-750",
      history: "Good standing"
    },
    references: [
      {
        name: "Robert Wilson",
        property: "Parkview Apartments",
        dates: "Jan 2023 - Dec 2024",
        rating: 5,
        highlights: ["Always paid on time", "Excellent property maintenance", "Quiet and respectful"],
        verified: true
      },
      {
        name: "Emily Davis",
        property: "Riverfront Residences",
        dates: "Mar 2020 - Dec 2022",
        rating: 4.8,
        highlights: ["Consistent payment history", "Good communication", "Followed all rules"],
        verified: true
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{rentCardData.tenant.name}'s RentCard</h1>
            <p className="text-muted-foreground">Member since {rentCardData.tenant.since}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Score Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{rentCardData.score.overall}</div>
                  <Star className="w-6 h-6 text-yellow-400 mx-auto" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium">Rental Score</h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Profile
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Payment History</p>
                <p className="text-xl font-semibold mt-1">{rentCardData.score.payment}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Maintenance</p>
                <p className="text-xl font-semibold mt-1">{rentCardData.score.maintenance}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Communication</p>
                <p className="text-xl font-semibold mt-1">{rentCardData.score.communication}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Employment */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Employment</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current Position</p>
                  <p>{rentCardData.employment.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employer</p>
                  <p>{rentCardData.employment.employer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p>{rentCardData.employment.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Financial Overview</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p>${rentCardData.employment.income}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Score Range</p>
                  <p>{rentCardData.creditInfo.score}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit History</p>
                  <p>{rentCardData.creditInfo.history}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Landlord References */}
        <h3 className="font-medium mb-4">Verified Landlord References</h3>
        <div className="space-y-4">
          {rentCardData.references.map((ref, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{ref.name}</h4>
                    <p className="text-sm text-muted-foreground">{ref.property}</p>
                    <p className="text-sm text-muted-foreground">{ref.dates}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ref.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {ref.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ref.highlights.map((highlight, i) => (
                    <Badge key={i} variant="secondary">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RentCard;
