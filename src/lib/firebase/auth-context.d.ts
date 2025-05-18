import { ReactNode } from "react";
import { auth } from "./config";
interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    role?: string;
    phoneNumber?: string;
    photoURL?: string;
    authProvider?: string;
}
interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useAuth(): AuthContextType;
export { auth };
