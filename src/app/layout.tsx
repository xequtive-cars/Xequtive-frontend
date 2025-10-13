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
import TawkToChat from "@/components/TawkToChat";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XEQUTIVE - Executive Car Service",
  description: "Airport Transfer & Executive Car Service",
  metadataBase: new URL('https://xeqcars.com'),
  openGraph: {
    title: "XEQUTIVE - Executive Car Service",
    description: "Airport Transfer & Executive Car Service",
    url: "https://xeqcars.com",
    siteName: "XEQUTIVE",
  },
  twitter: {
    card: "summary_large_image",
    title: "XEQUTIVE - Executive Car Service",
    description: "Airport Transfer & Executive Car Service",
  },
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
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
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
                  <TawkToChat />
                  {/* Hidden Google Translate Element */}
                  <div id="google_translate_element" style={{ display: "none" }} />
                  {children}
                  <Toaster />
                  <SonnerToaster 
                    theme="system"
                    className="toaster group"
                    toastOptions={{
                      classNames: {
                        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                        description: "group-[.toast]:text-muted-foreground",
                        actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                        cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                      },
                    }}
                  />
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
