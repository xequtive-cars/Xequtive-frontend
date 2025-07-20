"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Clock, Shield, Users, Luggage, Phone } from "lucide-react";
import Image from "next/image";
import PageLayout from "@/components/layout/PageLayout";

export default function AirportTransfersPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Services", href: "/services" },
        { label: "Airport Transfers" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#8B0000]">AIRPORT TRANSFERS</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Professional and reliable airport transfer services
        </p>
      </div>

      {/* Images Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <Image
            src="/images/airport-transfer/xeq-airport-transfer-1.jpg"
            alt="Airport Transfer Service"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <Image
            src="/images/airport-transfer/xeq-airport-transfer-2.jpg"
            alt="Professional Airport Transfer"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Professional Airport Transfer Service Includes:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Meet & Greet Service</h3>
                <p className="text-muted-foreground">
                  Available at all major airports including London Heathrow, Gatwick, Luton & Stansted
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Flexible Waiting Times</h3>
                <p className="text-muted-foreground">
                  30-minutes free waiting time included for all pick-ups (60-mins for Executive & VIP Class)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Luggage className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Luggage and Special Assistance</h3>
                <p className="text-muted-foreground">
                  Available upon request, with assistance up to check-in desks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Free Changes and Cancellation</h3>
                <p className="text-muted-foreground">
                  Anytime up to 24-hours before your trip
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">24/7 Support Team</h3>
                <p className="text-muted-foreground">
                  To connect you with your driver
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Advanced Return Bookings</h3>
                <p className="text-muted-foreground">
                  Option available (eligible for a 10% discount)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book Your Airport Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Experience the convenience and reliability of our professional airport transfer service. 
              Book your journey today and enjoy a stress-free travel experience.
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