export interface CookieConsentPreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
}
interface CookieConsentProps {
    onAccept?: (preferences: CookieConsentPreferences) => void;
    onReject?: () => void;
}
export declare function useCookieConsent(): {
    consented: boolean | null;
    preferences: CookieConsentPreferences;
    acceptCookies: (prefs: CookieConsentPreferences) => void;
    rejectCookies: () => void;
    resetConsent: () => void;
};
export default function CookieConsent({ onAccept, onReject, }: CookieConsentProps): import("react").JSX.Element;
export {};
