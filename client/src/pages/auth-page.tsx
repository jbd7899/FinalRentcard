import { Building2, ArrowRight, Mail, Lock, Phone } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/card";
import { useEffect } from 'react';
import { 
  VALIDATION, 
  USER_ROLES, 
  MESSAGES, 
  ROUTES 
} from '@/constants';

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
      userType: USER_ROLES.TENANT,
    },
  });

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="px-4 py-3 border-b bg-white">
        <div className="max-w-xl mx-auto flex items-center">
          <Link href="/" className="flex items-center text-blue-600">
            <Building2 className="w-8 h-8 mr-2" />
            <span className="text-xl font-semibold">MyRentCard</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to manage your RentCard</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="email"
                          {...loginForm.register('email')}
                          className="pl-10"
                          placeholder="Enter your email"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="password"
                          {...loginForm.register('password')}
                          className="pl-10"
                          placeholder="Enter your password"
                        />
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loadingStates.login}
                    >
                      {loadingStates.login ? (
                        <span>Signing in...</span>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Register to start using RentCard</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="email"
                          {...registerForm.register('email')}
                          className="pl-10"
                          placeholder="Enter your email"
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="tel"
                          {...registerForm.register('phone')}
                          className="pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {registerForm.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          type="password"
                          {...registerForm.register('password')}
                          className="pl-10"
                          placeholder="Create a password"
                        />
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Account Type</Label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <Button
                          type="button"
                          variant={registerForm.watch('userType') === USER_ROLES.TENANT ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => registerForm.setValue('userType', USER_ROLES.TENANT)}
                        >
                          Tenant
                        </Button>
                        <Button
                          type="button"
                          variant={registerForm.watch('userType') === USER_ROLES.LANDLORD ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => registerForm.setValue('userType', USER_ROLES.LANDLORD)}
                        >
                          Landlord
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loadingStates.register}
                    >
                      {loadingStates.register ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;