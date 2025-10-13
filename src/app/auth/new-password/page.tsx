'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authService } from '@/lib/auth';
import { AuthPageProtection } from '@/components/auth/AuthPageProtection';
import { AuthAwareNavigation } from '@/components/auth/AuthAwareNavigation';

const newPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type NewPasswordForm = z.infer<typeof newPasswordSchema>;

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
  });

  const password = watch('password');

  // Redirect if no email or OTP provided
  useEffect(() => {
    if (!email || !otp) {
      router.push('/auth/reset-password');
    }
  }, [email, otp, router]);

  const onSubmit = async (data: NewPasswordForm) => {
    if (!email || !otp) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.resetPasswordWithOTP(email, otp, data.password, data.confirmPassword);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.push('/auth/signin');
  };

  // Navbar component for the new password page
  function Navbar() {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-20 py-5 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-1 md:space-x-2">
              <Image src="/logo.png" alt="XEQUTIVE CARS" width={120} height={40} className="w-30 h-12 md:w-32 md:h-14" />
            </Link>
          </div>
          <AuthAwareNavigation />
        </div>
      </header>
    );
  }

  // Password strength indicator based on backend requirements
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '', requirements: [] };
    
    const requirements = [
      { test: password.length >= 8 && password.length <= 128, label: '8-128 characters' },
      { test: /[a-z]/.test(password), label: 'Lowercase letter' },
      { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
      { test: /[0-9]/.test(password), label: 'Number' },
    ];
    
    const passedRequirements = requirements.filter(req => req.test).length;
    const totalRequirements = requirements.length;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-red-600', 'bg-green-500'];
    
    return {
      strength: passedRequirements,
      label: labels[passedRequirements - 1] || '',
      color: colors[passedRequirements - 1] || 'bg-gray-300',
      requirements,
      passedRequirements,
      totalRequirements
    };
  };

  const passwordStrength = getPasswordStrength(password || '');

  if (!email || !otp) {
    return null; // Will redirect in useEffect
  }

  if (success) {
    return (
      <AuthPageProtection>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
            <Card className="w-full max-w-lg mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
                <CardDescription className="text-base">
                  Your password has been successfully reset. You can now sign in with your new password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password updated for <strong>{email}</strong>
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleGoToSignIn}
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                >
                  Continue to Sign In
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </AuthPageProtection>
    );
  }

  return (
    <AuthPageProtection>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
          <Card className="w-full max-w-lg mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
              <CardDescription className="text-base">
                Enter your new password below. Make sure it's strong and secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-semibold">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      {...register('password')}
                      className={`h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-base ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${((passwordStrength.passedRequirements || 0) / (passwordStrength.totalRequirements || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {passwordStrength.label} ({(passwordStrength.passedRequirements || 0)}/{(passwordStrength.totalRequirements || 0)})
                        </span>
                      </div>
                      
                      {/* Password requirements checklist */}
                      <div className="space-y-1">
                        {passwordStrength.requirements.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              req.test ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              {req.test && (
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={req.test ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-semibold">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      {...register('confirmPassword')}
                      className={`h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-3">
              <div className="text-sm text-center">
                Remember your password?{' '}
                <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </AuthPageProtection>
  );
}
