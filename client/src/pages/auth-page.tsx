import { Building2, ArrowRight, Mail, Lock, Phone } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  userType: z.enum(['tenant', 'landlord']),
});

const AuthPage = () => {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      phone: '',
      userType: 'tenant',
    },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
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
                          variant={registerForm.watch('userType') === 'tenant' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => registerForm.setValue('userType', 'tenant')}
                        >
                          Tenant
                        </Button>
                        <Button
                          type="button"
                          variant={registerForm.watch('userType') === 'landlord' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => registerForm.setValue('userType', 'landlord')}
                        >
                          Landlord
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
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