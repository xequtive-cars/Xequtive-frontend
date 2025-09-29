"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";

export default function CookiePolicyPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Legal", href: "/legal" },
        { label: "Cookie Policy" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience and allow certain features to work properly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Essential Cookies</h3>
              <p className="text-muted-foreground">
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance Cookies</h3>
              <p className="text-muted-foreground">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Functionality Cookies</h3>
              <p className="text-muted-foreground">
                These cookies allow the website to remember choices you make and provide enhanced, more personal features.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Session Cookies</h3>
              <p className="text-muted-foreground">
                Temporary cookies that are deleted when you close your browser. They help maintain your session while using our services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Persistent Cookies</h3>
              <p className="text-muted-foreground">
                Cookies that remain on your device for a set period or until you delete them. They help us remember your preferences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Third-Party Cookies</h3>
              <p className="text-muted-foreground">
                Cookies set by third-party services we use, such as analytics and payment processors.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Browser Settings</h3>
              <p className="text-muted-foreground">
                You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cookie Consent</h3>
              <p className="text-muted-foreground">
                When you first visit our website, you'll see a cookie consent banner where you can choose which cookies to accept.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Opting Out</h3>
              <p className="text-muted-foreground">
                You can opt out of non-essential cookies at any time through our cookie settings or your browser preferences.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact of Disabling Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              If you choose to disable cookies, some features of our website may not function properly. 
              This could affect your ability to make bookings or access certain services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-muted-foreground">
                We use analytics services to understand how our website is used and improve our services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Processing</h3>
              <p className="text-muted-foreground">
                Our payment processors may use cookies to ensure secure transactions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Customer Support</h3>
              <p className="text-muted-foreground">
                Our customer support tools may use cookies to provide better service.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Email: info@xeqcars.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 