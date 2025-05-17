"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, User } from "lucide-react";
import SimplePhoneInput from "@/components/ui/simple-phone-input";
import { authService } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import PublicRoute from "@/components/auth/PublicRoute";

// Form schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .refine(
      (val) => /^\+44[0-9]{10}$/.test(val.replace(/\s/g, "")),
      "Please enter a valid UK mobile number starting with +44"
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type UserDataType = {
  uid: string;
  email: string;
  displayName: string | null;
  phoneNumber?: string;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userData, setUserData] = useState<UserDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "+44",
    },
  });

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.checkAuthStatus();

        if (!userData) {
          // Not authenticated
          router.push("/auth/signin");
          return;
        }

        // If user already has a phone number, redirect to dashboard
        if (userData.phoneNumber) {
          router.push("/dashboard");
          return;
        }

        // Set form default values
        form.setValue("fullName", userData.displayName || "");
        setUserData(userData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, form]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    setError(null);

    try {
      const response = await authService.completeUserProfile(
        data.fullName,
        data.phoneNumber
      );

      if (!response.success) {
        setError(response.error?.message || "Failed to update profile");
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error completing profile:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
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
          <Card className="w-[110%] max-w-[28rem] mx-auto border border-border/50 bg-background shadow-xl transition-all duration-300">
            <CardHeader className="space-y-2 pb-3">
              <CardTitle className="text-2xl font-bold text-center">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-center text-base">
                Please provide your phone number to complete your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="px-7 pb-7 pt-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Loading user profile...
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>{error}</p>
                      </div>
                    )}

                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-base font-semibold">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <SimplePhoneInput
                              {...field}
                              error={Boolean(form.formState.errors.phoneNumber)}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                          <p className="text-xs text-muted-foreground">
                            We&apos;ll use this number to verify your account
                            and for important notifications
                          </p>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Complete Profile"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <div className="text-sm text-center">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary font-medium hover:underline underline-offset-4"
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
