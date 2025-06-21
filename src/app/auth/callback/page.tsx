"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/env-validation";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setError(decodeURIComponent(error));
      setLoading(false);
      return;
    }

    if (code) {
      handleAuthCode(code);
    } else {
      setError("No authentication code provided");
      setLoading(false);
    }
  }, [searchParams]);

  const handleAuthCode = async (code: string) => {
      try {
      const apiUrl = getApiBaseUrl();
      
      // Exchange the temporary code for a session cookie
      const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Authentication failed");
      }

      const userData = data.data;
      setSuccess(true);
      
      // Dispatch auth success event for AuthContext
      window.dispatchEvent(new Event("auth_success"));

      // Redirect based on profile completion status
      setTimeout(() => {
        if (!userData.profileComplete) {
          // Profile needs to be completed
          router.push("/auth/complete-profile");
        } else {
          // Profile is complete, redirect to dashboard
          router.push("/dashboard");
        }
      }, 1000);

    } catch (error) {
      console.error("Error exchanging code for session:", error);
      setError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
      }
    };

  const handleRetry = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {loading && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
              {success && <CheckCircle className="w-8 h-8 text-green-600" />}
              {error && <AlertCircle className="w-8 h-8 text-red-600" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {loading && "Completing Authentication..."}
              {success && "Authentication Successful!"}
              {error && "Authentication Error"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading && (
              <div className="text-center text-muted-foreground">
                <p>Please wait while we complete your Google authentication...</p>
              </div>
            )}

            {success && (
              <div className="text-center text-muted-foreground">
                <p>You have been successfully signed in with Google.</p>
                <p className="mt-2">Redirecting you now...</p>
              </div>
            )}

            {error && (
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
                
                <Button
                  onClick={handleRetry}
                  className="w-full h-11 text-sm font-semibold"
              >
                Try Again
                </Button>
            </div>
            )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
