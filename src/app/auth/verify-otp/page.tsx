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
import { Loader2, Shield, ArrowLeft, RotateCcw } from 'lucide-react';
import { authService } from '@/lib/auth';
import { AuthPageProtection } from '@/components/auth/AuthPageProtection';
import { AuthAwareNavigation } from '@/components/auth/AuthAwareNavigation';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OTPForm = z.infer<typeof otpSchema>;

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [otpStatus, setOtpStatus] = useState<{isVerified: boolean; message: string} | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch('otp');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/auth/reset-password');
    }
  }, [email, router]);

  // Check OTP status on component mount
  useEffect(() => {
    const checkOTPStatus = async () => {
      if (!email) return;
      
      try {
        const result = await authService.checkOTPStatus(email);
        if (result.success && result.data) {
          // Handle the response data properly
          const data = result.data as any;
          setOtpStatus({
            isVerified: data.isVerified || false,
            message: data.message || 'OTP status checked'
          });
        }
      } catch (error) {
        console.error('Error checking OTP status:', error);
      }
    };

    checkOTPStatus();
  }, [email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: OTPForm) => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.verifyPasswordResetOTP(email, data.otp);

      if (!result.success) {
        throw new Error(result.error?.message || 'Invalid OTP');
      }

      // OTP verified successfully, redirect to new password page
      router.push(`/auth/new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(data.otp)}`);
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    setError(null);

    try {
      const result = await authService.sendPasswordResetOTP(email);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to resend OTP');
      }

      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  // Auto-format OTP input
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('otp', value);
  };

  // Navbar component for the verify OTP page
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

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthPageProtection>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
          <Card className="w-full max-w-lg mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
              <CardDescription className="text-base">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {otpStatus && (
                  <Alert variant={otpStatus.isVerified ? "default" : "destructive"}>
                    <AlertDescription>{otpStatus.message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base font-semibold">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    {...register('otp')}
                    onChange={handleOTPChange}
                    className={`h-12 text-center text-2xl font-mono tracking-widest pl-4 pr-4 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all ${errors.otp ? 'border-red-500' : ''}`}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-500">{errors.otp.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                  disabled={isLoading || otpValue?.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-sm"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back to Email Input
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
