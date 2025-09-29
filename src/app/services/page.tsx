"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plane, Building2, Calendar, Users } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function ServicesPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Services" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#8B0000]">Our Services</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Premium transportation solutions
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Airport Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Professional airport transfer services with meet & greet, 
              luggage assistance, and flexible waiting times.
            </p>
            <Button asChild>
              <Link href="/services/airport-transfers">Learn More</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Corporate Travel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Reliable corporate transportation solutions for business 
              meetings, events, and executive travel.
            </p>
            <Button asChild>
              <Link href="/services/corporate-travel">Learn More</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Transportation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Specialized transportation for events, weddings, 
              and group travel with luxury vehicle options.
            </p>
            <Button asChild>
              <Link href="/services/event-transportation">Learn More</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Travel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Comfortable and efficient group transportation 
              for large parties and corporate events.
            </p>
            <Button asChild>
              <Link href="/services/group-travel">Learn More</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 