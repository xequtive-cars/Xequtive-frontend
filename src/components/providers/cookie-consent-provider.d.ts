import { ReactNode } from "react";
import { CookieConsentPreferences } from "@/components/CookieConsent";
interface CookieConsentContextType {
    consented: boolean | null;
    preferences: CookieConsentPreferences;
    acceptCookies: (prefs: CookieConsentPreferences) => void;
    rejectCookies: () => void;
    resetConsent: () => void;
}
export declare function CookieConsentProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useCookieConsentContext(): CookieConsentContextType;
export default CookieConsentProvider;
