import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Link, Copy, ExternalLink } from 'lucide-react';

const ScreeningPage = () => {
  const [copied, setCopied] = useState(false);

  // Demo data
  const screeningInfo = {
    pageUrl: "rentcard.com/screen/123main-a",
    requirements: {
      creditScore: 650,
      income: "3x rent",
      employment: "Verified employment",
      references: "2 landlord references"
    },
    property: {
      name: "123 Main Street Unit A",
      rent: 2500,
      bedrooms: 2,
      bathrooms: 1.5
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(screeningInfo.pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Property Screening Page</h1>
          <p className="text-muted-foreground">
            Share this page with potential tenants to collect their RentCards
          </p>
        </div>

        {/* Screening Link Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-medium">{screeningInfo.property.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    ${screeningInfo.property.rent}/month · {screeningInfo.property.bedrooms}bd · {screeningInfo.property.bathrooms}ba
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={copyLink}>
                {copied ? (
                  <Copy className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Link className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <Label>Screening Page URL</Label>
              <div className="flex gap-2 mt-1">
                <Input value={screeningInfo.pageUrl} readOnly />
                <Button variant="outline" size="icon">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Card */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Screening Requirements</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Credit Score</Label>
                  <Input value={screeningInfo.requirements.creditScore} />
                </div>
                <div>
                  <Label>Income Requirement</Label>
                  <Input value={screeningInfo.requirements.income} />
                </div>
              </div>
              <div>
                <Label>Employment Verification</Label>
                <Input value={screeningInfo.requirements.employment} />
              </div>
              <div>
                <Label>References Required</Label>
                <Input value={screeningInfo.requirements.references} />
              </div>
              <Button className="w-full">
                Update Requirements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScreeningPage;
