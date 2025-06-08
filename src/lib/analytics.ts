// Utility file for Google Analytics tracking
import { CookieConsentPreferences } from "@/components/CookieConsent";
import { useState, useEffect } from "react";

// Define the Google Analytics window object
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Google Analytics Measurement ID - replace with your own in the environment variables
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === "undefined") return;

  // Add the Google Analytics script if it doesn't exist
  if (!document.getElementById("google-analytics")) {
    const script1 = document.createElement("script");
    script1.id = "google-analytics";
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.id = "google-analytics-config";
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname,
        cookie_flags: 'SameSite=None;Secure'
      });
    `;
    document.head.appendChild(script2);
  } else {
    // If the script exists, just re-initialize
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      cookie_flags: "SameSite=None;Secure",
    });
  }
};

// Remove Google Analytics
export const removeGA = () => {
  if (typeof window === "undefined") return;

  // Remove the Google Analytics scripts
  const script1 = document.getElementById("google-analytics");
  if (script1) script1.remove();

  const script2 = document.getElementById("google-analytics-config");
  if (script2) script2.remove();

  // Clear the dataLayer
  if (window.dataLayer) {
    window.dataLayer = [];
  }

  // Delete the gtag function
  if (window.gtag) {
    // Instead of deleting, set to a no-op function
    window.gtag = function () {
      /* no-op */
    };
    // Clear the dataLayer to prevent further tracking
    window.dataLayer = [];
  }

  // Clear GA cookies
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (
      cookie.startsWith("_ga") ||
      cookie.startsWith("_gid") ||
      cookie.startsWith("_gat")
    ) {
      document.cookie =
        cookie.split("=")[0] +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }
};

// Track page views
export const pageview = (url: string) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events
export const event = (action: string, params: Record<string, unknown>) => {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", action, params);
};

// Common events
export const ANALYTICS_EVENTS = {
  LOGIN: "login",
  SIGNUP: "sign_up",
  BOOKING_CREATED: "booking_created",
  BOOKING_CANCELLED: "booking_cancelled",
  FARE_ESTIMATE: "fare_estimate",
  CONTACT_FORM: "contact_form_submitted",
  PREFERENCES_UPDATED: "preferences_updated",
  VEHICLE_SELECTED: "vehicle_selected",
};

// Analytics tracking utility
export const analyticsUtils = {
  // Initialize tracking based on consent
  initTracking: (hasConsent: boolean) => {
    if (hasConsent) {
      initGA();
    } else {
      removeGA();
    }
  },

  // Track page view with custom URL
  trackPageView: (
    pathname: string, 
    searchParamsString?: string, 
    hasConsent: boolean = true
  ) => {
    if (!hasConsent) return;

    const url = pathname + 
      (searchParamsString ? `?${searchParamsString}` : "");
    
    pageview(url);
  },

  // Listen for consent changes
  setupConsentListener: (
    onConsentChange: (consentGiven: boolean) => void
  ) => {
    const handleAnalyticsConsent = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentPreferences>;
      const consentGiven = customEvent.detail.analytics;
      onConsentChange(consentGiven);
    };

    window.addEventListener(
      "cookie-consent-analytics",
      handleAnalyticsConsent as EventListener
    );

    // Return cleanup function
    return () => {
      window.removeEventListener(
        "cookie-consent-analytics",
        handleAnalyticsConsent as EventListener
      );
    };
  },

  // Expose events for external use
  events: ANALYTICS_EVENTS,
};

// New useAnalytics hook
export function useAnalytics(enabled: boolean = true) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  useEffect(() => {
    if (isEnabled) {
      initGA();
    } else {
      removeGA();
    }
  }, [isEnabled]);

  const trackEvent = (action: string, params: Record<string, unknown> = {}) => {
    if (isEnabled) {
      event(action, params);
    }
  };

  const trackPageView = (url: string) => {
    if (isEnabled) {
      pageview(url);
    }
  };

  return {
    trackEvent,
    trackPageView,
    setEnabled: setIsEnabled,
    isEnabled,
  };
}
