"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
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

        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </PublicRoute>
  );
}

function ForgotPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    try {
      // Additional client-side validation
      if (!data.email.includes("@") || !data.email.includes(".")) {
        form.setError("email", {
          type: "manual",
          message: "Please enter a valid email address",
        });
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      try {
        // Call the auth service to request password reset
        const response = await authService.forgotPassword(data.email);

        if (!response.success) {
          // Format error message for display
          let errorMessage =
            response.error?.message || "Password reset request failed";

          // Map API error codes to user-friendly messages
          const errorCodeMap: Record<string, string> = {
            EMAIL_NOT_FOUND:
              "No account found with this email address. Please check your email or sign up.",
            INVALID_EMAIL: "The email address format is invalid.",
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
          }
          // If no exact match, try to match parts of the error message
          else if (
            errorMessage.toLowerCase().includes("not found") ||
            errorMessage.toLowerCase().includes("no user") ||
            errorMessage.toLowerCase().includes("no account") ||
            errorMessage.toLowerCase().includes("does not exist")
          ) {
            errorMessage =
              "No account found with this email address. Please check your email or sign up.";
            form.setError("email", {
              type: "manual",
              message: "Email not registered",
            });
          } else if (
            errorMessage.toLowerCase().includes("invalid") &&
            errorMessage.toLowerCase().includes("email")
          ) {
            errorMessage = "Please enter a valid email address.";
            form.setError("email", {
              type: "manual",
              message: "Invalid email format",
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
            errorMessage = "Too many requests. Please try again later.";
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
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Request was successful
        setSuccess(true);
        setSuccessMessage(
          `Password reset link sent to ${data.email}. Please check your email inbox and follow the instructions to reset your password.`
        );
        form.reset();
      } catch (networkError) {
        console.error(
          "Network error during password reset request:",
          networkError
        );
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Password reset request error:", err);

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
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <AlertDescription className="ml-2">
                {successMessage}
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

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
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
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-lg py-6 mt-4 font-medium transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
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
    </main>
  );
}
