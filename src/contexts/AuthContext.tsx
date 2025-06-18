"use client";

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { authService } from "@/lib/auth";

// User data type based on backend API documentation
interface User {
  uid: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  role: string;
  profileComplete: boolean;
  authProvider: "email" | "google";
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phoneNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  completeProfile: (fullName: string, phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  checkAuthStatus: async () => {},
  updateProfile: async () => ({ success: false }),
  completeProfile: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication status on component mount
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const userData = await authService.checkAuthStatus();
      
      if (userData) {
        setUser({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          profileComplete: !!(userData.displayName && userData.phoneNumber),
          authProvider: "email", // Default, can be updated based on backend response
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth status check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await authService.signIn(email, password);
      
             if (result.success && result.data) {
         const data = result.data;
         setUser({
           uid: data.uid,
           email: data.email,
           displayName: data.displayName,
           phoneNumber: data.phoneNumber,
           role: data.role,
           profileComplete: !!(data.displayName && data.phoneNumber),
           authProvider: "email",
         });
         return { success: true };
      } else {
        return { success: false, error: result.error?.message || "Sign in failed" };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string, phoneNumber?: string) => {
    try {
      setIsLoading(true);
      
      const result = await authService.register(
        fullName || "",
        email,
        password,
        password, // confirmPassword - same as password
        phoneNumber || ""
      );
      
             if (result.success && result.data) {
         const data = result.data;
         setUser({
           uid: data.uid,
           email: data.email,
           displayName: data.displayName,
           phoneNumber: data.phoneNumber,
           role: data.role,
           profileComplete: !!(data.displayName && data.phoneNumber),
           authProvider: "email",
         });
         return { success: true };
      } else {
        return { success: false, error: result.error?.message || "Sign up failed" };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      // Handle error silently
    }
  };

  // Update profile function
  const updateProfile = async (data: { fullName?: string; phoneNumber?: string }) => {
    try {
      const result = await authService.updateProfile(data);
      
             if (result.success && result.data) {
         const data = result.data;
         setUser(prevUser => prevUser ? {
           ...prevUser,
           displayName: data.displayName,
           phoneNumber: data.phoneNumber,
           profileComplete: !!(data.displayName && data.phoneNumber),
         } : null);
         return { success: true };
      } else {
        return { success: false, error: result.error?.message || "Profile update failed" };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };



  // Complete profile function (for OAuth users)
  const completeProfile = async (fullName: string, phoneNumber: string) => {
    try {
      const result = await authService.completeUserProfile(fullName, phoneNumber);
      
             if (result.success && result.data) {
         const data = result.data;
         setUser(prevUser => prevUser ? {
           ...prevUser,
           displayName: data.displayName,
           phoneNumber: data.phoneNumber,
           profileComplete: true,
         } : null);
         return { success: true };
      } else {
        return { success: false, error: result.error?.message || "Profile completion failed" };
      }
    } catch (error) {
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  // Initialize auth state on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for auth events (sign in, sign out, profile updates)
  useEffect(() => {
    const handleAuthSuccess = () => {
      checkAuthStatus();
    };

    const handleAuthSignout = () => {
      setUser(null);
    };

    const handleProfileUpdate = () => {
      checkAuthStatus();
    };

    const handleAuthError = () => {
      setUser(null);
    };

    // Add event listeners
    window.addEventListener("auth_success", handleAuthSuccess);
    window.addEventListener("auth_signout", handleAuthSignout);
    window.addEventListener("profile_updated", handleProfileUpdate);
    window.addEventListener("auth_error", handleAuthError);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("auth_success", handleAuthSuccess);
      window.removeEventListener("auth_signout", handleAuthSignout);
      window.removeEventListener("profile_updated", handleProfileUpdate);
      window.removeEventListener("auth_error", handleAuthError);
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    checkAuthStatus,
    updateProfile,
    completeProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 