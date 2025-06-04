"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Car, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingCard from "@/components/booking/BookingCard";
import { useEffect, useState, useCallback } from "react";
import {
  bookingService,
  GetUserBookingsResponse,
} from "@/utils/services/booking-service";
import { useToast } from "@/components/ui/use-toast";
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
import BookingDetailsModal from "@/components/booking/BookingDetailsModal";

export default function DashboardPage() {
  const [activeBookings, setActiveBookings] = useState<
    GetUserBookingsResponse["data"]
  >([]);
  const [historyBookings, setHistoryBookings] = useState<
    GetUserBookingsResponse["data"]
  >([]);
  const [cancelledBookings, setCancelledBookings] = useState<
    GetUserBookingsResponse["data"]
  >([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCancelled, setLoadingCancelled] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<
    GetUserBookingsResponse["data"][0] | null
  >(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch active bookings (pending, confirmed only)
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

  // Fetch booking history (excluding cancelled bookings)
  const fetchBookingHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await bookingService.getUserBookings(
        "assigned,in_progress,completed,declined,no_show"
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
  }, [toast]);

  // Fetch cancelled bookings
  const fetchCancelledBookings = useCallback(async () => {
    setLoadingCancelled(true);
    try {
      const response = await bookingService.getUserBookings("cancelled");
      if (response.success) {
        setCancelledBookings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cancelled bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your cancelled bookings",
        variant: "destructive",
      });
    } finally {
      setLoadingCancelled(false);
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
        // Update local state to immediately reflect the cancellation
        // 1. Remove the booking from activeBookings
        setActiveBookings((current) =>
          current.filter((booking) => booking.id !== bookingToCancel)
        );

        // 2. Add the cancelled booking to cancelled bookings with updated status
        const cancelledBooking = activeBookings.find(
          (booking) => booking.id === bookingToCancel
        );

        if (cancelledBooking) {
          const updatedBooking = {
            ...cancelledBooking,
            status: "cancelled",
          };

          setCancelledBookings((current) => [updatedBooking, ...current]);
        }

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
      await fetchBookingHistory();
      await fetchCancelledBookings();
    };
    loadBookings();
  }, [fetchActiveBookings, fetchBookingHistory, fetchCancelledBookings]);

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
            <TabsList className="mb-6 w-full flex justify-between">
              <TabsTrigger value="active" className="text-xs sm:text-sm flex-1">
                <span className="hidden sm:inline">Active Bookings</span>
                <span className="sm:hidden flex items-center justify-center">
                  <Car className="h-4 w-4 mr-1" />
                  Active
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs sm:text-sm flex-1"
              >
                <span className="hidden sm:inline">Booking History</span>
                <span className="sm:hidden flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  History
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="text-xs sm:text-sm flex-1"
              >
                <span className="hidden sm:inline">Cancelled Bookings</span>
                <span className="sm:hidden flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Cancelled
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Car className="mr-2 h-5 w-5" />
                  Active Bookings
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchActiveBookings}
                  disabled={loadingActive}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingActive ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

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
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Booking History
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBookingHistory}
                  disabled={loadingHistory}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingHistory ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

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
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Cancelled Bookings
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCancelledBookings}
                  disabled={loadingCancelled}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingCancelled ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {loadingCancelled ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">
                    Loading your cancelled bookings...
                  </p>
                </div>
              ) : cancelledBookings.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {cancelledBookings.map((booking) => (
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
                    <p className="text-muted-foreground text-lg">
                      No cancelled bookings found
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You haven&apos;t cancelled any bookings yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
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
