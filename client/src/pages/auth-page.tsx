import { Building2, ArrowRight, Mail, Lock, Phone } from 'lucide-react';
import { Link, useLocation, useSearch } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { 
  VALIDATION, 
  USER_ROLES, 
  MESSAGES, 
  ROUTES
} from '@/constants';
import {
  NETWORK_VALUE_PROPS,
  PRIVATE_LANDLORD_STATS,
  NETWORK_NOTIFICATIONS
} from '@shared/network-messaging';
import Navbar from '@/components/shared/navbar';

const loginSchema = z.object({
  email: z.string().email(VALIDATION.EMAIL.MESSAGE),
  password: z.string().min(VALIDATION.PASSWORD.MIN_LENGTH, VALIDATION.PASSWORD.MESSAGE),
});

const registerSchema = z.object({
  email: z.string().email(VALIDATION.EMAIL.MESSAGE),
  password: z.string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH, VALIDATION.PASSWORD.MESSAGE)
    .regex(VALIDATION.PASSWORD.REGEX, VALIDATION.PASSWORD.REGEX_MESSAGE),
  phone: z.string()
    .min(VALIDATION.PHONE.MIN_LENGTH, VALIDATION.PHONE.MESSAGE)
    .regex(VALIDATION.PHONE.REGEX, VALIDATION.PHONE.REGEX_MESSAGE),
  userType: z.enum([USER_ROLES.TENANT, USER_ROLES.LANDLORD]),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const { user, login, error, register } = useAuthStore();
  const { setLoading, loadingStates, addToast } = useUIStore();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  
  // Parse URL parameters for conversion flow
  const mode = searchParams.get('mode'); // 'register' sets active tab
  const type = searchParams.get('type'); // 'landlord' preselects user type
  
  // State for active tab (defaults based on URL params)
  const [activeTab, setActiveTab] = useState(mode === 'register' ? 'register' : 'login');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      phone: '',
      userType: type === 'landlord' ? USER_ROLES.LANDLORD : USER_ROLES.TENANT,
    },
  });

  // Get current userType from form for conditional messaging
  const currentUserType = registerForm.watch('userType');

  useEffect(() => {
    if (user) {
      const dashboardPath = user.userType === USER_ROLES.TENANT 
        ? ROUTES.TENANT.DASHBOARD 
        : ROUTES.LANDLORD.DASHBOARD;
      setLocation(dashboardPath);
    }
  }, [user, setLocation]);

  useEffect(() => {
    if (error) {
      addToast({
        title: MESSAGES.TOAST.AUTH.LOGIN_ERROR.TITLE,
        description: error,
        type: 'destructive'
      });
    }
  }, [error, addToast]);

  const onLogin = async (data: LoginFormData) => {
    try {
      setLoading('login', true);
      await login(data);
      addToast({
        title: MESSAGES.TOAST.AUTH.LOGIN_SUCCESS.TITLE,
        description: MESSAGES.TOAST.AUTH.LOGIN_SUCCESS.DESCRIPTION,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: MESSAGES.TOAST.AUTH.LOGIN_ERROR.TITLE,
        description: error instanceof Error ? error.message : MESSAGES.TOAST.AUTH.LOGIN_ERROR.DESCRIPTION,
        type: 'destructive'
      });
    } finally {
      setLoading('login', false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      setLoading('register', true);
      await register(data);
      addToast({
        title: MESSAGES.TOAST.AUTH.REGISTER_SUCCESS.TITLE,
        description: MESSAGES.TOAST.AUTH.REGISTER_SUCCESS.DESCRIPTION,
        type: 'success'
      });
    } catch (error) {
      addToast({
        title: MESSAGES.TOAST.AUTH.REGISTER_ERROR.TITLE,
        description: error instanceof Error ? error.message : MESSAGES.TOAST.AUTH.REGISTER_ERROR.DESCRIPTION,
        type: 'destructive'
      });
    } finally {
      setLoading('register', false);
    }
  };

  if (user) {
    return null; // Prevents flash of content during redirect
  }


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Join MyRentCard</h1>
            <p className="text-center text-gray-600 mb-8">Connect with landlords and streamline your rental applications</p>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-lg">
                <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-gray-900">Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to access your RentCard and applications
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Username</Label>
                        <Input
                          type="email"
                          {...loginForm.register('email')}
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md h-10"
                          placeholder="Enter your email"
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Password</Label>
                        <Input
                          type="password"
                          {...loginForm.register('password')}
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md h-10"
                          placeholder="Enter your password"
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-md h-10 transition-all duration-200"
                        disabled={loadingStates.login}
                      >
                        {loadingStates.login ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            Sign in
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-gray-900">Create Your Account</CardTitle>
                    <CardDescription>
                      {currentUserType === USER_ROLES.LANDLORD 
                        ? "Manage your properties and tenant applications" 
                        : "Create your digital rental profile"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Email Address</Label>
                        <Input
                          type="email"
                          {...registerForm.register('email')}
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md h-10"
                          placeholder="Enter your email"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Phone Number</Label>
                        <Input
                          type="tel"
                          {...registerForm.register('phone')}
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md h-10"
                          placeholder="Enter your phone number"
                        />
                        {registerForm.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Password</Label>
                        <Input
                          type="password"
                          {...registerForm.register('password')}
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md h-10"
                          placeholder="Create a password"
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters with numbers and special characters</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">I am a:</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <Button
                            type="button"
                            variant={registerForm.watch('userType') === USER_ROLES.TENANT ? 'default' : 'outline'}
                            className={`w-full rounded-md h-10 ${registerForm.watch('userType') === USER_ROLES.TENANT ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => registerForm.setValue('userType', USER_ROLES.TENANT)}
                          >
                            Tenant
                          </Button>
                          <Button
                            type="button"
                            variant={registerForm.watch('userType') === USER_ROLES.LANDLORD ? 'default' : 'outline'}
                            className={`w-full rounded-md h-10 ${registerForm.watch('userType') === USER_ROLES.LANDLORD ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => registerForm.setValue('userType', USER_ROLES.LANDLORD)}
                          >
                            Landlord
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-md h-10 transition-all duration-200"
                        disabled={loadingStates.register}
                      >
                        {loadingStates.register ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            Create Account
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  
                  <CardFooter className="text-center text-xs text-gray-500 pt-2 pb-4">
                    <p>By registering, you agree to our Terms of Service and Privacy Policy</p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right side - Simple hero panel */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="h-full flex flex-col justify-center p-12 text-center">
            <Building2 className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">Streamline Your Rental Process</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Create your digital rental profile once and share it with landlords instantly. 
              Simple, secure, and efficient.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t py-4 mt-auto hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Building2 className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">© {new Date().getFullYear()} MyRentCard</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;