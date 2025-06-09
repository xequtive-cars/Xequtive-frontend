"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  User,
  ChevronLeft,
  Loader2,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

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
import { authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { StepProgressBar } from "@/components/auth/StepProgressBar";
import SimplePhoneInput from "@/components/ui/simple-phone-input";
import FormTransition from "@/components/auth/FormTransition";
import GoogleButton from "@/components/auth/GoogleButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import PublicRoute from "@/components/auth/PublicRoute";

// Step 1: Email form schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Step 2: Password and name form schema
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

// Step 3: Phone number and full name form schema
const phoneSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .refine(
      (val) => /^\+44[0-9]{10}$/.test(val.replace(/\s/g, "")),
      "Please enter a valid UK mobile number starting with +44"
    ),
});

type EmailFormData = z.infer<typeof emailSchema>;
type CredentialsFormData = z.infer<typeof credentialsSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

// Define the steps of the signup process
type SignupStep = "email" | "credentials" | "phone";

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
    fullName: searchParams.get('fullName') || "",
    password: searchParams.get('password') || "",
    confirmPassword: searchParams.get('confirmPassword') || "",
    phoneNumber: searchParams.get('phoneNumber') || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated } = useAuth();

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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
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

  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
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

    // Move to the next step
    setCurrentStep("credentials");
  };

  // Handle credentials step submission
  const onCredentialsSubmit = async (data: CredentialsFormData) => {
    setError(null);

    // Update the form data with credentials
    setFormData(prev => ({
      ...prev,
      password: data.password,
      confirmPassword: data.confirmPassword,
    }));

    // Move to the next step
    setCurrentStep("phone");
  };

  // Handle phone step (final) submission
  const onPhoneSubmit = async (data: PhoneFormData) => {
    setError(null);

    // Update the form data with phone details
    setFormData(prev => ({
      ...prev,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
    }));

    try {
      // Use auth service to register
      const response = await authService.register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.phoneNumber
      );

      if (!response.success) {
        // Format error message for display
        let errorMessage = response.error?.message || "Registration failed";

        // Map API error codes to user-friendly messages
        const errorCodeMap: Record<string, string> = {
          EMAIL_ALREADY_EXISTS:
            "This email address is already registered. Please use a different email or try signing in.",
          EMAIL_ALREADY_IN_USE:
            "This email address is already registered. Please use a different email or try signing in.",
          FAILED_TO_CREATE_USER:
            "This email address is already registered. Please use a different email or try signing in.",
          USER_CREATION_FAILED:
            "This email address is already registered. Please use a different email or try signing in.",
          EMAIL_EXISTS:
            "This email address is already registered. Please use a different email or try signing in.",
          DUPLICATE_USER:
            "This email address is already registered. Please use a different email or try signing in.",
          INVALID_EMAIL: "Please enter a valid email address.",
          WEAK_PASSWORD:
            "Password is too weak. It must be at least 8 characters with uppercase, lowercase and numbers.",
          PASSWORD_MISMATCH:
            "Passwords do not match. Please check both password fields.",
          INVALID_PHONE_NUMBER:
            "The phone number format is invalid. Please enter a valid UK mobile number.",
          MISSING_REQUIRED_FIELD: "Please fill in all required fields.",
          TOO_MANY_REQUESTS:
            "Too many registration attempts. Please try again later.",
        };

        // Check for specific error codes first
        const errorCode = errorMessage.toUpperCase().replace(/[^A-Z_]/g, "_");

        if (errorCodeMap[errorCode]) {
          errorMessage = errorCodeMap[errorCode];

          // If error is related to email, go back to email step
          if (errorCode.includes("EMAIL")) {
            setCurrentStep("email");
          }
          // If error is related to password, go back to credentials step
          else if (errorCode.includes("PASSWORD")) {
            setCurrentStep("credentials");
          }
          // If error is related to phone, stay on phone step
          else if (errorCode.includes("PHONE")) {
            // Stay on current step
          }
        }
        // Pattern matching for common error messages
        else if (
          errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("already") ||
            errorMessage.toLowerCase().includes("exists") ||
            errorMessage.toLowerCase().includes("in use"))
        ) {
          errorMessage =
            "This email address is already registered. Please use a different email or try signing in.";
          setCurrentStep("email");
        }
        // Other pattern matching logic from original code...

        setError(errorMessage);
        return;
      }

      // Form completed successfully
      onComplete();

      // Handle successful registration by navigating to dashboard
      window.location.href = "/dashboard";
    } catch (networkError) {
      console.error("Network error during registration:", networkError);
      setError(
        "Unable to connect to our services. Please check your internet connection and try again."
      );
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
    <Card className="w-[110%] max-w-[28rem] mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="text-2xl font-bold text-center">
          Create your account
        </CardTitle>
        <CardDescription className="text-center text-base">
          {currentStep === "email" && "Enter your email to get started"}
          {currentStep === "credentials" && "Create a secure password"}
          {currentStep === "phone" && "Verify your phone number"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pb-7 pt-3">
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
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            className="h-14 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-base font-medium tracking-wider"
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

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={emailForm.formState.isSubmitting}
                >
                  {emailForm.formState.isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
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
            direction={
              prevStepRef.current > currentStep ? "backward" : "forward"
            }
            animationKey="credentials-step"
          >
            <Form {...credentialsForm}>
              <form
                onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
                className="space-y-6"
              >
                <div className="mb-3 text-base flex justify-between items-center">
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.email}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-6 px-2"
                    onClick={() => setCurrentStep("email")}
                  >
                    Change
                  </Button>
                </div>

                <FormField
                  control={credentialsForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold">
                        Password
                      </FormLabel>
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

                <FormField
                  control={credentialsForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold">
                        Confirm Password
                      </FormLabel>
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

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:flex-1 h-11 text-base font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={() => setCurrentStep("email")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1 h-11 text-base font-semibold"
                    disabled={credentialsForm.formState.isSubmitting}
                  >
                    {credentialsForm.formState.isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </FormTransition>

          <FormTransition
            isActive={currentStep === "phone"}
            direction={
              prevStepRef.current > currentStep ? "backward" : "forward"
            }
            animationKey="phone-step"
          >
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                className="space-y-6"
              >
                <div className="mb-3 text-base">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{formData.email}</span>
                  </div>
                </div>

                <FormField
                  control={phoneForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="John Doe"
                            {...field}
                            className="h-12 pl-4 pr-12 rounded-lg border-border focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-2xl font-medium tracking-wider"
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-base font-semibold">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <SimplePhoneInput
                          {...field}
                          error={Boolean(
                            phoneForm.formState.errors.phoneNumber
                          )}
                          className="text-base md:text-2xl"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll use this number to confirm bookings
                      </p>
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:flex-1 h-11 text-base font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={() => setCurrentStep("credentials")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="sm:flex-1 h-11 text-base font-semibold"
                    disabled={phoneForm.formState.isSubmitting}
                  >
                    {phoneForm.formState.isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Create account"
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

// Add this function to render the navbar
function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-20 py-5 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="font-bold text-lg">X</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">Xequtive</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 md:h-9 px-2 md:px-3 rounded-md flex items-center gap-1 md:gap-2 shadow-premium"
                onClick={toggleDropdown}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="font-medium text-xs hidden md:block">
                  {user?.displayName || user?.email?.split("@")[0] || "Account"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-background border border-border z-50">
                  <div className="p-4 border-b border-border">
                    <p className="font-medium">{user?.displayName || "User"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Account Settings
                    </Link>
                    <button
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                      onClick={() => {
                        signOut();
                        setDropdownOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link href="/auth/signup">
                <Button
                  variant="default"
                  size="sm"
                  className="h-10 px-4 rounded-md"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function SignupPage() {
  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
          <SignUpFormWithProgress />
        </main>
      </div>
    </PublicRoute>
  );
}

function SignUpFormWithProgress() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalSteps = 3;

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
      } else if (step === "phone") {
        setCurrentStep(3);
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
