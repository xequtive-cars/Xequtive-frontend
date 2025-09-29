"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { AuthAwareNavigation } from "@/components/auth/AuthAwareNavigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
}

export default function PageLayout({ 
  children, 
  breadcrumbs = [], 
  showBreadcrumbs = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/" className="flex items-center space-x-1 md:space-x-2">
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="font-bold text-sm md:text-lg">X</span>
              </div>
              <span className="font-bold text-lg md:text-2xl tracking-tight text-primary">
                XEQ CARS
              </span>
            </Link>
          </div>
          <AuthAwareNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
              <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1" />
                  {item.href ? (
                    <Link 
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container py-12 md:py-16">
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center space-x-1 md:space-x-2">
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <span className="font-bold text-sm md:text-lg">X</span>
                </div>
                <span className="font-bold text-lg md:text-2xl tracking-tight text-primary">
                XEQUTIVE CARS
                </span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-5">XEQ CARS</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-5">Services</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/services/airport-transfers"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Airport Transfers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/corporate-travel"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Corporate Travel
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/event-transportation"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Event Transportation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-5">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/cookie-policy"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-5">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} XEQUTIVE CARS. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/legal/cookie-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 