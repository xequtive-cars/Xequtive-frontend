"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { Loading3D } from "@/components/ui/loading-3d";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import FormTransition from "@/components/auth/FormTransition";
import GoogleButton from "@/components/auth/GoogleButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, Mail, Shield } from "lucide-react";
import { AuthPageProtection } from "@/components/auth/AuthPageProtection";
import { AuthAwareNavigation } from "@/components/auth/AuthAwareNavigation";
import { OTPInput } from '@/components/ui/otp-input';

// Step 1: Combined email and password form schema
const credentialsSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Step 2: Email verification schema
const verificationSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

// Define the steps of the signup process (now 2 steps)
type SignupStep = "credentials" | "verification";

function SignUpForm({
  onStepChange,
  onComplete,
}: {
  onStepChange: (step: SignupStep) => void;
  onComplete: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial state from query parameters
  const [currentStep, setCurrentStep] = useState<SignupStep>(
    (searchParams.get('step') as SignupStep) || "credentials"
  );
  const prevStepRef = useRef<SignupStep>("credentials");
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || "",
    password: searchParams.get('password') || "",
    confirmPassword: searchParams.get('confirmPassword') || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showLoading } = useAuthLoading();
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);

  // Update query parameters when form data or step changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Add current step
    params.set('step', currentStep);
    
    // Add form data to query parameters
    Object.entries(formData).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Update URL without triggering a page reload
    router.replace(`/auth/signup?${params.toString()}`, { scroll: false });
  }, [currentStep, formData, router]);

  // Notify parent about step changes
  useEffect(() => {
    onStepChange(currentStep);
    // Remember the previous step for animation direction
    prevStepRef.current = currentStep;
  }, [currentStep, onStepChange]);

  // No need for redirect logic here - middleware handles it

  // Initialize forms for each step
  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Handle credentials step submission - now requests email verification
  const onCredentialsSubmit = async (data: CredentialsFormData) => {
    setError(null);
    setIsLoading(true);

    // Update form data with credentials
    const completeFormData = {
      ...formData,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };
    setFormData(completeFormData);

    try {
      // Request email verification instead of creating account directly
      const result = await authService.requestEmailVerification(data.email);

      if (result.success) {
        // Move to verification step
        setCurrentStep("verification");
        onStepChange("verification");
      } else {
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
        setError(result.error?.message || "Failed to send verification code");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification step submission - creates account after verification
  const onVerificationSubmit = async (data: VerificationFormData) => {
    setError(null);
    setIsVerifying(true);

    try {
      // First verify the email code
      const verifyResult = await authService.verifyEmailCode(formData.email, data.otp);

      if (!verifyResult.success) {
        throw new Error(verifyResult.error?.message || "Invalid verification code");
      }

      // Now create the account
      const registerResult = await authService.register(
        "", // Empty fullName - will be collected later
        formData.email,
        formData.password,
        formData.confirmPassword,
        "" // Empty phoneNumber - will be collected later
      );

      if (registerResult.success) {
        onComplete();
        window.location.href = "/dashboard";
      } else {
        setError(registerResult.error?.message || "Account creation failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP change
  const handleOTPChange = (value: string) => {
    setOtpValue(value);
    verificationForm.setValue('otp', value);
  };

  // Handle resend verification code
  const handleResendVerification = async () => {
    if (rateLimitTime > 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.resendEmailVerification(formData.email);

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to resend verification code");
      }

      setOtpValue('');
      verificationForm.setValue('otp', '');
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Helper function to render sign-up with Google button
  const renderGoogleSignUp = () => (
    <div className="mt-4">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GoogleButton type="signup" />
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1 pb-0 px-4 pt-2">
        <CardTitle className="text-2xl font-bold text-center">
          {currentStep === "credentials" && "Create your account"}
          {currentStep === "verification" && "Verify your email"}
        </CardTitle>
        <CardDescription className="text-center text-base">
          {currentStep === "credentials" && "Enter your email and create a secure password"}
          {currentStep === "verification" && `We've sent a 6-digit verification code to ${formData.email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="relative">
          <FormTransition
            isActive={currentStep === "credentials"}
            direction="forward"
            animationKey="credentials-step"
          >
            <Form {...credentialsForm}>
              <form
                onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={credentialsForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            className="h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-xl"
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialsForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            className="h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-xl"
                          />
                          <div
                            className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                      
                      {/* Password strength indicator */}
                      {credentialsForm.watch('password') && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(credentialsForm.watch('password')).color}`}
                                style={{ width: `${((getPasswordStrength(credentialsForm.watch('password')).passedRequirements || 0) / (getPasswordStrength(credentialsForm.watch('password')).totalRequirements || 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {getPasswordStrength(credentialsForm.watch('password')).label} ({(getPasswordStrength(credentialsForm.watch('password')).passedRequirements || 0)}/{(getPasswordStrength(credentialsForm.watch('password')).totalRequirements || 0)})
                            </span>
                          </div>
                          
                          {/* Password requirements checklist */}
                          <div className="space-y-1">
                            {getPasswordStrength(credentialsForm.watch('password')).requirements.map((req, index) => (
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialsForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                            className="h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-xl"
                          />
                          <div
                            className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                            <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={credentialsForm.formState.isSubmitting || isLoading}
                >
                  {credentialsForm.formState.isSubmitting || isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </Form>
            {renderGoogleSignUp()}
          </FormTransition>

          <FormTransition
            isActive={currentStep === "verification"}
            direction="forward"
            animationKey="verification-step"
          >
            <Form {...verificationForm}>
              <form
                onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
                className="space-y-5"
              >
                <div className="mb-2 text-base flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base">{formData.email}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {rateLimitTime > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Please wait {Math.ceil(rateLimitTime / 60)} minutes before requesting another verification code</p>
                  </div>
                )}

                <div className="space-y-2">
                  <OTPInput
                    value={otpValue}
                    onChange={handleOTPChange}
                    disabled={isVerifying}
                    autoFocus
                  />
                  {verificationForm.formState.errors.otp && (
                    <p className="text-sm text-red-500">{verificationForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isVerifying || otpValue.length !== 6}
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendVerification}
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
              </form>
            </Form>
          </FormTransition>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-3">
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// Simplified navbar using the reusable AuthAwareNavigation component
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

export default function SignupPage() {
  return (
    <AuthPageProtection>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-0">
          <SignUpFormWithProgress />
        </main>
      </div>
    </AuthPageProtection>
  );
}

function SignUpFormWithProgress() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-0">
      <SignUpForm
        onStepChange={() => {}}
        onComplete={() => {}}
      />
    </main>
  );
}
