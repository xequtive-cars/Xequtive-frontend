"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Car, Shield, Clock } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

export default function CareersPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "Careers" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Careers</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Join our team of professionals
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Why Work With Us</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Professional Environment</h3>
                <p className="text-muted-foreground">Work in a professional and supportive environment.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Car className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Premium Fleet</h3>
                <p className="text-muted-foreground">Access to modern, well-maintained vehicles.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Safety First</h3>
                <p className="text-muted-foreground">Comprehensive safety training and support.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Flexible Hours</h3>
                <p className="text-muted-foreground">Flexible working arrangements available.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Openings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We're always looking for talented professionals to join our team. 
              Please contact us for current opportunities.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 