"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RefreshCw, Clock } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingCard from "@/components/booking/BookingCard";
import { useEffect, useState } from "react";
import {
  bookingService,
  GetUserBookingsResponse,
} from "@/utils/services/booking-service";
import { useToast } from "@/components/ui/use-toast";
import BookingDetailsModal from "@/components/booking/BookingDetailsModal";
import Link from "next/link";

export default function RideHistoryPage() {
  const [historyBookings, setHistoryBookings] = useState<
    GetUserBookingsResponse["data"]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<
    GetUserBookingsResponse["data"][0] | null
  >(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch booking history
  const fetchBookingHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await bookingService.getUserBookings(
        "assigned,in_progress,completed,cancelled,declined,no_show"
      );
      if (response.success) {
        setHistoryBookings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch booking history:", error);
      toast({
        title: "Error",
        description: "Failed to load your booking history",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open details modal
  const handleViewDetails = (booking: GetUserBookingsResponse["data"][0]) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookingHistory();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Ride History</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookingHistory}
            disabled={loadingHistory}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loadingHistory ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {loadingHistory ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">
                Loading your booking history...
              </p>
            </div>
          ) : historyBookings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {historyBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  showCancelButton={false}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-muted-foreground/30">
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
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
          )}
        </div>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          booking={selectedBooking}
        />
      </div>
    </ProtectedRoute>
  );
}
