"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Car } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Welcome to Xequtive</h1>
          <p className="text-muted-foreground">
            Premium transportation at your service
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/new-booking">
            <Button size="lg" className="shadow-sm">
              Book a Ride
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active Bookings</TabsTrigger>
              <TabsTrigger value="history">Booking History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card className="border border-dashed border-muted-foreground/30">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 h-5 w-5" />
                    Active Bookings
                  </CardTitle>
                  <CardDescription>
                    Your upcoming and in-progress bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground text-lg">
                    No active bookings found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Book a ride to get started
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/new-booking" className="w-full">
                    <Button className="w-full">Book a Ride</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="border border-dashed border-muted-foreground/30">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Booking History
                  </CardTitle>
                  <CardDescription>
                    Your past bookings and trips
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground text-lg">
                    No booking history found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Book a ride to get started
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/new-booking" className="w-full">
                    <Button className="w-full">Book a Ride</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
