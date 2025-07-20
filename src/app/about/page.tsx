"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";

export default function AboutPage() {
  return (
    <PageLayout
      breadcrumbs={[
        { label: "About Us" }
      ]}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Premium executive transportation services
        </p>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              XEQUTIVE is a premium transportation service dedicated to providing exceptional 
              travel experiences for executives, business professionals, and discerning travelers 
              across the United Kingdom.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              We strive to deliver reliable, comfortable, and professional transportation 
              services that exceed expectations, ensuring every journey is seamless and 
              memorable.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Professionalism</h3>
              <p className="text-muted-foreground">Maintaining the highest standards of service and conduct.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Reliability</h3>
              <p className="text-muted-foreground">Ensuring punctual and dependable transportation.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Excellence</h3>
              <p className="text-muted-foreground">Delivering superior quality in every aspect of our service.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 