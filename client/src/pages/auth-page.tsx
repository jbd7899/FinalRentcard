import { Building2, ArrowRight, Mail, Lock } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginPage = () => {
  const { loginMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({
      username: data.email,
      password: data.password,
    });
  };

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
          {/* Login Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to manage your RentCard</p>
            </div>

            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...form.register('email')}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...form.register('password')}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>

          {/* Alternative Options */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account yet?{' '}
              <Link href="/create-rentcard" className="text-blue-600 hover:underline font-medium">
                Create your RentCard
              </Link>
            </p>
            <p className="mt-2 text-gray-600">
              Are you a landlord?{' '}
              <Link href="/screening" className="text-blue-600 hover:underline font-medium">
                Create screening page
              </Link>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Lock className="w-4 h-4 mr-1" />
              Secure login • 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;