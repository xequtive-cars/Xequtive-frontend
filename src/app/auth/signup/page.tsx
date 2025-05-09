"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    password: z.string().min(6, "Password must be at least 6 characters"),
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

        // Check for common errors
        if (
          errorMessage.includes("already registered") ||
          errorMessage.includes("already in use") ||
          errorMessage.includes("already exists")
        ) {
          errorMessage =
            "This email address is already registered. Please use a different email or try signing in.";
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Registration successful - redirect to signin page
      window.location.href = "/auth/signin?registered=true";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                      {error}
                      {error.includes("already registered") && (
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
