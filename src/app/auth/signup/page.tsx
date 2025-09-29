"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ChevronLeft, Mail } from "lucide-react";
import Link from "next/link";
import { StepProgressBar } from "@/components/auth/StepProgressBar";
import { AuthPageProtection } from "@/components/auth/AuthPageProtection";
import { AuthAwareNavigation } from "@/components/auth/AuthAwareNavigation";

// Step 1: Email form schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Step 2: Password form schema
const credentialsSchema = z
  .object({
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

type EmailFormData = z.infer<typeof emailSchema>;
type CredentialsFormData = z.infer<typeof credentialsSchema>;

// Define the steps of the signup process (now only 2 steps)
type SignupStep = "email" | "credentials";

// Fix type issues with CustomEvent
type StepChangeEvent = CustomEvent<{ step: SignupStep }>;

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
    (searchParams.get('step') as SignupStep) || "email"
  );
  const prevStepRef = useRef<SignupStep>("email");
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
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: formData.email,
    },
  });

  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  // Handle email step submission
  const onEmailSubmit = async (data: EmailFormData) => {
    setError(null);

    // Update the form data with the email
    setFormData(prev => ({
      ...prev,
      email: data.email,
    }));

    // Move to the credentials step
    setCurrentStep("credentials");
    onStepChange("credentials");
  };

  // Handle credentials step submission (final step)
  const onCredentialsSubmit = async (data: CredentialsFormData) => {
    setError(null);
    setIsLoading(true);

    // Update form data with credentials
    const completeFormData = {
      ...formData,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    try {
      // Register user with email and password only (no name or phone required)
      const result = await authService.register(
        "", // Empty fullName - will be collected later
        completeFormData.email,
        completeFormData.password,
        completeFormData.confirmPassword,
        "" // Empty phoneNumber - will be collected later
      );

      if (result.success) {
        onComplete();
        window.location.href = "/dashboard";
      } else {
        setError(result.error?.message || "Sign up failed");
        }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
    <Card className="w-full max-w-sm mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1 pb-2 px-4 pt-4">
        <CardTitle className="text-xl font-bold text-center">
          {currentStep === "email" && "Create your account"}
          {currentStep === "credentials" && "Set your password"}
        </CardTitle>
        <CardDescription className="text-center text-sm">
          {currentStep === "email" && "Enter your email to get started"}
          {currentStep === "credentials" && "Create a secure password for your account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="relative">
          <FormTransition
            isActive={currentStep === "email"}
            direction="forward"
            animationKey="email-step"
          >
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-semibold">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            className="h-10 pl-3 pr-10 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-sm"
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                  className="w-full h-9 text-sm font-semibold"
                  disabled={emailForm.formState.isSubmitting}
                >
                  {emailForm.formState.isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </Form>
            {renderGoogleSignUp()}
          </FormTransition>

          <FormTransition
            isActive={currentStep === "credentials"}
            direction="forward"
            animationKey="credentials-step"
          >
            {/* Back button - top left */}
            <div className="flex justify-start mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2 h-8 text-xs font-medium"
                onClick={() => setCurrentStep("email")}
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </div>
            
            <Form {...credentialsForm}>
              <form
                onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
                className="space-y-4"
              >
                <div className="mb-2 text-sm flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{formData.email}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-5 px-2"
                    onClick={() => setCurrentStep("email")}
                  >
                    Change
                  </Button>
                </div>

                <FormField
                  control={credentialsForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-semibold">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="h-10 pl-3 pr-10 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-sm"
                          />
                          <div
                            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialsForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-semibold">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="h-10 pl-3 pr-10 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-sm"
                          />
                          <div
                            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                  className="w-full h-9 text-sm font-semibold"
                  disabled={credentialsForm.formState.isSubmitting || isLoading}
                >
                  {credentialsForm.formState.isSubmitting || isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>
          </FormTransition>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-3">
        <div className="text-xs text-center">
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
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="font-bold text-sm md:text-lg">X</span>
              </div>
              <span className="font-bold text-lg md:text-2xl tracking-tight text-primary">
                XEQ CARS
              </span>
              {/* <Image src="/xeq-logo.png" alt="XEQ CARS" width={120} height={120} /> */}
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
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
          <SignUpFormWithProgress />
        </main>
      </div>
    </AuthPageProtection>
  );
}

function SignUpFormWithProgress() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalSteps = 2;

  // Update progress when the form step changes
  useEffect(() => {
    const handleStepChange = (e: StepChangeEvent) => {
      const step = e.detail.step;
      if (step === "email") {
        setCurrentStep(1);
        setIsCompleted(false);
      } else if (step === "credentials") {
        setCurrentStep(2);
        setIsCompleted(false);
      }
    };

    const handleFormCompletion = () => {
      setIsCompleted(true);
    };

    // Create event listeners
    window.addEventListener("stepChange", handleStepChange as EventListener);
    window.addEventListener(
      "formComplete",
      handleFormCompletion as EventListener
    );

    return () => {
      window.removeEventListener(
        "stepChange",
        handleStepChange as EventListener
      );
      window.removeEventListener(
        "formComplete",
        handleFormCompletion as EventListener
      );
    };
  }, []);

  return (
    <>
      <StepProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        completed={isCompleted}
        className="-mt-0"
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
        <SignUpForm
          onStepChange={(step) => {
            // Dispatch a custom event when step changes
            window.dispatchEvent(
              new CustomEvent("stepChange", { detail: { step } })
            );
          }}
          onComplete={() => {
            // Dispatch a custom event when form is completed
            window.dispatchEvent(new Event("formComplete"));
          }}
        />
      </main>
    </>
  );
}
