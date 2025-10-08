"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Clock, Users, Shield, Car } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function CorporateTravelPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Services", href: "/services" },
        { label: "Corporate Travel" }
      ]}
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#8B0000]">Corporate Travel</h1>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Corporate Transportation Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Building2 className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Business Accounts</h3>
                <p className="text-muted-foreground">
                  Reliable executive transportation for regular business clients and corporations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Punctual Service</h3>
                <p className="text-muted-foreground">
                  Time-critical transportation with guaranteed punctuality for business appointments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Group Travel</h3>
                <p className="text-muted-foreground">
                  Efficient group transportation for corporate events and team travel.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Professional Standards</h3>
                <p className="text-muted-foreground">
                  Maintain your company's professional image with our premium service.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Car className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Executive Fleet</h3>
                <p className="text-muted-foreground">
                  Premium vehicles suitable for executive and business travel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* TODO CREATE BUSINESS ACCOUNT */}
        <Card>
          <CardHeader>
            <CardTitle>Book Corporate Travel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Ensure your business travel is professional, reliable, and comfortable. 
              Contact us for corporate account setup and bulk booking options.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard/new-booking">Book Now</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 