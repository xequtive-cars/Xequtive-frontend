"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";

export default function TermsOfServicePage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Legal", href: "/legal" },
        { label: "Terms of Service" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using XEQUTIVE's transportation services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Service Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              XEQUTIVE provides premium transportation services including airport transfers, corporate travel, 
              event transportation, and group travel services across the United Kingdom.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Booking and Cancellation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Booking</h3>
              <p className="text-muted-foreground">
                All bookings must be made through our official channels. Confirmation will be provided via email or SMS.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cancellation Policy</h3>
              <p className="text-muted-foreground">
                Free cancellation up to 24 hours before the scheduled pickup time. 
                Cancellations within 24 hours may incur charges.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Payment Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Payment is required at the time of booking. We accept major credit cards and digital payment methods. 
              All prices are inclusive of VAT where applicable.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Passenger Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Behavior</h3>
              <p className="text-muted-foreground">
                Passengers must behave appropriately and respect our drivers and vehicles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Luggage</h3>
              <p className="text-muted-foreground">
                Passengers are responsible for their luggage and personal belongings.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              XEQUTIVE maintains appropriate insurance coverage. Our liability is limited to the extent permitted by law. 
              We are not responsible for delays caused by circumstances beyond our control.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy. Please refer to our Privacy Policy for details on how we collect, 
              use, and protect your personal information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Continued use of our services constitutes acceptance of the modified terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Email: legal@xequtive.com</p>
              <p className="text-sm">Phone: +44 78 3105 4649</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 