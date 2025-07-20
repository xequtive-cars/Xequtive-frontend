"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Phone, Clock } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function ContactPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Contact" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get in touch with our team
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">+44 78 3105 4649</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">info@xequtive.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Support Hours</h3>
                <p className="text-muted-foreground">24/7 Customer Support</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Help</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Need assistance with your booking or have questions about our services? 
              Our customer support team is here to help you 24/7.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/help">Help Center</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/new-booking">Book Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 