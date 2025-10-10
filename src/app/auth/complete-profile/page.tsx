"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLoading } from "@/contexts/AuthLoadingContext";
import { User, Phone, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import SimplePhoneInput from "@/components/ui/simple-phone-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Schema for profile completion form
const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function CompleteProfileForm() {
  const { user, completeProfile, checkAuthStatus } = useAuth();
  const { showLoading, hideLoading } = useAuthLoading();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to complete your profile");
      window.location.href = "/auth/signin";
    }
  }, [user]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    showLoading("loading-dashboard");

    try {
      const result = await completeProfile(data.fullName, data.phoneNumber);

      if (result.success) {
        toast.success("Profile completed successfully!");
        
        // Refresh user data
        await checkAuthStatus();
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setError(result.error || "Failed to complete profile");
        toast.error(result.error || "Failed to complete profile");
        hideLoading();
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
      hideLoading();
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription className="text-base">
              Please provide your name and phone number to complete your account setup
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Enter your full name"
                            className="pl-10 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number Field */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                          <SimplePhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter your phone number"
                            className="pl-10 h-11"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Completing Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Info Message */}
            <div className="text-center text-xs text-muted-foreground">
              <p>
                This information is required to complete your account setup and
                will be used for booking services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Navbar component for the complete profile page
function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center space-x-1 md:space-x-2">
              <Image src="/logo.png" alt="XEQUTIVE CARS" width={120} height={40} className="w-30 h-12 md:w-32 md:h-14" />
            </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <CompleteProfileForm />
      </main>
    </div>
  );
} 