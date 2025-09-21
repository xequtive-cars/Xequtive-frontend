import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: 'Terms of Service | Xequtive',
  description: 'Terms of Service for Xequtive luxury transportation services',
};

export default function TermsPage() {
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
              By accessing and using Xequtive's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Service Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Xequtive provides luxury transportation services including airport transfers, corporate travel, event transportation, and group travel services throughout the United Kingdom.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Airport transfers to and from major UK airports</li>
              <li>Corporate travel solutions</li>
              <li>Event transportation services</li>
              <li>Group travel arrangements</li>
              <li>Hourly booking services</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Booking and Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All bookings are subject to availability and confirmation. Payment terms are as follows:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Full payment is required at the time of booking for standard services</li>
              <li>Corporate accounts may be eligible for credit terms</li>
              <li>Cancellation policies vary by service type</li>
              <li>Refunds are processed within 5-10 business days</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Cancellation Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cancellation policies depend on the type of service booked:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Airport Transfers:</strong> Free cancellation up to 24 hours before scheduled pickup</li>
              <li><strong>Event Transportation:</strong> Free cancellation up to 48 hours before event</li>
              <li><strong>Hourly Bookings:</strong> Free cancellation up to 12 hours before scheduled start</li>
              <li><strong>Same-day bookings:</strong> 50% cancellation fee applies</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Xequtive's liability is limited to the cost of the service provided. We are not liable for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Delays due to traffic conditions or weather</li>
              <li>Missed flights or connections</li>
              <li>Personal belongings left in vehicles</li>
              <li>Indirect or consequential damages</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy. Please review our Privacy Policy for detailed information about how we collect, use, and protect your personal information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm"><strong>Email:</strong> legal@xequtive.com</p>
              <p className="text-sm"><strong>Phone:</strong> +44 20 1234 5678</p>
              <p className="text-sm"><strong>Address:</strong> 123 Luxury Lane, London, SW1A 1AA, United Kingdom</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Xequtive reserves the right to modify these terms at any time. Changes will be posted on this page and will become effective immediately upon posting. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
