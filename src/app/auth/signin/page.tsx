"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { Loading3D } from "@/components/ui/loading-3d";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import GoogleButton from "@/components/auth/GoogleButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthPageProtection } from "@/components/auth/AuthPageProtection";
import { AuthAwareNavigation } from "@/components/auth/AuthAwareNavigation";

// Combined signin form schema
const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SigninFormData = z.infer<typeof signinSchema>;

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
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showLoading } = useAuthLoading();

  // No need for redirect logic here - middleware handles it

  // Initialize single form
  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare request body exactly as per documentation
      const requestBody = {
        email: data.email,
        password: data.password,
      };

        const result = await authService.signIn(
        requestBody.email,
        requestBody.password
        );

        if (!result.success) {
          let errorMessage = result.error?.message || "Sign in failed";
          
          // Handle specific error cases
          if (
            errorMessage.toLowerCase().includes("password") ||
            errorMessage.toLowerCase().includes("incorrect") ||
            errorMessage.toLowerCase().includes("wrong")
          ) {
            errorMessage = "Incorrect password. Please try again.";
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
        
        // Complete the form
        onComplete();

        // Immediately trigger auth success event to update context
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth_success"));
        }

        // Check for return URL in the query string
        const searchParams = new URLSearchParams(window.location.search);
        const returnUrl = searchParams.get("returnUrl");

        // Immediate redirect without loading state - middleware will handle protection
        window.location.href = returnUrl || "/dashboard";
      } catch (networkError) {
        console.error("Network error during sign in:", networkError);
        setError(
          "Unable to connect to our services. Please check your internet connection and try again."
        );
        setIsLoading(false);
      }
    };

  // Google sign in handler
  const handleGoogleSignIn = () => {
    // This will be handled by the GoogleButton component
  };

  // Render Google sign in section
  const renderGoogleSignIn = () => (
    <div className="mt-3">
      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground pb-0">
            Or continue with
          </span>
        </div>
      </div>
      <GoogleButton type="signin" />
    </div>
  );

  return (
    <>
    <Card className="w-full max-w-lg mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1 pb-2 px-4 pt-4">
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center text-base">
          Enter your email and password to continue
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
              control={form.control}
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
                  <div className="flex justify-end">
                    <Link
                      href="/auth/reset-password"
                      className="text-sm text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        {renderGoogleSignIn()}
      </CardContent>
      <CardFooter className="flex justify-center border-t p-3">
        <div className="text-sm text-center">
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

// Navbar component for the signin page
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

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { stage } = useAuthLoading();

  // Show loading skeleton while auth state is loading
  if (stage) {
    return <SignInSkeleton />;
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    const returnUrl = searchParams.get("returnUrl");
    router.push(returnUrl || "/dashboard");
    return <SignInSkeleton />;
  }

  // Handle form completion
  const handleComplete = () => {
    // This will be handled by the form submission
  };

  return (
    <AuthPageProtection>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-4">
          <SignInForm onComplete={handleComplete} />
        </main>
      </div>
    </AuthPageProtection>
  );
}