import React, { useState } from 'react';
import { User, Home, CreditCard, CheckCircle, ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateRentCard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hasPets: null,
    currentEmployer: '',
    yearsEmployed: '',
    monthlyIncome: '',
    currentAddress: '',
    currentRent: '',
    moveInDate: '',
    maxRent: '',
    hasRoommates: null
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[User, Home, CreditCard, CheckCircle].map((Icon, index) => (
        <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center ${
          step >= index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
      ))}
    </div>
  );

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground mt-2">{progress}% Complete</p>
    </div>
  );

  const ValueProposition = () => {
    const messages = {
      1: "Start your rental journey in minutes. No account needed!",
      2: "Help landlords understand your rental history and reliability.",
      3: "Show landlords you're a qualified tenant with verified income details.",
      4: "Your RentCard is ready to help you secure your next home!"
    };

    return (
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Create My Free RentCard</h1>
        <p className="text-muted-foreground">{messages[step as keyof typeof messages]}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="flex items-center justify-between max-w-3xl mx-auto mb-8">
        <div className="flex items-center">
          <Building2 className="w-8 h-8 text-primary mr-2" />
          <span className="text-xl font-semibold">MyRentCard</span>
        </div>
      </header>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          <ProgressBar />
          <StepIndicator />
          <ValueProposition />

          {/* Form steps will be implemented here */}
          
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            {step < 4 && (
              <Button
                onClick={() => setStep(step + 1)}
                className="ml-auto"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
