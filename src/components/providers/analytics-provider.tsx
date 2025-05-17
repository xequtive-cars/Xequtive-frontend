"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAnalytics, ANALYTICS_EVENTS } from "@/lib/analytics";
import { useCookieConsentContext } from "@/components/providers/cookie-consent-provider";

// Analytics context type
interface AnalyticsContextType {
  trackEvent: (eventName: string, params?: Record<string, unknown>) => void;
  events: typeof ANALYTICS_EVENTS;
}

// Create context with default values
const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  events: ANALYTICS_EVENTS,
});

// Analytics provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Get cookie consent preferences
  const { consented, preferences } = useCookieConsentContext();

  // Initialize analytics hook with consent status
  const analytics = useAnalytics(!!consented && preferences.analytics);

  // Wrapper function to track events
  const trackEvent = (
    eventName: string,
    params: Record<string, unknown> = {}
  ) => {
    if (consented && preferences.analytics) {
      analytics.trackEvent(eventName, params);
    }
  };

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        events: ANALYTICS_EVENTS,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook to use analytics context
export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}

export default AnalyticsProvider;
