"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Clock, Shield, Heart, PawPrint } from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

export default function FAQPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "FAQ" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">FREQUENTLY ASKED QUESTIONS</h1>
      </div>

      {/* FAQ Content */}
      <div className="grid gap-6">
        {/* FAQ 1: Lost & Found */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              How can I report lost & found property?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Please fill in the contact form below and select 'Lost & Found'. Our team will respond within 24-hours.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ 2: Cancellation Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-orange-600" />
              What is your cancellation policy?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Free cancellation up to 24-hours. Cancellations under 24-hours may incur a charge as follows:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Less than 24-hours:</p>
                  <p className="text-muted-foreground">Standard booking cancellation fee (£8.50). Executive/VIP class (£12.50).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Less than 2-hours:</p>
                  <p className="text-muted-foreground">20% of total booking fee payable.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">No show/cancellation after driver has arrived:</p>
                  <p className="text-muted-foreground">Full amount payable (+ additional waiting time & parking fees where applicable).</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ 3: Wheelchair Accessible Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-green-600" />
              Do you provide Wheelchair Accessible Vehicles (WAVs) or assistance for disabled passengers?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Yes we can arrange a low vehicle, foldable wheelchair or even a fully Wheelchair Accessible Vehicle (WAV) upon special request.
            </p>
          </CardContent>
        </Card>

        {/* FAQ 4: Pet Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PawPrint className="h-6 w-6 text-purple-600" />
              Can I accompany a pet on my journey?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To help us accommodate your request please add a note on the 'special requests' section of the booking form.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact CTA */}
      <div className="mt-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our customer support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/help">Help Center</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
