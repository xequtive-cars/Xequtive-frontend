"use client";

import { createContext, useContext, ReactNode } from "react";
import CookieConsent, {
  CookieConsentPreferences,
  useCookieConsent,
} from "@/components/CookieConsent";

// Create a context type that matches our hook return type
interface CookieConsentContextType {
  consented: boolean | null;
  preferences: CookieConsentPreferences;
  acceptCookies: (prefs: CookieConsentPreferences) => void;
  rejectCookies: () => void;
  resetConsent: () => void;
}

// Create context with default values
const CookieConsentContext = createContext<CookieConsentContextType>({
  consented: null,
  preferences: {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  },
  acceptCookies: () => {},
  rejectCookies: () => {},
  resetConsent: () => {},
});

// Provider component
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // Use our custom cookie consent hook
  const cookieConsent = useCookieConsent();

  const handleAccept = (prefs: CookieConsentPreferences) => {
    cookieConsent.acceptCookies(prefs);
  };

  const handleReject = () => {
    cookieConsent.rejectCookies();
  };

  return (
    <CookieConsentContext.Provider value={cookieConsent}>
      {children}
      {cookieConsent.consented === null && (
        <CookieConsent onAccept={handleAccept} onReject={handleReject} />
      )}
    </CookieConsentContext.Provider>
  );
}

// Custom hook to use cookie consent
export function useCookieConsentContext() {
  return useContext(CookieConsentContext);
}

export default CookieConsentProvider;
