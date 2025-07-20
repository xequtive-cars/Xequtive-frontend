"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, Phone, Mail, MessageCircle } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function HelpPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Help" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Find answers to common questions
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I make a booking?</h3>
              <p className="text-muted-foreground">
                You can make a booking through our website by selecting your pickup and dropoff locations, 
                choosing your preferred vehicle, and completing the booking form.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What is your cancellation policy?</h3>
              <p className="text-muted-foreground">
                Free cancellation up to 24 hours before your scheduled pickup time. 
                Cancellations within 24 hours may incur charges.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you provide meet & greet service?</h3>
              <p className="text-muted-foreground">
                Yes, we provide meet & greet service at all major airports including London Heathrow, 
                Gatwick, Luton & Stansted.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept major credit cards and digital payment methods. 
                All prices are inclusive of VAT where applicable.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-muted-foreground">+44 78 3105 4649</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-muted-foreground">support@xequtive.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-muted-foreground">Available 24/7 through our website</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard/new-booking">Make a Booking</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 