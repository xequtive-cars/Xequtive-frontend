import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
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
  title: "Xequtive - Premium Car Service",
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
        {/* Add Mapbox GL CSS */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
          rel="stylesheet"
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
