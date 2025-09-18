import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Star,
  User,
  UserCheck,
  Eye,
  Share2,
  Trophy,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ROUTES } from '@/constants';
import { NETWORK_VALUE_PROPS, INDIVIDUAL_LANDLORD_STATS, SOCIAL_PROOF_STATS, NETWORK_NOTIFICATIONS } from '@shared/network-messaging';

interface OnboardingStep {
  id: string;
  stepNumber: number;
  stepKey: string;
  stepTitle: string;
  stepDescription: string;
  isCompleted: boolean;
  completedAt?: string;
  requirementsMet?: { [key: string]: boolean };
  icon: React.ReactNode;
  route: string;
  actionText: string;
}

interface OnboardingProgress {
  id: number;
  userId: number;
  userType: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: string;
}

interface OnboardingData {
  progress: OnboardingProgress;
  steps: OnboardingStep[];
}

interface OnboardingChecklistProps {
  onDismiss?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  onDismiss,
  collapsed = false,
  onToggleCollapse
}) => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch onboarding progress
  const { 
    data: onboardingData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: async (): Promise<OnboardingData> => {
      const response = await apiRequest('GET', '/api/onboarding/progress');
      return response.json();
    },
    enabled: !!user
  });

  // Auto-check progress mutation
  const autoCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/onboarding/auto-check');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      
      // Show appropriate message based on completion status
      const completedSteps = Object.keys(data.checkedSteps).filter(key => data.checkedSteps[key]);
      if (completedSteps.length > 0) {
        // Check if onboarding is now fully completed after this update
        if (data.isCompleted) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          
          addToast({
            title: 'Individual Landlord Network Ready! 🎉',
            description: 'Great job! Individual landlords can now make faster decisions about your application.',
            type: 'success'
          });
        } else {
          // Neutral progress message for partial completion
          addToast({
            title: 'Progress updated',
            description: `${completedSteps.length} step${completedSteps.length > 1 ? 's' : ''} completed.`,
            type: 'success'
          });
        }
      }
    }
  });

  // Mark step completed mutation
  const markStepMutation = useMutation({
    mutationFn: async ({ stepKey, metadata }: { stepKey: string; metadata?: any }) => {
      const response = await apiRequest('POST', `/api/onboarding/steps/${stepKey}/complete`, { metadata });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    }
  });

  // FIXED: Auto-check progress when data loads and when user changes
  // Added onboardingData to dependencies to ensure auto-check runs when data loads
  useEffect(() => {
    if (onboardingData && !onboardingData.progress.isCompleted) {
      autoCheckMutation.mutate();
    }
  }, [user, onboardingData?.progress?.isCompleted]);

  const handleStepClick = (step: OnboardingStep) => {
    // FIXED: Only navigate to step route, don't mark as complete
    // Steps should only complete when actual tasks are done, not on click
    // The auto-check system will handle proper completion detection
    
    // TODO: Add analytics tracking endpoint for step clicks if needed
    // For now, just navigate - let auto-check handle proper completion detection
    
    // Navigate to the step's route
    setLocation(step.route);
  };

  const getStepIcon = (stepKey: string, isCompleted: boolean) => {
    const iconProps = { className: `w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-400'}` };
    
    switch (stepKey) {
      case 'complete_profile':
        return <User {...iconProps} />;
      case 'add_references':
        return <UserCheck {...iconProps} />;
      case 'preview_rentcard':
        return <Eye {...iconProps} />;
      case 'share_first_link':
        return <Share2 {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  const getRouteForStep = (stepKey: string): string => {
    switch (stepKey) {
      case 'complete_profile':
        return ROUTES.TENANT.RENTCARD;
      case 'add_references':
        return ROUTES.TENANT.REFERENCES;
      case 'preview_rentcard':
        return ROUTES.TENANT.RENTCARD;
      case 'share_first_link':
        return ROUTES.TENANT.RENTCARD;
      default:
        return ROUTES.TENANT.DASHBOARD;
    }
  };

  const getActionTextForStep = (stepKey: string): string => {
    switch (stepKey) {
      case 'complete_profile':
        return 'Connect with Individual Landlords';
      case 'add_references':
        return 'Build Individual Landlord Trust';
      case 'preview_rentcard':
        return 'Enable Individual Landlord Review';
      case 'share_first_link':
        return 'Share with Property Owners';
      default:
        return 'Get Started';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !onboardingData) {
    return null;
  }

  const { progress, steps } = onboardingData;
  
  // Don't show if completed and dismissed
  if (progress.isCompleted && collapsed) {
    return null;
  }

  // Transform steps data
  const transformedSteps: OnboardingStep[] = steps.map((step, index) => ({
    id: step.id?.toString() || index.toString(),
    stepNumber: step.stepNumber,
    stepKey: step.stepKey,
    stepTitle: step.stepTitle,
    stepDescription: step.stepDescription || '',
    isCompleted: step.isCompleted,
    completedAt: step.completedAt,
    requirementsMet: step.requirementsMet,
    icon: getStepIcon(step.stepKey, step.isCompleted),
    route: getRouteForStep(step.stepKey),
    actionText: getActionTextForStep(step.stepKey)
  }));

  const nextStep = transformedSteps.find(step => !step.isCompleted);
  const completedCount = transformedSteps.filter(step => step.isCompleted).length;

  return (
    <Card className={`mb-6 transition-all duration-300 ${showCelebration ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${progress.isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`} data-testid="onboarding-checklist">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {progress.isCompleted ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg text-gray-800">
                {progress.isCompleted ? '🎉 Ready for Individual Landlords!' : 'Connect with Individual Landlords'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {progress.isCompleted 
                  ? `Individual landlords who own ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} can now make ${SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_DECISIONS}.`
                  : `Complete your profile to connect with individual landlords who own ${INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE} (${completedCount}/${progress.totalSteps} done)`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!progress.isCompleted && (
              <Badge variant="outline" className="text-xs font-medium">
                {progress.progressPercentage}% Complete
              </Badge>
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                data-testid="button-toggle-collapse"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>
            )}
            {onDismiss && progress.isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                data-testid="button-dismiss-onboarding"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {!collapsed && !progress.isCompleted && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress.progressPercentage}%</span>
            </div>
            <Progress 
              value={progress.progressPercentage} 
              className="h-2"
              data-testid="onboarding-progress-bar"
            />
          </div>
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0">
          {progress.isCompleted ? (
            <div className="text-center py-6">
              <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Individual Landlord Network Ready!</h3>
              <p className="text-gray-600 mb-4">
                You can now connect directly with individual landlords who own {INDIVIDUAL_LANDLORD_STATS.MARKET_SHARE}. 
                Individual landlords respond {SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_RESPONSE_TIME} than corporate management.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-600">{SOCIAL_PROOF_STATS.INDIVIDUAL_LANDLORD_DECISIONS}</div>
                  <div className="text-gray-600">Decision Speed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-600">{SOCIAL_PROOF_STATS.PERSONAL_RELATIONSHIPS}</div>
                  <div className="text-gray-600">Direct Connection</div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setLocation(ROUTES.TENANT.RENTCARD)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-view-rentcard"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Your RentCard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation(ROUTES.TENANT.INTERESTS)}
                  data-testid="button-browse-properties"
                >
                  Browse Properties
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transformedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    step.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : nextStep?.id === step.id
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStepClick(step)}
                  data-testid={`onboarding-step-${step.stepKey}`}
                >
                  <div className="flex items-center flex-1 gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.isCompleted 
                        ? 'bg-green-100' 
                        : nextStep?.id === step.id
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                    }`}>
                      {step.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">{step.stepNumber}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${step.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                        {step.stepTitle}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {step.stepDescription}
                      </p>
                      {step.isCompleted && step.completedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Completed {new Date(step.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.isCompleted ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    ) : nextStep?.id === step.id ? (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid={`button-step-action-${step.stepKey}`}
                      >
                        {step.actionText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-step-outline-${step.stepKey}`}
                      >
                        {step.actionText}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {nextStep && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-800">Next Step: Connect with Individual Landlords</h4>
                      <p className="text-sm text-blue-700">
                        Complete "{nextStep.stepTitle}" to access the individual landlord network who make faster, personal decisions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default OnboardingChecklist;