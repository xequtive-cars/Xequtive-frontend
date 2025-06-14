"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  ChevronLeft,
  Loader2,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Loading3D, Loading3DOverlay } from "@/components/ui/loading-3d";
import { authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import FormTransition from "@/components/auth/FormTransition";
import GoogleButton from "@/components/auth/GoogleButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import PublicRoute from "@/components/auth/PublicRoute";
import { StepProgressBar } from "@/components/auth/StepProgressBar";
import { AuthAwareNavigation } from "@/components/auth/AuthAwareNavigation";

// Step 1: Email form schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Step 2: Password form schema
const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// Define the steps of the signin process
type SigninStep = "email" | "password";

// Skeleton loading component
function SignInSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loading3D size="md" message="Loading sign in..." showMessage={false} />
        </CardContent>
      </Card>
    </div>
  );
}

function SignInForm({
  onStepChange,
  onComplete,
}: {
  onStepChange: (step: SigninStep) => void;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<SigninStep>("email");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showLoading } = useAuthLoading();

  // Redirect authenticated users away from auth pages (but prevent loops)
  useEffect(() => {
    if (isAuthenticated) {
      // Check if we're already in a redirect process to prevent loops
      const searchParams = new URLSearchParams(window.location.search);
      const isRedirecting = searchParams.get("redirecting");
      
      if (!isRedirecting) {
        console.log("🔄 SignInForm - User already authenticated, redirecting to dashboard");
        // Use window.location for consistent auth redirection pattern
        window.location.href = "/dashboard";
      }
    }
  }, [isAuthenticated]);

  // Initialize forms for each step
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: formData.email,
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: formData.password,
    },
  });

  // Handle email step submission
  const onEmailSubmit = async (data: EmailFormData) => {
    setError(null);

    // Update the form data with the email
    setFormData({
      ...formData,
      email: data.email,
    });

    // Move to the next step
    setCurrentStep("password");
    onStepChange("password");
  };

  // Handle password step (final) submission
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError(null);

    // Update the form data with password
    const completeFormData = {
      email: formData.email,
      password: data.password,
    };

    try {
      // Prepare request body exactly as per documentation
      const requestBody = {
        email: completeFormData.email,
        password: completeFormData.password,
      };

        const result = await authService.signIn(
        requestBody.email,
        requestBody.password
        );

        if (!result.success) {
          let errorMessage = result.error?.message || "Failed to sign in";

          // Map API error codes to user-friendly messages
          const errorCodeMap: Record<string, string> = {
            INVALID_CREDENTIALS_LOGIN:
              "Email or password is incorrect. Please try again.",
            INVALID_LOGIN_CREDENTIALS:
              "Email or password is incorrect. Please try again.",
            USER_NOT_FOUND:
              "No account found with this email address. Please check your email or sign up.",
            INVALID_EMAIL: "The email address format is invalid.",
            INVALID_PASSWORD: "Incorrect password. Please try again.",
            TOO_MANY_REQUESTS:
              "Too many failed attempts. Please try again later or reset your password.",
            EMAIL_NOT_VERIFIED:
              "Your account needs verification. Please check your email for a verification link.",
            USER_DISABLED:
              "This account has been disabled. Please contact support for assistance.",
            EXPIRED_SESSION: "Your session has expired. Please sign in again.",
            INVALID_SESSION: "Your session is invalid. Please sign in again.",
          AUTH_ERROR: "Authentication error. Please sign in again.",
            NETWORK_ERROR:
              "Network error. Please check your internet connection and try again.",
            SERVER_ERROR:
              "Server error. Our services are temporarily unavailable. Please try again later.",
          };

          // Check for specific error codes first
          const errorCode = errorMessage.toUpperCase().replace(/[^A-Z_]/g, "_");

          if (errorCodeMap[errorCode]) {
            errorMessage = errorCodeMap[errorCode];

            // Set appropriate field errors based on the error code
            if (
              errorCode === "INVALID_LOGIN_CREDENTIALS" ||
              errorCode === "INVALID_CREDENTIALS_LOGIN" ||
              errorCode === "INVALID_PASSWORD"
            ) {
              passwordForm.setError("password", {
                type: "manual",
                message: "Incorrect password",
              });
            } else if (
              errorCode === "USER_NOT_FOUND" ||
              errorCode === "INVALID_EMAIL"
            ) {
              // Go back to email step
              setCurrentStep("email");
              onStepChange("email");
              emailForm.setError("email", {
                type: "manual",
                message:
                  errorCode === "USER_NOT_FOUND"
                    ? "Email not registered"
                    : "Invalid email format",
              });
            }
          }
          // If no exact match, try to match parts of the error message
          else if (
            errorMessage.toLowerCase().includes("invalid credentials") ||
            errorMessage.toLowerCase().includes("invalid login") ||
            errorMessage.toLowerCase().includes("incorrect password") ||
            errorMessage.toLowerCase().includes("invalid password")
          ) {
            errorMessage = "Email or password is incorrect. Please try again.";
            passwordForm.setError("password", {
              type: "manual",
              message: "Incorrect password",
            });
          } else if (
            errorMessage.toLowerCase().includes("user not found") ||
            errorMessage.toLowerCase().includes("no user") ||
            errorMessage.toLowerCase().includes("not registered") ||
            errorMessage.toLowerCase().includes("no account")
          ) {
            errorMessage =
              "No account found with this email address. Please check your email or sign up.";
            // Go back to email step
            setCurrentStep("email");
            onStepChange("email");
            emailForm.setError("email", {
              type: "manual",
              message: "Email not registered",
            });
          } else if (
            errorMessage.toLowerCase().includes("verification") ||
            errorMessage.toLowerCase().includes("verify") ||
            errorMessage.toLowerCase().includes("confirmed")
          ) {
            errorMessage =
              "Your account needs verification. Please check your email for a verification link.";
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Show unified loading state for redirect
        setIsRedirecting(true);
        showLoading("redirecting");
        
        // Complete the form
        onComplete();

        // Immediately trigger auth success event to update context
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth_success"));
        }

        // Check for return URL in the query string
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrl = searchParams.get("returnUrl");

        // Add a small delay to show the beautiful loading animation and let auth context update
        setTimeout(() => {
        // Use window.location for a hard navigation instead of router.push
        // This ensures we reload the page and check auth status properly
        window.location.href = returnUrl || "/dashboard";
        }, 800); // Reduced to 800ms for faster redirect
      } catch (networkError) {
        console.error("Network error during sign in:", networkError);
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
      setIsLoading(false);
    }
  };

  // Function to go back to previous step
  const goBack = () => {
    if (currentStep === "password") {
      setCurrentStep("email");
      onStepChange("email");
    }
  };

  // Helper function to render sign-in with Google button
  const renderGoogleSignIn = () => (
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
      <GoogleButton type="signin" />
    </div>
  );

  return (
    <>
    <Card className="w-full max-w-sm mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1 pb-2 px-4 pt-4">
        <CardTitle className="text-xl font-bold text-center">
          {currentStep === "email" ? "Sign in to your account" : "Enter your password"}
        </CardTitle>
        <CardDescription className="text-center text-sm">
          {currentStep === "email" && "Enter your email to continue"}
          {currentStep === "password" && "Verify your password to sign in"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

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
                        Email address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="name@example.com"
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

                <Button
                  type="submit"
                  className="w-full h-9 text-sm font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </Form>
            {renderGoogleSignIn()}
          </FormTransition>

          <FormTransition
            isActive={currentStep === "password"}
            direction="forward"
            animationKey="password-step"
          >
            {/* Back button - top left */}
            <div className="flex justify-start mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-2 h-8 text-xs font-medium"
                onClick={goBack}
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            </div>
            
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <div className="flex justify-between">
                        <FormLabel className="text-sm font-semibold">
                          Password
                        </FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-primary hover:underline underline-offset-4"
                        >
                          Forgot password?
                        </Link>
                      </div>
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

                <Button
                  type="submit"
                  className="w-full h-9 text-sm font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </FormTransition>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-3">
        <div className="text-xs text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
    </>
  );
}

function SignInFormWithProgress() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const totalSteps = 2;

  // Handle success parameter from URL
  useEffect(() => {
    const success = searchParams.get('success');
    if (success) {
      setSuccessMessage(success);
      console.log('Signin success:', success);
    }
  }, [searchParams]);

  // Update progress when the form step changes
  useEffect(() => {
    const handleStepChange = (e: CustomEvent<{ step: SigninStep }>) => {
      const step = e.detail.step;
      if (step === "email") {
        setCurrentStep(1);
        setIsCompleted(false);
      } else if (step === "password") {
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
        <SignInForm
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

export default function SigninPage({ 
  searchParams 
}: { 
  searchParams: { 
    success?: string 
  } 
}) {
  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <SignInFormWithProgress />
      </div>
    </PublicRoute>
  );
}
// Simplified navbar using the reusable AuthAwareNavigation component
function Navbar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-20 py-5 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="font-bold text-sm md:text-lg">X</span>
            </div>
            <span className="font-bold text-lg md:text-2xl tracking-tight">Xequtive</span>
          </Link>
        </div>
        <AuthAwareNavigation />
      </div>
    </header>
  );
}

