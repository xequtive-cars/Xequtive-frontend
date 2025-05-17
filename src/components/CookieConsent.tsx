"use client";

import { useState, useEffect } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Cookie } from "lucide-react";

// Define types for cookie preferences
export interface CookieConsentPreferences {
  necessary: boolean; // Always true, required for basic functionality
  analytics: boolean; // For Google Analytics and similar tools
  marketing: boolean; // For marketing cookies (if used)
  preferences: boolean; // For preferences/functional cookies
}

const defaultPreferences: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

// Define the props for the CookieConsent component
interface CookieConsentProps {
  onAccept?: (preferences: CookieConsentPreferences) => void;
  onReject?: () => void;
}

// Custom hook for cookie consent
export function useCookieConsent() {
  const [consented, setConsented] = useState<boolean | null>(null);
  const [preferences, setPreferences] =
    useState<CookieConsentPreferences>(defaultPreferences);

  useEffect(() => {
    // Check if cookie preferences are already set
    const storedPreferences = localStorage.getItem("cookie-preferences");
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences(parsedPreferences);
        setConsented(true);
        // Dispatch events for any components that need to know about consent
        dispatchConsentEvents(parsedPreferences);
      } catch (error) {
        console.error("Error parsing stored cookie preferences:", error);
        setConsented(null);
      }
    } else {
      setConsented(null);
    }
  }, []);

  // Function to save preferences and update state
  const acceptCookies = (prefs: CookieConsentPreferences) => {
    localStorage.setItem("cookie-preferences", JSON.stringify(prefs));
    setPreferences(prefs);
    setConsented(true);
    dispatchConsentEvents(prefs);
  };

  // Function to reject all optional cookies
  const rejectCookies = () => {
    localStorage.setItem(
      "cookie-preferences",
      JSON.stringify(defaultPreferences)
    );
    setPreferences(defaultPreferences);
    setConsented(true);
    dispatchConsentEvents(defaultPreferences);
  };

  // Function to reset consent
  const resetConsent = () => {
    localStorage.removeItem("cookie-preferences");
    setPreferences(defaultPreferences);
    setConsented(null);
  };

  // Function to dispatch custom events for other components
  const dispatchConsentEvents = (prefs: CookieConsentPreferences) => {
    // Dispatch analytics consent event
    window.dispatchEvent(
      new CustomEvent("cookie-consent-analytics", { detail: prefs })
    );
    // Dispatch marketing consent event
    window.dispatchEvent(
      new CustomEvent("cookie-consent-marketing", { detail: prefs })
    );
    // Dispatch preferences consent event
    window.dispatchEvent(
      new CustomEvent("cookie-consent-preferences", { detail: prefs })
    );
  };

  return {
    consented,
    preferences,
    acceptCookies,
    rejectCookies,
    resetConsent,
  };
}

export default function CookieConsent({
  onAccept,
  onReject,
}: CookieConsentProps) {
  const [preferences, setPreferences] =
    useState<CookieConsentPreferences>(defaultPreferences);
  const [showDetails, setShowDetails] = useState(false);

  // Add stylesheet for mobile responsiveness
  useEffect(() => {
    // Add CSS for better mobile responsiveness
    const style = document.createElement("style");
    style.id = "cookie-consent-styles";
    style.innerHTML = `
      @media (max-width: 640px) {
        .cookie-buttons button {
          width: 100%;
          justify-content: center;
          padding: 0.625rem;
          margin-bottom: 0.5rem;
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      const existingStyle = document.getElementById("cookie-consent-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Function to accept all cookies
  const acceptAll = () => {
    const allAccepted: CookieConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    if (onAccept) {
      onAccept(allAccepted);
    }
  };

  // Function to accept only necessary cookies
  const acceptNecessary = () => {
    if (onReject) {
      onReject();
    }
  };

  // Function to save current preferences
  const saveCurrentPreferences = () => {
    if (onAccept) {
      onAccept(preferences);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up backdrop-blur-sm">
      <div className="p-4 mx-auto max-w-screen-xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                    <Cookie className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cookie Preferences
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We use cookies to enhance your browsing experience, serve
                  personalized content, and analyze our traffic.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 md:mt-0 cookie-buttons">
                <button
                  onClick={acceptNecessary}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
                >
                  Necessary Only
                </button>
                <button
                  onClick={acceptAll}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-offset-gray-800"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors focus:outline-none focus:underline"
                >
                  {showDetails ? "Hide Details" : "Customize"}
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 animate-fade-in">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                      <Checkbox.Root
                        id="necessary-cookies"
                        checked={preferences.necessary}
                        disabled={true}
                        className="h-5 w-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Checkbox.Indicator>
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div>
                        <label
                          htmlFor="necessary-cookies"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Necessary Cookies
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          These cookies are required for the website to function
                          and cannot be disabled.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded self-start sm:self-center">
                      Required
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                      <Checkbox.Root
                        id="analytics-cookies"
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            analytics: checked === true,
                          })
                        }
                        className="h-5 w-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Checkbox.Indicator>
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div>
                        <label
                          htmlFor="analytics-cookies"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Analytics Cookies
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          These cookies help us understand how visitors interact
                          with our website by collecting and reporting
                          information anonymously.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded self-start sm:self-center">
                      Optional
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                      <Checkbox.Root
                        id="preferences-cookies"
                        checked={preferences.preferences}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            preferences: checked === true,
                          })
                        }
                        className="h-5 w-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Checkbox.Indicator>
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div>
                        <label
                          htmlFor="preferences-cookies"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Preferences Cookies
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          These cookies enable personal features such as
                          remembering your preferences and settings.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded self-start sm:self-center">
                      Optional
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                      <Checkbox.Root
                        id="marketing-cookies"
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            marketing: checked === true,
                          })
                        }
                        className="h-5 w-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mr-3 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Checkbox.Indicator>
                          <Check className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div>
                        <label
                          htmlFor="marketing-cookies"
                          className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Marketing Cookies
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          These cookies are used to track visitors across
                          websites to enable more relevant advertisements.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded self-start sm:self-center">
                      Optional
                    </span>
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={saveCurrentPreferences}
                      className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-offset-gray-800"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
