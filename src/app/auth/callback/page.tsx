"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/env-validation";
import { Loading3DOverlay } from "@/components/ui/loading-3d";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

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

      // Notify UI of auth success
      window.dispatchEvent(new Event("auth_success"));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Auth callback error:", err);
      setError("Authentication failed. Please try again.");
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleAuthCode(code);
    } else {
      setError("No authorization code received");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <Loading3DOverlay />;
}
