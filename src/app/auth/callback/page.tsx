"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams?.get("code");
    const errorMsg = searchParams?.get("error");

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      setIsProcessing(false);
      return;
    }

    if (!code) {
      setError("No authentication code provided");
      setIsProcessing(false);
      return;
    }

    const processAuthCode = async () => {
      try {
        // Exchange code for session
        const response = await authService.exchangeCodeForSession(code);

        if (!response.success) {
          setError(response.error?.message || "Authentication failed");
          setIsProcessing(false);
          return;
        }

        // Check if user needs to complete their profile
        const userData = response.data;
        if (userData && !userData.phoneNumber) {
          // Redirect to profile completion
          router.push("/auth/complete-profile");
        } else {
          // Redirect to dashboard
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error processing authentication callback:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to authenticate. Please try again."
        );
        setIsProcessing(false);
      }
    };

    processAuthCode();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen bg-background flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-md border border-border/30">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-[200px]">
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-medium">Completing sign in...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-destructive"
                >
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Authentication Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <button
                onClick={() => router.push("/auth/signin")}
                className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
