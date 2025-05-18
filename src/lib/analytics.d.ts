declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        dataLayer: unknown[];
    }
}
export declare const initGA: () => void;
export declare const removeGA: () => void;
export declare const pageview: (url: string) => void;
export declare const event: (action: string, params: Record<string, unknown>) => void;
export declare const ANALYTICS_EVENTS: {
    LOGIN: string;
    SIGNUP: string;
    BOOKING_CREATED: string;
    BOOKING_CANCELLED: string;
    FARE_ESTIMATE: string;
    CONTACT_FORM: string;
    PREFERENCES_UPDATED: string;
    VEHICLE_SELECTED: string;
};
export declare function useAnalytics(hasConsent?: boolean): {
    trackEvent: (action: string, params: Record<string, unknown>) => void;
    events: {
        LOGIN: string;
        SIGNUP: string;
        BOOKING_CREATED: string;
        BOOKING_CANCELLED: string;
        FARE_ESTIMATE: string;
        CONTACT_FORM: string;
        PREFERENCES_UPDATED: string;
        VEHICLE_SELECTED: string;
    };
};
