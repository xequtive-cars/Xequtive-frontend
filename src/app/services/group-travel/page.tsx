"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Car, Calendar, MapPin, Clock } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function GroupTravelPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Services", href: "/services" },
        { label: "Group Travel" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Group Travel</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Comfortable and efficient group transportation
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Group Transportation Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Large Groups</h3>
                <p className="text-muted-foreground">
                  Comfortable transportation for large parties, corporate events, and group tours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Car className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Multiple Vehicle Options</h3>
                <p className="text-muted-foreground">
                  Choose from various vehicle types to accommodate different group sizes and requirements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Advance Planning</h3>
                <p className="text-muted-foreground">
                  Plan and book transportation up to 6-months in advance with block booking discounts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Flexible Routes</h3>
                <p className="text-muted-foreground">
                  Customized routes and multiple pickup/dropoff points for group convenience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Synchronized Timing</h3>
                <p className="text-muted-foreground">
                  Coordinated arrival times for all group members at your destination.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book Group Travel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Make your group travel seamless and comfortable. Contact us for personalized quotes 
              and group booking arrangements.
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