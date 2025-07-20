"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";

export default function PrivacyPolicyPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Legal", href: "/legal" },
        { label: "Privacy Policy" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as name, email address, phone number, 
                and payment information when you make a booking.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Information</h3>
              <p className="text-muted-foreground">
                We automatically collect certain information about your use of our services, including IP address, 
                browser type, and pages visited.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service Provision</h3>
              <p className="text-muted-foreground">
                To provide, maintain, and improve our transportation services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Communication</h3>
              <p className="text-muted-foreground">
                To send booking confirmations, updates, and customer support messages.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Legal Compliance</h3>
              <p className="text-muted-foreground">
                To comply with applicable laws, regulations, and legal processes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. 
              We may share information with service providers who assist us in operating our business and providing services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Access and Update</h3>
              <p className="text-muted-foreground">
                You have the right to access and update your personal information through your account settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Deletion</h3>
              <p className="text-muted-foreground">
                You may request deletion of your personal information, subject to certain legal obligations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Opt-out</h3>
              <p className="text-muted-foreground">
                You can opt-out of marketing communications by following the unsubscribe instructions in our emails.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your experience on our website. 
              You can control cookie settings through your browser preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. International Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Email: privacy@xequtive.com</p>
              <p className="text-sm">Phone: +44 78 3105 4649</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 