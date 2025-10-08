import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthLoadingProvider } from "@/contexts/AuthLoadingContext";
import ReduxProvider from "@/providers/redux-provider";
import { Toaster } from "@/components/ui/toaster";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { CookieConsentProvider } from "@/components/providers/cookie-consent-provider";
import { Toaster as SonnerToaster } from "sonner";
import { cn } from "@/lib/utils";
import CrispChatWrapper from "@/components/CrispChatWrapper";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XEQUTIVE CARS - Premium Car Service",
  description: "Luxury transportation services for executives",
};

// Force dynamic rendering to avoid React 19 SSR useContext bug
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Mapbox GL CSS is imported above */}
        {/* Google Translate Scripts */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script
          src="/translate.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.className
        )}
      >
        <AuthProvider>
          <AuthLoadingProvider>
          <ReduxProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <CookieConsentProvider>
                <AnalyticsProvider>
                  <CrispChatWrapper />
                  {/* Hidden Google Translate Element */}
                  <div id="google_translate_element" style={{ display: "none" }} />
                  {children}
                  <Toaster />
                  <SonnerToaster />
                </AnalyticsProvider>
              </CookieConsentProvider>
            </ThemeProvider>
          </ReduxProvider>
          </AuthLoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
