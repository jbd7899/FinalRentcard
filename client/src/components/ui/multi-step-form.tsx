import React, { ReactNode, useState } from 'react';
import { Button } from './button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { validateFormFields } from '@/utils/form-utils';

export interface StepConfig {
  fields: string[];
  component: ReactNode;
  title?: string;
  description?: string;
}

interface MultiStepFormProps<T extends FieldValues> {
  steps: StepConfig[];
  form: UseFormReturn<T>;
  onStepChange?: (step: number) => void;
  onSubmit: (data: T) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showProgressBar?: boolean;
  className?: string;
}

export function MultiStepForm<T extends FieldValues>({
  steps,
  form,
  onStepChange,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit',
  showProgressBar = true,
  className = '',
}: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = steps.length;
  
  const handleNext = async () => {
    const stepConfig = steps[currentStep - 1];
    const isValid = await validateFormFields(form, stepConfig.fields);
    
    if (isValid) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(nextStep);
      }
    }
  };
  
  const handleBack = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    if (onStepChange) {
      onStepChange(prevStep);
    }
  };
  
  const handleFormSubmit = form.handleSubmit((data) => {
    if (currentStep < totalSteps) {
      handleNext();
    } else {
      onSubmit(data);
    }
  });
  
  const ProgressBar = () => {
    if (!showProgressBar) return null;
    
    return (
      <div className="mb-8">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </p>
      </div>
    );
  };
  
  const currentStepConfig = steps[currentStep - 1];
  
  return (
    <form onSubmit={handleFormSubmit} className={className}>
      <ProgressBar />
      
      {currentStepConfig.title && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{currentStepConfig.title}</h2>
          {currentStepConfig.description && (
            <p className="text-muted-foreground">{currentStepConfig.description}</p>
          )}
        </div>
      )}
      
      {currentStepConfig.component}
      
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        
        <Button 
          type="submit" 
          className={currentStep === 1 ? "ml-auto" : ""} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : currentStep < totalSteps ? (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
} 