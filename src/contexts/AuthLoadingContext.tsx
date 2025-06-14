"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UnifiedAuthLoading } from "@/components/ui/loading-3d";

type AuthLoadingStage = "checking" | "redirecting" | "loading-dashboard" | "complete" | null;

interface AuthLoadingContextType {
  stage: AuthLoadingStage;
  setStage: (stage: AuthLoadingStage) => void;
  showLoading: (stage: AuthLoadingStage, duration?: number) => void;
  hideLoading: () => void;
}

const AuthLoadingContext = createContext<AuthLoadingContextType>({
  stage: null,
  setStage: () => {},
  showLoading: () => {},
  hideLoading: () => {},
});

export function AuthLoadingProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<AuthLoadingStage>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showLoading = (newStage: AuthLoadingStage, duration?: number) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    setStage(newStage);

    // Auto-hide after duration if specified
    if (duration && newStage) {
      const id = setTimeout(() => {
        setStage(null);
        setTimeoutId(null);
      }, duration);
      setTimeoutId(id);
    }
  };

  const hideLoading = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setStage(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <AuthLoadingContext.Provider value={{ stage, setStage, showLoading, hideLoading }}>
      {children}
      {stage && <UnifiedAuthLoading stage={stage} />}
    </AuthLoadingContext.Provider>
  );
}

export function useAuthLoading() {
  const context = useContext(AuthLoadingContext);
  if (!context) {
    throw new Error("useAuthLoading must be used within an AuthLoadingProvider");
  }
  return context;
} 