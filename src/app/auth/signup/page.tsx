"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle } from "lucide-react";

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
import { Eye, EyeOff } from "lucide-react";
import PublicRoute from "@/components/auth/PublicRoute";
import { authService } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

// Define form schema with validation
const formSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z
      .string()
      .regex(
        /^\+447[0-9]{9}$/,
        "Please enter a valid UK mobile number starting with +447 followed by 9 digits"
      ),
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

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated } = useAuth();

  // Check if user is already authenticated on mount
  useEffect(() => {
    if (isAuthenticated) {
      // User is already authenticated, redirect to dashboard
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Additional client-side validation
      if (!data.fullName.trim()) {
        form.setError("fullName", {
          type: "manual",
          message: "Full name is required",
        });
        setError("Please enter your full name");
        setIsLoading(false);
        return;
      }

      if (!data.email.includes("@") || !data.email.includes(".")) {
        form.setError("email", {
          type: "manual",
          message: "Please enter a valid email address",
        });
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

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
        // Use our authentication service to register
        const response = await authService.register(
          data.fullName,
          data.email,
          data.password,
          data.confirmPassword,
          data.phoneNumber
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
            SERVER_ERROR:
              "Our services are temporarily unavailable. Please try again later.",
            NETWORK_ERROR:
              "Network error. Please check your internet connection and try again.",
            VALIDATION_ERROR: "Please check your details and try again.",
            DUPLICATE_EMAIL:
              "This email address is already registered. Please use a different email or try signing in.",
            INVALID_NAME: "Please enter a valid full name.",
            INVALID_PHONE:
              "The phone number format is invalid. Please enter a valid UK mobile number.",
            REGISTRATION_FAILED:
              "Registration failed. The email address may already be in use.",
          };

          // Check for specific error codes first
          const errorCode = errorMessage.toUpperCase().replace(/[^A-Z_]/g, "_");
          console.log("Original registration error:", errorMessage);
          console.log("Converted registration error code:", errorCode);

          if (errorCodeMap[errorCode]) {
            errorMessage = errorCodeMap[errorCode];

            // Set form-specific errors based on the error code
            if (
              errorCode === "EMAIL_ALREADY_EXISTS" ||
              errorCode === "EMAIL_ALREADY_IN_USE" ||
              errorCode === "DUPLICATE_EMAIL" ||
              errorCode === "FAILED_TO_CREATE_USER" ||
              errorCode === "USER_CREATION_FAILED" ||
              errorCode === "EMAIL_EXISTS" ||
              errorCode === "DUPLICATE_USER" ||
              errorCode === "REGISTRATION_FAILED"
            ) {
              form.setError("email", {
                type: "manual",
                message: "Email already in use",
              });
            } else if (errorCode === "WEAK_PASSWORD") {
              form.setError("password", {
                type: "manual",
                message: "Password is too weak",
              });
            } else if (errorCode === "PASSWORD_MISMATCH") {
              form.setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match",
              });
            } else if (
              errorCode === "INVALID_PHONE_NUMBER" ||
              errorCode === "INVALID_PHONE"
            ) {
              form.setError("phoneNumber", {
                type: "manual",
                message: "Invalid phone number",
              });
            } else if (errorCode === "INVALID_NAME") {
              form.setError("fullName", {
                type: "manual",
                message: "Please enter a valid name",
              });
            } else if (errorCode === "INVALID_EMAIL") {
              form.setError("email", {
                type: "manual",
                message: "Please enter a valid email",
              });
            }
          }
          // If no exact match, try to match parts of the error message
          else if (
            errorMessage.toLowerCase().includes("email") &&
            (errorMessage.toLowerCase().includes("already registered") ||
              errorMessage.toLowerCase().includes("already in use") ||
              errorMessage.toLowerCase().includes("already exists"))
          ) {
            errorMessage =
              "This email address is already registered. Please use a different email or try signing in.";

            // Mark email field as invalid
            form.setError("email", {
              type: "manual",
              message: "Email already in use",
            });
          }
          // Handle "Failed to create user" which usually means duplicate email
          else if (
            errorMessage.toLowerCase().includes("failed to create user") ||
            (errorMessage.toLowerCase().includes("failed") &&
              errorMessage.toLowerCase().includes("user") &&
              errorMessage.toLowerCase().includes("create"))
          ) {
            errorMessage =
              "This email address is already registered. Please use a different email or try signing in.";
            form.setError("email", {
              type: "manual",
              message: "Email already in use",
            });
          }
          // Password-related errors
          else if (errorMessage.toLowerCase().includes("password")) {
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
          }
          // Phone number errors
          else if (
            errorMessage.toLowerCase().includes("phone") ||
            errorMessage.toLowerCase().includes("mobile") ||
            errorMessage.toLowerCase().includes("number")
          ) {
            form.setError("phoneNumber", {
              type: "manual",
              message: "Please enter a valid phone number",
            });
            errorMessage =
              "The phone number format is invalid. Please enter a valid UK mobile number.";
          }
          // Network or server errors
          else if (
            errorMessage.toLowerCase().includes("network") ||
            errorMessage.toLowerCase().includes("connection") ||
            errorMessage.toLowerCase().includes("offline")
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
          }
          // Validation errors
          else if (
            errorMessage.toLowerCase().includes("invalid") ||
            errorMessage.toLowerCase().includes("validation")
          ) {
            // Check what field might be invalid
            if (errorMessage.toLowerCase().includes("name")) {
              form.setError("fullName", {
                type: "manual",
                message: "Please enter a valid name",
              });
              errorMessage = "Please enter a valid full name.";
            } else if (errorMessage.toLowerCase().includes("email")) {
              form.setError("email", {
                type: "manual",
                message: "Please enter a valid email",
              });
              errorMessage = "Please enter a valid email address.";
            }
          }
          // Rate limiting
          else if (
            errorMessage.toLowerCase().includes("too many") ||
            errorMessage.toLowerCase().includes("rate limit") ||
            errorMessage.toLowerCase().includes("try again later")
          ) {
            errorMessage =
              "Too many registration attempts. Please try again later.";
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Registration successful - redirect to signin page
        window.location.href = "/auth/signin?registered=true";
      } catch (networkError) {
        console.error("Network error during registration:", networkError);
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Registration error:", err);

      let errorMessage =
        "An unexpected error occurred during registration. Please try again.";
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
      setIsLoading(false);
    }
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
                Create an account
              </CardTitle>
              <CardDescription className="text-center">
                Enter your details to create your Xequtive account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="John Doe"
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div
                            className={`relative flex h-12 rounded-lg overflow-hidden transition-all ${
                              form.formState.errors.phoneNumber
                                ? "ring-2 ring-destructive ring-offset-1"
                                : field.value && field.value.length > 3
                                ? /^\+44[0-9]{9,10}$/.test(
                                    field.value.replace(/-/g, "")
                                  )
                                  ? "ring-2 ring-green-500 ring-offset-1"
                                  : "ring-2 ring-destructive ring-offset-1"
                                : "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1"
                            }`}
                          >
                            <div className="flex items-center justify-center bg-muted px-3 border-r">
                              <span className="text-sm font-medium">+44</span>
                            </div>
                            <Input
                              type="tel"
                              {...field}
                              value={
                                field.value.startsWith("+44")
                                  ? field.value.substring(3)
                                  : field.value.startsWith("0")
                                  ? field.value.substring(1)
                                  : field.value
                              }
                              onChange={(e) => {
                                // Remove any non-digit characters
                                let value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );

                                // Limit to 10 digits total
                                if (value.length > 10) {
                                  value = value.substring(0, 10);
                                }

                                // Format with dashes for readability
                                if (value.length > 0) {
                                  if (value.length > 3) {
                                    value =
                                      value.substring(0, 3) +
                                      "-" +
                                      value.substring(3);
                                  }
                                  if (value.length > 7) {
                                    value =
                                      value.substring(0, 7) +
                                      "-" +
                                      value.substring(7);
                                  }
                                }

                                // Store with +44 prefix in the actual form data
                                const newValue =
                                  "+44" + value.replace(/-/g, "");
                                field.onChange(newValue);

                                // Force validation on every change to get immediate feedback
                                form.trigger("phoneNumber");
                              }}
                              className="flex-1 h-full border-none pl-3 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                              placeholder="Enter a UK number"
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          UK mobile numbers only
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">
                          Password
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
                        {error.toLowerCase().includes("already registered") && (
                          <div className="mt-2">
                            <Link
                              href="/auth/signin"
                              className="text-primary font-medium hover:underline underline-offset-4"
                            >
                              Go to Sign In
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full rounded-lg py-6 mt-4 font-medium transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                Forgot your password?{" "}
                <Link
                  href="/auth/forgot-password"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Reset password
                </Link>
              </div>
              <div className="text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                  href="#"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </PublicRoute>
  );
}
