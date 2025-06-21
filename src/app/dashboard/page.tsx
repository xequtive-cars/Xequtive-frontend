"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Car, RefreshCw } from "lucide-react";
import { Loading3D } from "@/components/ui/loading-3d";
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
  const { toast } = useToast();
  const router = useRouter();
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
  const handleCancelClick = useCallback((bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  }, []);

  // Cancel a booking
  const confirmCancelBooking = useCallback(async () => {
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
  }, [bookingToCancel, activeBookings, toast]);

  // Open details modal
  const handleViewDetails = useCallback(
    (booking: GetUserBookingsResponse["data"][0]) => {
      setSelectedBooking(booking);
      setDetailsModalOpen(true);
    },
    []
  );

  // Handle editing a booking
  const handleEditBooking = useCallback(
    (booking: GetUserBookingsResponse["data"][0]) => {
      // Create URL parameters with current booking details to pre-fill the form
      const params = new URLSearchParams();
      
      // Add booking ID
      params.set('bookingId', booking.id);
      
      // Add current booking details for pre-filling
      if (booking.pickupLocation?.address) {
        const pickupData = {
          address: booking.pickupLocation.address,
          // Note: We don't have coordinates from the booking response, 
          // so the form will need to geocode the address
          latitude: 0,
          longitude: 0
        };
        params.set('pickup', encodeURIComponent(JSON.stringify(pickupData)));
      }
      
      if (booking.dropoffLocation?.address) {
        const dropoffData = {
          address: booking.dropoffLocation.address,
          latitude: 0,
          longitude: 0
        };
        params.set('dropoff', encodeURIComponent(JSON.stringify(dropoffData)));
      }
      
      // Add date and time
      if (booking.pickupDate) {
        params.set('date', booking.pickupDate);
      }
      if (booking.pickupTime) {
        params.set('time', booking.pickupTime);
      }
      
      // Navigate to update booking page
      router.push(`/dashboard/update-booking?${params.toString()}`);
    },
    [router]
  );

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
                      onEdit={handleEditBooking}
                      showEditButton={true}
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
                  <Loading3D size="md" message="Loading your booking history..." />
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
                  <Loading3D size="md" message="Loading your cancelled bookings..." />
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

      <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Email Us
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://wa.me/447831054649"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-1"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.90-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.041 1.016-1.041 2.479 1.066 2.876 1.215 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                WhatsApp +447831054649
              </a>
            </div>
          </div>
          <div className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
}
