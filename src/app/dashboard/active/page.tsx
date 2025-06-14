"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RefreshCw, Car } from "lucide-react";
import { Loading3D } from "@/components/ui/loading-3d";
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
              <Loading3D size="md" message="Loading your bookings..." />
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

        {/* WhatsApp Contact Section */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-md p-4">
          <h4 className="font-medium text-slate-800 mb-2">
            Need Urgent Assistance?
          </h4>
          <p className="text-sm text-slate-700">
            For any urgent booking inquiries or support.
          </p>
          <p className="text-sm text-slate-700 mt-2 font-semibold">
            <a
              href="https://wa.me/447831054649"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.90-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.041 1.016-1.041 2.479 1.066 2.876 1.215 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Urgent Bookings: WhatsApp +447831054649
            </a>
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
