"use client";

import { useState } from "react";
import { useAnalyticsContext } from "@/components/providers/analytics-provider";
import { useCookieConsentContext } from "@/components/providers/cookie-consent-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AnalyticsExamplePage() {
  const { trackEvent, events } = useAnalyticsContext();
  const { consented, preferences, resetConsent } = useCookieConsentContext();
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const handleTrackEvent = (eventName: string) => {
    trackEvent(eventName, {
      source: "analytics_example_page",
      timestamp: new Date().toISOString(),
    });
    setLastEvent(eventName);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        Analytics and Cookie Consent Example
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cookie Consent Status</CardTitle>
            <CardDescription>Current cookie preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Consent Given:</span>
                <span>
                  {consented === true
                    ? "Yes"
                    : consented === false
                    ? "Partial"
                    : "No"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Necessary Cookies:</span>
                <span>{preferences.necessary ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Analytics Cookies:</span>
                <span>{preferences.analytics ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Marketing Cookies:</span>
                <span>{preferences.marketing ? "Enabled" : "Disabled"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Preferences Cookies:</span>
                <span>{preferences.preferences ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={resetConsent}>
              Reset Cookie Consent
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Events</CardTitle>
            <CardDescription>
              Send test events to Google Analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                {preferences.analytics
                  ? "Analytics enabled! Click buttons below to send test events."
                  : "Analytics is currently disabled. Enable Analytics in cookie preferences to send events."}
              </p>

              {lastEvent && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Last event sent:</p>
                  <code className="text-xs">{lastEvent}</code>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleTrackEvent(events.LOGIN)}
                  disabled={!preferences.analytics}
                >
                  Track Login
                </Button>
                <Button
                  onClick={() => handleTrackEvent(events.SIGNUP)}
                  disabled={!preferences.analytics}
                >
                  Track Signup
                </Button>
                <Button
                  onClick={() => handleTrackEvent(events.BOOKING_CREATED)}
                  disabled={!preferences.analytics}
                >
                  Track Booking
                </Button>
                <Button
                  onClick={() => handleTrackEvent(events.CONTACT_FORM)}
                  disabled={!preferences.analytics}
                >
                  Track Contact Form
                </Button>
                <Button
                  onClick={() => handleTrackEvent(events.FARE_ESTIMATE)}
                  disabled={!preferences.analytics}
                >
                  Track Fare Estimate
                </Button>
                <Button
                  onClick={() => handleTrackEvent(events.VEHICLE_SELECTED)}
                  disabled={!preferences.analytics}
                >
                  Track Vehicle Selection
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <p className="text-xs text-muted-foreground mb-2">
              Google Analytics events will only be sent if analytics cookies are
              enabled. Check your browser console to see network requests.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
