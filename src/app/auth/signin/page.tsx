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

      const result = await authService.signIn(data.email, data.password);

      if (!result.success) {
        setError(result.error?.message || "Failed to sign in");
        setIsLoading(false);
        return;
      }

      // Check for return URL in the query string
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get("returnUrl");

      // Navigate to the requested return URL or to the new booking page
      router.push(returnUrl ? returnUrl : "/dashboard/new-booking");
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in");
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
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
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
