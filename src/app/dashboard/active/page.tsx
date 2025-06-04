"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RefreshCw, Car } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingCard from "@/components/booking/BookingCard";
import { useEffect, useState, useCallback } from "react";
import {
  bookingService,
  GetUserBookingsResponse,
} from "@/utils/services/booking-service";
import { useToast } from "@/components/ui/use-toast";
import BookingDetailsModal from "@/components/booking/BookingDetailsModal";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ActiveBookingsPage() {
  const [activeBookings, setActiveBookings] = useState<
    GetUserBookingsResponse["data"]
  >([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<
    GetUserBookingsResponse["data"][0] | null
  >(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch active bookings
  const fetchActiveBookings = useCallback(async () => {
    setLoadingActive(true);
    try {
      const response = await bookingService.getUserBookings(
        "pending,confirmed"
      );
      if (response.success) {
        setActiveBookings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch active bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your active bookings",
        variant: "destructive",
      });
    } finally {
      setLoadingActive(false);
    }
  }, [toast]);

  // Open cancel dialog
  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  // Cancel a booking
  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    setCancellingBooking(true);

    try {
      const response = await bookingService.cancelBooking(
        bookingToCancel,
        "Cancelled by user"
      );

      if (response.success) {
        // Immediately remove the booking from the list without refresh
        setActiveBookings((current) =>
          current.filter((booking) => booking.id !== bookingToCancel)
        );

        toast({
          title: "Success",
          description: "Your booking has been cancelled",
        });
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel your booking",
        variant: "destructive",
      });
    } finally {
      // Close the dialog regardless of outcome
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      setCancellingBooking(false);
    }
  };

  // Open details modal
  const handleViewDetails = (booking: GetUserBookingsResponse["data"][0]) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  // Fetch bookings on component mount
  useEffect(() => {
    const loadBookings = async () => {
      await fetchActiveBookings();
    };
    loadBookings();
  }, [fetchActiveBookings]);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Active Bookings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActiveBookings}
            disabled={loadingActive}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loadingActive ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {loadingActive ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">
                Loading your bookings...
              </p>
            </div>
          ) : activeBookings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                  showCancelButton={true}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-muted-foreground/30">
              <CardContent className="text-center py-8">
                <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
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
          )}
        </div>

        {/* Cancellation Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancellingBooking}>
                No, keep my booking
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelBooking}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={cancellingBooking}
              >
                {cancellingBooking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, cancel booking"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
