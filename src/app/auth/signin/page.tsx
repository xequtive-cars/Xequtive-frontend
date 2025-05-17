"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Mail,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import PublicRoute from "@/components/auth/PublicRoute";
import { authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { StepProgressBar } from "@/components/auth/StepProgressBar";
import FormTransition from "@/components/auth/FormTransition";
import GoogleButton from "@/components/auth/GoogleButton";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Check for success message
  useEffect(() => {
    if (searchParams?.get("success") === "account_created") {
      setShowSuccess(true);
    }
  }, [searchParams]);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isAuthenticated) {
      // Use window.location for consistent auth redirection pattern
      window.location.href = "/dashboard";
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
      ...formData,
      password: data.password,
    };

    try {
      // Basic client-side validation before sending request
      if (
        !completeFormData.email.includes("@") ||
        !completeFormData.email.includes(".")
      ) {
        emailForm.setError("email", {
          type: "manual",
          message: "Please enter a valid email address",
        });
        setError("Please enter a valid email address");
        setIsLoading(false);
        setCurrentStep("email");
        onStepChange("email");
        return;
      }

      if (completeFormData.password.length < 1) {
        passwordForm.setError("password", {
          type: "manual",
          message: "Password is required",
        });
        setError("Password is required");
        setIsLoading(false);
        return;
      }

      // Network error handling
      try {
        const result = await authService.signIn(
          completeFormData.email,
          completeFormData.password
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
            AUTH_ERROR: "Authentication error. Please try signing in again.",
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

        // Check for return URL in the query string
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrl = searchParams.get("returnUrl");

        // Use window.location for a hard navigation instead of router.push
        // This ensures we reload the page and check auth status properly
        window.location.href = returnUrl || "/dashboard";

        // Complete the form before navigation
        onComplete();

        // Don't set isLoading to false since we're reloading the page
      } catch (networkError) {
        console.error("Network error during sign in:", networkError);
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage =
        "An unexpected error occurred. Please try again later.";
      if (error instanceof Error) {
        // Check for specific error types
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Server response error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
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
    <Card className="w-[110%] max-w-[28rem] mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center text-base">
          {currentStep === "email" && "Enter your email address to get started"}
          {currentStep === "password" && "Enter your password to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-7 pt-3">
        {showSuccess && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span>
              Account created successfully! Please sign in to continue.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
              {error.toLowerCase().includes("no account") && (
                <div className="mt-2">
                  <Link
                    href="/auth/signup"
                    className="text-primary font-medium hover:underline underline-offset-4"
                  >
                    Create an account
                  </Link>
                </div>
              )}
              {error.toLowerCase().includes("password") &&
                error.toLowerCase().includes("reset") && (
                  <div className="mt-2">
                    <Link
                      href="/auth/forgot-password"
                      className="text-primary font-medium hover:underline underline-offset-4"
                    >
                      Reset password
                    </Link>
                  </div>
                )}
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
                className="space-y-6"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold">
                        Email address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            {...field}
                            className="h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-2xl font-medium tracking-wider"
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <Mail className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
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
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex justify-between">
                        <FormLabel className="text-base font-semibold">
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
                            className="h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-2xl font-medium tracking-wider"
                          />
                          <div
                            className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                            ) : (
                              <Eye className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:flex-1 h-11 text-base font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={goBack}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1 h-11 text-base font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </FormTransition>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <div className="text-sm text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Create an account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SigninPage() {
  return (
    <PublicRoute>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="font-bold text-lg">X</span>
              </div>
              <span className="font-bold text-2xl tracking-tight">
                Xequtive
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <SignInFormWithProgress />
      </div>
    </PublicRoute>
  );
}

function SignInFormWithProgress() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalSteps = 2; // Email and password steps

  // Update progress when the step changes
  const handleStepChange = (step: SigninStep) => {
    if (step === "email") {
      setCurrentStep(1);
      setIsCompleted(false);
    } else if (step === "password") {
      setCurrentStep(2);
      setIsCompleted(false);
    }
  };

  // Handle form completion
  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <>
      <StepProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        completed={isCompleted}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          }
        >
          <SignInForm
            onStepChange={handleStepChange}
            onComplete={handleComplete}
          />
        </Suspense>
      </main>
    </>
  );
}
