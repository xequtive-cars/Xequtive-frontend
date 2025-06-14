"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { Loading3D, Loading3DOverlay } from "@/components/ui/loading-3d";

// Skeleton loading component
function AuthCallbackSkeleton() {
  return (
    <div className="flex min-h-screen bg-background flex-col items-center justify-center p-4">
      <Loading3D size="lg" message="Completing sign in..." />
    </div>
  );
}

// Client component for authentication callback
function AuthCallbackContent({ 
  searchParamsPromise 
}: { 
  searchParamsPromise: Promise<{ 
    code?: string, 
    error?: string 
  }>
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  // Use React.use() to unwrap the searchParams promise
  const searchParams = use(searchParamsPromise);

  useEffect(() => {
    const code = searchParams.code;
    const errorMsg = searchParams.error;

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
        // Always redirect to dashboard - missing profile info will be collected through booking form or profile page
        setTimeout(() => router.push("/dashboard"), 1000);
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
    <>
      {isProcessing && (
        <Loading3DOverlay message="Completing sign in..." />
      )}
      
    <div className="flex min-h-screen bg-background flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-md border border-border/30">
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-[200px]">
            {!isProcessing && error ? (
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
    </>
  );
}

// Server component with Suspense
export default function AuthCallbackPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    code?: string, 
    error?: string 
  }>
}) {
  return (
    <Suspense fallback={<AuthCallbackSkeleton />}>
      <AuthCallbackContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
