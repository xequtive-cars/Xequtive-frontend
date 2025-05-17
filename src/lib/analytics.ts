"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CookieConsentPreferences } from "@/components/CookieConsent";

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

// Hook to initialize GA and track page views
export function useAnalytics(hasConsent: boolean = false) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize or remove GA based on consent
    if (hasConsent) {
      initGA();
    } else {
      removeGA();
    }

    // Return a cleanup function
    return () => {
      if (!hasConsent) {
        removeGA();
      }
    };
  }, [hasConsent]);

  // Track page views when the route changes
  useEffect(() => {
    if (!hasConsent || !pathname) return;

    // Wait for gtag to be ready
    const timeout = setTimeout(() => {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      pageview(url);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams, hasConsent]);

  // Listen for cookie consent changes
  useEffect(() => {
    const handleAnalyticsConsent = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentPreferences>;
      const consentGiven = customEvent.detail.analytics;

      if (consentGiven) {
        initGA();
        // Track the current page immediately
        const url =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        setTimeout(() => pageview(url), 300);
      } else {
        removeGA();
      }
    };

    window.addEventListener(
      "cookie-consent-analytics",
      handleAnalyticsConsent as EventListener
    );

    return () => {
      window.removeEventListener(
        "cookie-consent-analytics",
        handleAnalyticsConsent as EventListener
      );
    };
  }, [pathname, searchParams]);

  return {
    trackEvent: (action: string, params: Record<string, unknown>) => {
      if (hasConsent) {
        event(action, params);
      }
    },
    events: ANALYTICS_EVENTS,
  };
}
