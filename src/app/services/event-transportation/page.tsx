"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Car, Users, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import PageLayout from "@/components/layout/PageLayout";

export default function EventTransportationPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Services", href: "/services" },
        { label: "Event Transportation" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#8B0000]">EVENTS & GROUP TRANSPORTATION</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Flexible and customized booking options for events and special occasions
        </p>
      </div>

      {/* Images Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <Image
            src="/images/evens-&-groups-transportation/evens-&-groups-transportation-1.jpg"
            alt="Event Transportation Service"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <Image
            src="/images/evens-&-groups-transportation/evens-&-groups-transportation-2.jpg"
            alt="Group Transportation"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Event Transportation Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Calendar className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Flexible Booking Options</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We offer flexible and customized booking options for events, special occasions, 
                  city-transfers, day-trips, tours and large groups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Hourly Car Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Book car service by the hour (4 - 24 hours) with fixed hourly rates, 
                  unlimited stops and no additional waiting time charges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Car className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Luxury VIP & Prestige Vehicles</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Luxury VIP & Prestige vehicle options (with and without chauffeur) 
                  available for weddings and special events.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Large Group Planning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Plan and book transportation for large groups up to 6-months in advance 
                  with block booking discounts and multiple vehicle options.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Comfort for Long Journeys</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comfort vehicles and experienced drivers to cater for long-journeys, 
                  city-transfers, cruise terminals, day-trips and tours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfect For:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Weddings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Corporate Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Birthday Celebrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Anniversary Parties</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">City Tours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Day Trips</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Cruise Terminal Transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Group Travel</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book Your Event Transportation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Make your special event memorable with our professional transportation services. 
              Contact us to discuss your requirements and get a personalized quote.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/hourly-booking">Book Now</Link>
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