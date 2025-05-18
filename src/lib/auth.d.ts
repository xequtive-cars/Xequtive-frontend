/**
 * Auth service for handling authentication with the API
 * Uses secure HTTP-only cookies for token storage (handled by the server)
 * The backend handles setting cookies with tokens automatically
 */
import { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
interface UserData {
    uid: string;
    email: string;
    displayName: string | null;
    role: string;
    phoneNumber: string;
}
interface AuthResponse {
    success: boolean;
    data?: {
        uid: string;
        email: string;
        displayName: string;
        role: string;
        token?: string;
        expiresIn?: string;
        phoneNumber: string;
    };
    error?: {
        message: string;
        details?: string;
    };
}
export declare const authService: {
    getToken: () => string | null;
    getUserData: () => Promise<UserData | null>;
    saveAuthData: (token: string, userData: UserData, expiresIn?: string) => void;
    clearAuthData: () => void;
    isAuthenticated: () => Promise<boolean>;
    shouldRefreshToken: () => boolean;
    handleAuthError: (status: number) => boolean;
    register(fullName: string, email: string, password: string, confirmPassword: string, phoneNumber?: string): Promise<AuthResponse>;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    onAuthStateChange: (callback: (user: User | null) => void) => () => void;
    getErrorMessage: (error: FirebaseError) => string;
    forgotPassword: (email: string) => Promise<AuthResponse>;
    resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<AuthResponse>;
    checkAuthStatus: () => Promise<UserData | null>;
    initiateGoogleAuth: () => void;
    exchangeCodeForSession: (code: string) => Promise<AuthResponse>;
    completeUserProfile: (fullName: string, phoneNumber: string) => Promise<AuthResponse>;
};
export {};
