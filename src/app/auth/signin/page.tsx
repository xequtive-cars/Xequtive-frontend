"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import PublicRoute from "@/components/auth/PublicRoute";
import { authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

// Form schema with validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isAuthenticated } = useAuth();

  // Check if redirected from registration
  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setShowSuccess(true);
    }
  }, [searchParams]);

  // Check if already authenticated - using auth context
  useEffect(() => {
    if (isAuthenticated) {
      // User is already authenticated, redirect to new booking page
      router.push("/dashboard/new-booking");
    }
  }, [isAuthenticated, router]);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (!data.email || !data.password) {
        setError("Email and password are required");
        setIsLoading(false);
        return;
      }

      // Basic client-side validation before sending request
      if (!data.email.includes("@") || !data.email.includes(".")) {
        form.setError("email", {
          type: "manual",
          message: "Please enter a valid email address",
        });
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (data.password.length < 1) {
        form.setError("password", {
          type: "manual",
          message: "Password is required",
        });
        setError("Password is required");
        setIsLoading(false);
        return;
      }

      // Network error handling
      try {
        const result = await authService.signIn(data.email, data.password);

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
          console.log("Original error:", errorMessage);
          console.log("Converted error code:", errorCode);

          if (errorCodeMap[errorCode]) {
            errorMessage = errorCodeMap[errorCode];

            // Set appropriate field errors based on the error code
            if (
              errorCode === "INVALID_LOGIN_CREDENTIALS" ||
              errorCode === "INVALID_CREDENTIALS_LOGIN" ||
              errorCode === "INVALID_PASSWORD"
            ) {
              form.setError("password", {
                type: "manual",
                message: "Incorrect password",
              });
            } else if (
              errorCode === "USER_NOT_FOUND" ||
              errorCode === "INVALID_EMAIL"
            ) {
              form.setError("email", {
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
            form.setError("password", {
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
            form.setError("email", {
              type: "manual",
              message: "Email not registered",
            });
          } else if (
            errorMessage.toLowerCase().includes("password") &&
            (errorMessage.toLowerCase().includes("wrong") ||
              errorMessage.toLowerCase().includes("incorrect") ||
              errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("mismatch"))
          ) {
            errorMessage =
              "Incorrect password. Please try again or reset your password.";
            form.setError("password", {
              type: "manual",
              message: "Incorrect password",
            });
          } else if (
            errorMessage.toLowerCase().includes("disabled") ||
            errorMessage.toLowerCase().includes("suspended") ||
            errorMessage.toLowerCase().includes("blocked")
          ) {
            errorMessage =
              "This account has been disabled. Please contact support for assistance.";
          } else if (
            errorMessage.toLowerCase().includes("too many") ||
            errorMessage.toLowerCase().includes("rate limit") ||
            errorMessage.toLowerCase().includes("try again later") ||
            errorMessage.toLowerCase().includes("temporary")
          ) {
            errorMessage =
              "Too many failed attempts. Please try again later or reset your password.";
          } else if (
            errorMessage.toLowerCase().includes("network") ||
            errorMessage.toLowerCase().includes("connection") ||
            errorMessage.toLowerCase().includes("offline") ||
            errorMessage.toLowerCase().includes("internet")
          ) {
            errorMessage =
              "Network error. Please check your internet connection and try again.";
          } else if (
            errorMessage.toLowerCase().includes("server") ||
            errorMessage.toLowerCase().includes("unavailable") ||
            errorMessage.toLowerCase().includes("maintenance") ||
            errorMessage.toLowerCase().includes("503") ||
            errorMessage.toLowerCase().includes("500")
          ) {
            errorMessage =
              "Server error. Our services are temporarily unavailable. Please try again later.";
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

        // Navigate to the requested return URL or to the new booking page
        router.push(returnUrl ? returnUrl : "/dashboard/new-booking");
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

  return (
    <Card className="w-full max-w-md mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        className="h-12 pl-4 rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex justify-between">
                    <FormLabel className="text-sm font-medium">
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
                        className="h-12 pl-4 pr-12 rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t p-6">
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

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
          </Suspense>
        </main>
      </div>
    </PublicRoute>
  );
}
