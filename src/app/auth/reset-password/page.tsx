'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, Mail, ArrowLeft, Shield } from 'lucide-react';
import { authService } from '@/lib/auth';
import { AuthPageProtection } from '@/components/auth/AuthPageProtection';
import { AuthAwareNavigation } from '@/components/auth/AuthAwareNavigation';
import { OTPInput } from '@/components/ui/otp-input';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type EmailForm = z.infer<typeof emailSchema>;
type OTPForm = z.infer<typeof otpSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);

  // Reset rate limit on component mount (for testing)
  useEffect(() => {
    setRateLimitTime(0);
  }, []);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<EmailForm | OTPForm>({
    resolver: zodResolver(otpSent ? otpSchema : emailSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  });

  const onSubmit = async (data: EmailForm | OTPForm) => {
    if (!otpSent) {
      // Send OTP
      setIsLoading(true);
      setError(null);

      try {
        const result = await authService.sendPasswordResetOTP(data.email);

        if (!result.success) {
          // Check for rate limiting error
          if (result.error?.message?.includes('Please wait')) {
            const waitTimeMatch = result.error.message.match(/(\d+)/);
            if (waitTimeMatch) {
              const waitTime = parseInt(waitTimeMatch[1]);
              setRateLimitTime(waitTime * 60); // Convert to seconds
              
              // Start countdown
              const interval = setInterval(() => {
                setRateLimitTime(prev => {
                  if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }
          }
          throw new Error(result.error?.message || 'Failed to send OTP');
        }

        setOtpSent(true);
      } catch (error) {
        console.error('Reset password error:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Verify OTP
      const otpData = data as OTPForm;
      if (!otpData.otp || otpData.otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }

      setIsVerifying(true);
      setError(null);

      try {
        const result = await authService.verifyPasswordResetOTP(otpData.email, otpData.otp);

        if (!result.success) {
          throw new Error(result.error?.message || 'Invalid OTP');
        }

        // OTP verified successfully, redirect to new password page
        router.push(`/auth/new-password?email=${encodeURIComponent(otpData.email)}&otp=${encodeURIComponent(otpData.otp)}`);
      } catch (error) {
        console.error('OTP verification error:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleOTPChange = (value: string) => {
    setOtpValue(value);
    setValue('otp', value);
  };

  const handleResendOTP = async () => {
    if (rateLimitTime > 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.sendPasswordResetOTP(getValues('email'));

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to resend OTP');
      }

      setOtpValue('');
      setValue('otp', '');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Navbar component for the reset password page
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


  return (
    <AuthPageProtection>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
          <Card className="w-full max-w-lg mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              {!otpSent ? (
                <>
                  <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                  <CardDescription className="text-base">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
                  <CardDescription className="text-base">
                    We've sent a 6-digit verification code to <strong>{getValues('email')}</strong>
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {rateLimitTime > 0 && (
                  <Alert>
                    <AlertDescription>
                      Please wait {Math.ceil(rateLimitTime / 60)} minutes before requesting another OTP
                    </AlertDescription>
                  </Alert>
                )}

                {otpSent && (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      OTP sent to <strong>{getValues('email')}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {!otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...register('email')}
                      className={`h-12 pl-4 pr-4 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-base ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                )}

                {otpSent && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Verification Code</Label>
                    <OTPInput
                      value={otpValue}
                      onChange={handleOTPChange}
                      disabled={isVerifying}
                      autoFocus
                    />
                    {(errors as any).otp && (
                      <p className="text-sm text-red-500">{(errors as any).otp.message}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                  disabled={isLoading || isVerifying || rateLimitTime > 0 || (otpSent && otpValue.length !== 6)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : rateLimitTime > 0 ? (
                    `Wait ${Math.ceil(rateLimitTime / 60)}m ${rateLimitTime % 60}s`
                  ) : otpSent ? (
                    'Verify Code'
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>

                {otpSent && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={rateLimitTime > 0 || isLoading}
                      className="text-sm"
                    >
                      {rateLimitTime > 0 ? (
                        `Resend in ${Math.ceil(rateLimitTime / 60)}m ${rateLimitTime % 60}s`
                      ) : (
                        'Resend Code'
                      )}
                    </Button>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-3">
              <div className="text-sm text-center">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </AuthPageProtection>
  );
}