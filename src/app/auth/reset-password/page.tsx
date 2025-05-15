"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

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
import PublicRoute from "@/components/auth/PublicRoute";
import { authService } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define form schema with validation
const formSchema = z
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

type FormData = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Check token validity on component mount
  useEffect(() => {
    const validateToken = () => {
      if (!token) {
        setTokenError(
          "Missing reset token. Please use the link from your email."
        );
        return;
      }

      // This is a simplified token validation - in a real app, you'd verify the token on the server
      // Here we're just checking if it looks like a token (proper length and format)
      if (token.length < 20) {
        setTokenError(
          "Invalid reset token. Please request a new password reset link."
        );
        return;
      }

      setIsTokenValid(true);
    };

    validateToken();
  }, [token]);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    try {
      // Additional client-side validation
      if (data.password !== data.confirmPassword) {
        form.setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        setError("Passwords do not match. Please check both password fields.");
        setIsLoading(false);
        return;
      }

      try {
        // Use auth service to reset password
        const response = await authService.resetPassword(
          token,
          data.password,
          data.confirmPassword
        );

        if (!response.success) {
          // Format error message for display
          let errorMessage = response.error?.message || "Password reset failed";

          // Map API error codes to user-friendly messages
          const errorCodeMap: Record<string, string> = {
            INVALID_TOKEN:
              "The reset link is invalid or has expired. Please request a new password reset link.",
            EXPIRED_TOKEN:
              "The reset link has expired. Please request a new password reset link.",
            WEAK_PASSWORD:
              "Password is too weak. It must be at least 8 characters with uppercase, lowercase and numbers.",
            PASSWORD_MISMATCH:
              "Passwords do not match. Please check both password fields.",
            USER_NOT_FOUND:
              "User account not found. The reset link may be invalid.",
            USER_DISABLED:
              "This account has been disabled. Please contact support for assistance.",
            TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
            SERVER_ERROR:
              "Our services are temporarily unavailable. Please try again later.",
            NETWORK_ERROR:
              "Network error. Please check your internet connection and try again.",
          };

          // Check for specific error codes first
          const errorCode = errorMessage.toUpperCase().replace(/[^A-Z_]/g, "_");
          if (errorCodeMap[errorCode]) {
            errorMessage = errorCodeMap[errorCode];

            // Set form-specific errors based on the error code
            if (errorCode === "WEAK_PASSWORD") {
              form.setError("password", {
                type: "manual",
                message: "Password is too weak",
              });
            } else if (errorCode === "PASSWORD_MISMATCH") {
              form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match",
              });
            }
          }
          // If no exact match, try to match parts of the error message
          else if (
            errorMessage.toLowerCase().includes("token") &&
            (errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("expired") ||
              errorMessage.toLowerCase().includes("used"))
          ) {
            errorMessage =
              "The reset link is invalid or has expired. Please request a new password reset link.";
          } else if (errorMessage.toLowerCase().includes("password")) {
            if (errorMessage.toLowerCase().includes("weak")) {
              form.setError("password", {
                type: "manual",
                message:
                  "Password is too weak. It must be at least 8 characters with uppercase, lowercase and numbers.",
              });
            } else if (errorMessage.toLowerCase().includes("match")) {
              form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match",
              });
            } else {
              form.setError("password", {
                type: "manual",
                message: errorMessage,
              });
            }
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
            errorMessage.includes("500") ||
            errorMessage.includes("503")
          ) {
            errorMessage =
              "Our services are temporarily unavailable. Please try again later.";
          } else if (
            errorMessage.toLowerCase().includes("too many") ||
            errorMessage.toLowerCase().includes("rate limit") ||
            errorMessage.toLowerCase().includes("try again later")
          ) {
            errorMessage = "Too many requests. Please try again later.";
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Password reset was successful
        setSuccess(true);
        setSuccessMessage(
          "Your password has been reset successfully. You can now sign in with your new password."
        );
        form.reset();
      } catch (networkError) {
        console.error("Network error during password reset:", networkError);
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Password reset error:", err);

      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err instanceof Error) {
        // Check for specific error types
        if (err.message.includes("network") || err.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (err.message.includes("JSON")) {
          errorMessage = "Server response error. Please try again later.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    }

    setIsLoading(false);
  };

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
          <Card className="w-full max-w-md mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Create a new password for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tokenError ? (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{tokenError}</p>
                    <div className="mt-3">
                      <Link
                        href="/auth/forgot-password"
                        className="text-primary font-medium hover:underline underline-offset-4"
                      >
                        Request a new reset link
                      </Link>
                    </div>
                  </div>
                </div>
              ) : success ? (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <AlertDescription className="ml-2">
                    {successMessage}
                    <div className="mt-3">
                      <Link
                        href="/auth/signin"
                        className="text-primary font-medium hover:underline underline-offset-4"
                      >
                        Sign in now
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-medium">
                            New Password
                          </FormLabel>
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
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                          <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters with uppercase,
                            lowercase and numbers
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-sm font-medium">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="h-12 pl-4 pr-12 rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p>{error}</p>
                          {error.toLowerCase().includes("expired") && (
                            <div className="mt-2">
                              <Link
                                href="/auth/forgot-password"
                                className="text-primary font-medium hover:underline underline-offset-4"
                              >
                                Request a new reset link
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full rounded-lg py-6 mt-4 font-medium transition-all duration-300"
                      disabled={isLoading || !isTokenValid}
                    >
                      {isLoading ? "Resetting Password..." : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center">
              <div className="text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                Need a new reset link?{" "}
                <Link
                  href="/auth/forgot-password"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Request one
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </PublicRoute>
  );
}
