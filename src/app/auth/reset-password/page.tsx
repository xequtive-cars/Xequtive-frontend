"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Skeleton loading component
function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}

// Client component for reset password
function ResetPasswordContent({ 
  token 
}: { 
  token: string | undefined 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validate token
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
      form.setError("password", {
        type: "manual",
        message: "Missing reset token. Please use the link from your email."
      });
      return;
    }

    setIsLoading(true);

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

        form.setError("password", {
          type: "manual",
          message: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Handle successful password reset
      form.reset();
      setIsLoading(false);
    } catch (err) {
      console.error("Password reset error:", err);
      form.setError("password", {
        type: "manual",
        message: err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage({ 
  searchParams 
}: { 
  searchParams: { 
    token?: string 
  } 
}) {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordContent token={searchParams.token} />
    </Suspense>
  );
}
