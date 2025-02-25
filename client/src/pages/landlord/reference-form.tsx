import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import LandlordLayout from '@/components/layouts/LandlordLayout';

const LandlordReferenceForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    confirmIdentity: false,
    tenancyPeriod: '',
    rentAmount: '',
    paymentHistory: '',
    propertyCondition: '',
    noiseComplaints: '',
    rentAgain: '',
    additionalComments: ''
  });

  // Demo data - in real app, would be passed through URL params
  const tenantInfo = {
    name: "Sarah Johnson",
    propertyAddress: "123 Main Street, Apt 4B",
    tenancyDates: "Jan 2023 - Dec 2024"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <LandlordLayout>
        <div className="flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
              <p className="text-muted-foreground">
                Your reference for {tenantInfo.name} has been submitted successfully.
              </p>
            </CardContent>
          </Card>
        </div>
      </LandlordLayout>
    );
  }

  return (
    <LandlordLayout>
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tenant Reference Form</h1>
          <p className="text-gray-500 mt-1">
            Please provide your honest assessment of this tenant
          </p>
        </header>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <img src="/logo.svg" alt="RentCard Logo" className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Tenant Information</h2>
                <p className="text-muted-foreground">Reference Request</p>
              </div>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Name: {tenantInfo.name}</p>
                <p className="text-muted-foreground">Property: {tenantInfo.propertyAddress}</p>
                <p className="text-muted-foreground">Period: {tenantInfo.tenancyDates}</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="identity"
                      checked={formData.confirmIdentity}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, confirmIdentity: checked as boolean})}
                      required
                    />
                    <div>
                      <Label htmlFor="identity" className="font-medium">Identity Confirmation</Label>
                      <p className="text-sm text-muted-foreground">
                        I confirm I was/am the landlord/property manager for this tenant during the specified period
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div>
                  <Label>Length of Tenancy</Label>
                  <Select 
                    value={formData.tenancyPeriod}
                    onValueChange={(value) => setFormData({...formData, tenancyPeriod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-6">Less than 6 months</SelectItem>
                      <SelectItem value="6-12">6-12 months</SelectItem>
                      <SelectItem value="1-2-years">1-2 years</SelectItem>
                      <SelectItem value="more-than-2">More than 2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Monthly Rent Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1500"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Rent Payment History</Label>
                  <Select 
                    value={formData.paymentHistory}
                    onValueChange={(value) => setFormData({...formData, paymentHistory: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always-on-time">Always on time</SelectItem>
                      <SelectItem value="mostly-on-time">Mostly on time (1-2 late payments)</SelectItem>
                      <SelectItem value="sometimes-late">Sometimes late (3-5 late payments)</SelectItem>
                      <SelectItem value="often-late">Often late (more than 5 late payments)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Property Condition Upon Move-Out</Label>
                  <Select 
                    value={formData.propertyCondition}
                    onValueChange={(value) => setFormData({...formData, propertyCondition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent - Better than move-in</SelectItem>
                      <SelectItem value="good">Good - Normal wear and tear</SelectItem>
                      <SelectItem value="fair">Fair - Some damage beyond wear and tear</SelectItem>
                      <SelectItem value="poor">Poor - Significant damage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Noise or Disturbance Complaints</Label>
                  <Select 
                    value={formData.noiseComplaints}
                    onValueChange={(value) => setFormData({...formData, noiseComplaints: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="few">Few (1-2 incidents)</SelectItem>
                      <SelectItem value="several">Several (3+ incidents)</SelectItem>
                      <SelectItem value="frequent">Frequent issues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Would you rent to this tenant again?</Label>
                  <Select 
                    value={formData.rentAgain}
                    onValueChange={(value) => setFormData({...formData, rentAgain: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="definitely">Yes, definitely</SelectItem>
                      <SelectItem value="probably">Yes, probably</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Additional Comments (Optional)</Label>
                  <Textarea
                    rows={4}
                    placeholder="Any additional information you'd like to share about this tenant..."
                    value={formData.additionalComments}
                    onChange={(e) => setFormData({...formData, additionalComments: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Submit Reference
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                This reference will be added to {tenantInfo.name}'s RentCard profile.
                Their future potential landlords may contact you to verify this reference.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </LandlordLayout>
  );
};

export default LandlordReferenceForm;
