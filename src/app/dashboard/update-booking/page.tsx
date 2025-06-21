"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import {
  PersonalDetailsForm,
  VehicleSelection,
  FareResponse,
  VehicleOption,
  BookingForm,
} from "@/components/booking";
import { AdditionalRequestsForm } from "@/components/booking/additional-requests-form";
import { getFareEstimate } from "@/utils/services/fare-api";
import { bookingService } from "@/utils/services/booking-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { authService } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import {
  setBabySeat,
  setChildSeat,
  setBoosterSeat,
  setWheelchair,
} from "@/store/slices/bookingSlice";
import { useAppSelector, useAppDispatch } from "@/store";
import { format } from "date-fns";
import { Suspense } from 'react';
import MapComponent from "@/components/map/MapComponent";
import { Location } from "@/components/map/MapComponent";

// Interfaces
interface MapInterface {
  updateLocations: (
    newPickup: Location | null,
    newDropoff: Location | null,
    newStops?: Location[]
  ) => void;
}

interface FareRequest {
  locations: {
    pickup: { address: string; coordinates: { lat: number; lng: number; }; };
    dropoff: { address: string; coordinates: { lat: number; lng: number; }; };
    additionalStops: Array<{ address: string; coordinates: { lat: number; lng: number; }; }>;
  };
  datetime: { date: string; time: string; };
  passengers: {
    count: number; checkedLuggage: number; mediumLuggage: number; handLuggage: number;
    babySeat: number; childSeat: number; boosterSeat: number; wheelchair: number;
  };
}

// Helper functions
const formatDate = (date: Date): string => date.toISOString().split("T")[0];
const validateTime = (time: string): string => {
  if (!time) return "12:00";
  const [hours, minutes] = time.split(":").map(Number);
  const validHours = Math.min(Math.max(0, Math.floor(hours)), 23);
  const validMinutes = Math.min(Math.max(0, Math.floor(minutes)), 59);
  return `${validHours.toString().padStart(2, "0")}:${validMinutes.toString().padStart(2, "0")}`;
};

// Main page component
export default function UpdateBookingPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    bookingId?: string; pickup?: string; dropoff?: string; date?: string; 
    time?: string; pax?: string; cl?: string; ml?: string; hl?: string; stops?: string;
  }> 
}) {
  return (
    <Suspense fallback={<UpdateBookingPageSkeleton />}>
      <UpdateBookingClientComponent searchParams={searchParams} />
    </Suspense>
  );
}

// Skeleton component
function UpdateBookingPageSkeleton() {
  return (
    <div className="animate-pulse">
      <Card>
        <CardHeader><CardTitle className="h-6 bg-gray-200 rounded w-1/2"></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    </div>
  );
}

// Client Component
function UpdateBookingClientComponent({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    bookingId?: string; pickup?: string; dropoff?: string; date?: string; 
    time?: string; pax?: string; cl?: string; ml?: string; hl?: string; stops?: string;
  }>
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const resolvedSearchParams = use(searchParams);
  const bookingId = resolvedSearchParams.bookingId;

  // States
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [additionalStops, setAdditionalStops] = useState<Location[]>([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [stopAddresses, setStopAddresses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(1);
  const [checkedLuggage, setCheckedLuggage] = useState<number>(0);
  const [mediumLuggage, setMediumLuggage] = useState<number>(0);
  const [handLuggage, setHandLuggage] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fareData, setFareData] = useState<FareResponse | null>(null);
  const [showVehicleOptions, setShowVehicleOptions] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState<boolean>(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    show: boolean; bookingId: string; notifications: string[];
  }>({ show: false, bookingId: "", notifications: [] });
  const [currentStep, setCurrentStep] = useState("location");
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number;} | null>(null);
  const [locationPermission, setLocationPermission] = useState<{denied: boolean; error: string | null;}>({denied: false, error: null});

  // Redux states
  const booking = useAppSelector((state) => state.booking);
  const babySeat = booking.babySeat || 0;
  const childSeat = booking.childSeat || 0;
  const boosterSeat = booking.boosterSeat || 0;
  const wheelchair = booking.wheelchair || 0;

  const mapInstanceRef = useRef<MapInterface | null>(null);

  // Validate booking ID
  useEffect(() => {
    if (!bookingId) {
      router.push("/dashboard");
      return;
    }
  }, [bookingId, router]);

  // Load state from search parameters
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Restore locations and other parameters from URL
      if (resolvedSearchParams.pickup) {
        const pickupData = JSON.parse(decodeURIComponent(resolvedSearchParams.pickup));
        if (pickupData.address && pickupData.latitude && pickupData.longitude) {
          setPickupLocation(pickupData);
            setPickupAddress(pickupData.address);
          }
      }
      if (resolvedSearchParams.dropoff) {
        const dropoffData = JSON.parse(decodeURIComponent(resolvedSearchParams.dropoff));
        if (dropoffData.address && dropoffData.latitude && dropoffData.longitude) {
          setDropoffLocation(dropoffData);
            setDropoffAddress(dropoffData.address);
          }
      }
      if (resolvedSearchParams.stops) {
        const stopsData = JSON.parse(decodeURIComponent(resolvedSearchParams.stops));
        if (Array.isArray(stopsData)) {
          setAdditionalStops(stopsData);
          setStopAddresses(stopsData.map((stop) => stop.address));
        }
      }
      if (resolvedSearchParams.date) {
        const date = new Date(resolvedSearchParams.date);
        if (!isNaN(date.getTime())) setSelectedDate(date);
          }
      if (resolvedSearchParams.time) setSelectedTime(resolvedSearchParams.time);
      if (resolvedSearchParams.pax) setPassengers(parseInt(resolvedSearchParams.pax, 10) || 1);
      if (resolvedSearchParams.cl) setCheckedLuggage(parseInt(resolvedSearchParams.cl, 10) || 0);
      if (resolvedSearchParams.ml) setMediumLuggage(parseInt(resolvedSearchParams.ml, 10) || 0);
      if (resolvedSearchParams.hl) setHandLuggage(parseInt(resolvedSearchParams.hl, 10) || 0);
    } catch (error) {
      console.error("Error loading booking data from URL:", error);
    }
  }, [resolvedSearchParams]);

  useEffect(() => { setShowMap(true); }, []);

  // Handlers
  const handleMapRef = useCallback((mapInstance: MapInterface) => {
      mapInstanceRef.current = mapInstance;
      if (mapInstance && pickupLocation && dropoffLocation) {
      mapInstance.updateLocations(pickupLocation, dropoffLocation, additionalStops);
      }
  }, [pickupLocation, dropoffLocation, additionalStops]);

  const handlePickupLocationSelect = (location: {address: string; longitude: number; latitude: number;}) => {
    if (!location.address || (location.longitude === 0 && location.latitude === 0)) {
      setPickupLocation(null);
      setPickupAddress("");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(null, dropoffLocation, additionalStops);
      }
      return;
    }
    const newLocation = {address: location.address, latitude: location.latitude, longitude: location.longitude};
    setPickupLocation(newLocation);
    setPickupAddress(location.address);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(newLocation, dropoffLocation, additionalStops);
    }
  };

  const handleDropoffLocationSelect = (location: {address: string; longitude: number; latitude: number;}) => {
    if (!location.address || (location.longitude === 0 && location.latitude === 0)) {
      setDropoffLocation(null);
      setDropoffAddress("");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(pickupLocation, null, additionalStops);
      }
      return;
    }
    const newLocation = {address: location.address, latitude: location.latitude, longitude: location.longitude};
    setDropoffLocation(newLocation);
    setDropoffAddress(location.address);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(pickupLocation, newLocation, additionalStops);
    }
  };

  const handleStopLocationSelect = (index: number, location: {address: string; longitude: number; latitude: number;}) => {
      const newStopAddresses = [...stopAddresses];
      const newAdditionalStops = [...additionalStops];

      while (newAdditionalStops.length <= index) {
      newAdditionalStops.push({address: "", latitude: 0, longitude: 0});
      }

    if (!location.address || (location.longitude === 0 && location.latitude === 0)) {
      newStopAddresses[index] = "";
      newAdditionalStops[index] = {address: "", latitude: 0, longitude: 0};
    } else {
      newStopAddresses[index] = location.address;
      newAdditionalStops[index] = {address: location.address, latitude: location.latitude, longitude: location.longitude};
    }
    
    setStopAddresses(newStopAddresses);
      setAdditionalStops(newAdditionalStops);
      if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(pickupLocation, dropoffLocation, newAdditionalStops);
      }
  };

  const addStop = () => setStopAddresses([...stopAddresses, ""]);
  const removeStop = (indexToRemove: number) => {
    setStopAddresses(stopAddresses.filter((_, idx) => idx !== indexToRemove));
    setAdditionalStops(additionalStops.filter((_, idx) => idx !== indexToRemove));
  };
  const updateStopAddress = (index: number, value: string) => {
    const newStopAddresses = [...stopAddresses];
    newStopAddresses[index] = value;
    setStopAddresses(newStopAddresses);
  };
  const reorderStops = (fromIndex: number, toIndex: number) => {
    const newStopAddresses = [...stopAddresses];
    const [removed] = newStopAddresses.splice(fromIndex, 1);
    newStopAddresses.splice(toIndex, 0, removed);
    setStopAddresses(newStopAddresses);
  };

  const getPassengerLuggageSummary = () => {
    if (passengers === 0 && checkedLuggage === 0 && mediumLuggage === 0 && handLuggage === 0) {
      return "Not specified";
    }
    const parts = [];
    if (passengers > 0) parts.push(`${passengers} ${passengers === 1 ? "passenger" : "passengers"}`);
    const luggageParts = [];
    if (checkedLuggage > 0) luggageParts.push(`${checkedLuggage} large ${checkedLuggage === 1 ? "bag" : "bags"}`);
    if (mediumLuggage > 0) luggageParts.push(`${mediumLuggage} medium ${mediumLuggage === 1 ? "bag" : "bags"}`);
    if (handLuggage > 0) luggageParts.push(`${handLuggage} small ${handLuggage === 1 ? "bag" : "bags"}`);
    if (luggageParts.length > 0) parts.push(luggageParts.join(", "));
    return parts.join(" with ");
  };

  const getAdditionalRequestsSummary = () => {
    const requests = [];
    if (babySeat > 0) requests.push(`${babySeat} baby ${babySeat === 1 ? "seat" : "seats"}`);
    if (childSeat > 0) requests.push(`${childSeat} child ${childSeat === 1 ? "seat" : "seats"}`);
    if (boosterSeat > 0) requests.push(`${boosterSeat} booster ${boosterSeat === 1 ? "seat" : "seats"}`);
    if (wheelchair > 0) requests.push(`${wheelchair} ${wheelchair === 1 ? "wheelchair" : "wheelchairs"}`);
    return requests.length > 0 ? requests.join(", ") : "Not specified";
  };

  const handleCalculateFare = async () => {
    try {
      setIsFetching(true);
      setFetchError(null);

      if (!pickupLocation || !dropoffLocation) {
        toast({ title: "Missing location information", description: "Please provide both pickup and dropoff locations.", variant: "destructive" });
        setIsFetching(false);
        return;
      }

      const formattedTime = validateTime(selectedTime);
      const formattedRequest: FareRequest = {
        locations: {
          pickup: { address: pickupLocation.address || "", coordinates: { lat: pickupLocation.latitude, lng: pickupLocation.longitude } },
          dropoff: { address: dropoffLocation.address || "", coordinates: { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude } },
          additionalStops: additionalStops.map((stop) => ({ address: stop.address || "", coordinates: { lat: stop.latitude, lng: stop.longitude } })),
        },
        datetime: { date: selectedDate ? formatDate(selectedDate) : "", time: formattedTime },
        passengers: {
          count: passengers || 1, checkedLuggage: checkedLuggage || 0, mediumLuggage: mediumLuggage || 0, handLuggage: handLuggage || 0,
          babySeat: babySeat || 0, childSeat: childSeat || 0, boosterSeat: boosterSeat || 0, wheelchair: wheelchair || 0,
        },
      };

      const fareResponse = await getFareEstimate(formattedRequest);

      if (!fareResponse.success && fareResponse.error && (fareResponse.error.code === "AUTH_ERROR" || fareResponse.error.code === "AUTH_REFRESH_REQUIRED")) {
        authService.clearAuthData();
        toast({ title: "Session expired", description: "Please sign in again to continue.", variant: "destructive" });
        setIsFetching(false);
        setTimeout(() => router.push("/auth/signin"), 1000);
        return;
      }

      if (!fareResponse.success) {
        setFetchError(fareResponse.error?.message || "Unable to calculate fare. Please try again.");
        setIsFetching(false);
        return;
      }

      if (fareResponse && fareResponse.success && fareResponse.data && fareResponse.data.fare) {
        setFareData(fareResponse.data.fare);
        setShowVehicleOptions(true);
      } else {
        setFetchError("Unable to calculate fare. Please try again.");
      }
      setIsFetching(false);
    } catch (error) {
      console.error("Fare calculation error:", error);
      setFetchError("An unexpected error occurred. Please try again.");
      setIsFetching(false);
    }
  };

  const handleVehicleSelect = (vehicle: VehicleOption) => setSelectedVehicle(vehicle);
  const handleBackToForm = () => {
    setShowVehicleOptions(false);
    setFareData(null);
    setSelectedVehicle(null);
    setShowDetailsForm(false);
  };
  const handleBackToVehicleSelection = () => setShowDetailsForm(false);
  const continueToBooking = () => { if (selectedVehicle) setShowDetailsForm(true); };

  const handleSubmitBooking = async (personalDetails: any, agree: boolean) => {
    if (!bookingId) {
      setBookingError("Booking ID is required to update a booking.");
      return;
    }

    if (!agree) {
      setBookingError("You must agree to the terms and conditions to proceed.");
      return;
    }

    if (!pickupLocation || !dropoffLocation || !selectedDate || !selectedTime || !selectedVehicle) {
      setBookingError("Missing required booking information");
      return;
    }

    setIsUpdatingBooking(true);
    setBookingError(null);

    try {
      const formattedTime = validateTime(selectedTime);
      const bookingData = {
        pickupLocation, dropoffLocation, additionalStops, selectedDate, selectedTime: formattedTime,
        passengers, checkedLuggage, mediumLuggage, handLuggage, selectedVehicle,
        babySeat, childSeat, boosterSeat, wheelchair,
      };

      const bookingResponse = await bookingService.updateBooking(bookingId, personalDetails, bookingData);
      setBookingSuccess({
        show: true,
        bookingId: bookingResponse.bookingId,
        notifications: bookingResponse.details?.notifications || [],
      });

      // Reset form
      setPickupLocation(null);
      setDropoffLocation(null);
      setAdditionalStops([]);
      setPickupAddress("");
      setDropoffAddress("");
      setStopAddresses([]);
      setSelectedDate(undefined);
      setSelectedTime("");
      setPassengers(1);
      setCheckedLuggage(0);
      setMediumLuggage(0);
      setHandLuggage(0);
      setSelectedVehicle(null);
      setShowVehicleOptions(false);
      setShowDetailsForm(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      setBookingError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setBookingSuccess({ show: false, bookingId: "", notifications: [] });
    setShowVehicleOptions(false);
    setShowDetailsForm(false);
    setFareData(null);
    setSelectedVehicle(null);
    router.push("/dashboard");
  };

  const handleLocationError = useCallback((error: string | null) => {
    if (error === "PERMISSION_DENIED") {
      setLocationPermission({ denied: true, error: "Location permission denied" });
    } else if (error) {
      setLocationPermission({ denied: false, error });
    } else {
      setLocationPermission({ denied: false, error: null });
    }
  }, []);

  const hasAirportLocations = () => {
    const airportKeywords = ["airport", "heathrow", "gatwick", "stansted", "luton"];
    const checkLocation = (address?: string) => !!address && airportKeywords.some((keyword) => address.toLowerCase().includes(keyword));
    return checkLocation(pickupLocation?.address) || checkLocation(dropoffLocation?.address) || additionalStops.some((stop) => checkLocation(stop.address));
  };

  const hasTrainStationLocations = () => {
    const trainStationKeywords = ["station", "train station", "railway station"];
    const checkLocation = (address?: string) => !!address && trainStationKeywords.some((keyword) => address.toLowerCase().includes(keyword));
    return checkLocation(pickupLocation?.address) || checkLocation(dropoffLocation?.address) || additionalStops.some((stop) => checkLocation(stop.address));
  };

  return (
      <div className="h-full w-full flex flex-col pt-2 overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row gap-2 overflow-hidden justify-between">
          {!showVehicleOptions ? (
            <>
              <div className="md:w-[31%] h-fit">
                {currentStep === "additionalRequests" ? (
                    <AdditionalRequestsForm
                  babySeat={babySeat} childSeat={childSeat} boosterSeat={boosterSeat} wheelchair={wheelchair}
                  setBabySeat={(value: number) => dispatch(setBabySeat(value))}
                  setChildSeat={(value: number) => dispatch(setChildSeat(value))}
                  setBoosterSeat={(value: number) => dispatch(setBoosterSeat(value))}
                  setWheelchair={(value: number) => dispatch(setWheelchair(value))}
                      onBack={() => setCurrentStep("location")}
                      disabled={locationPermission.denied}
                    />
                ) : (
                  <BookingForm
                  pickupAddress={pickupAddress} setPickupAddress={setPickupAddress}
                  dropoffAddress={dropoffAddress} setDropoffAddress={setDropoffAddress}
                  stopAddresses={stopAddresses} pickupLocation={pickupLocation} dropoffLocation={dropoffLocation}
                  selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime} setSelectedTime={setSelectedTime}
                  passengers={passengers} setPassengers={setPassengers}
                  checkedLuggage={checkedLuggage} setCheckedLuggage={setCheckedLuggage}
                  mediumLuggage={mediumLuggage} setMediumLuggage={setMediumLuggage}
                  handLuggage={handLuggage} setHandLuggage={setHandLuggage}
                  babySeat={babySeat} childSeat={childSeat} boosterSeat={boosterSeat} wheelchair={wheelchair}
                  userLocation={userLocation} showVehicleOptions={showVehicleOptions}
                  setFormModified={() => {}} isFetching={isFetching} fetchError={fetchError}
                    handlePickupLocationSelect={handlePickupLocationSelect}
                    handleDropoffLocationSelect={handleDropoffLocationSelect}
                    handleStopLocationSelect={handleStopLocationSelect}
                  updateStopAddress={updateStopAddress} addStop={addStop} removeStop={removeStop}
                  calculateFare={handleCalculateFare} getPassengerLuggageSummary={getPassengerLuggageSummary}
                    getAdditionalRequestsSummary={getAdditionalRequestsSummary}
                  onGoToAdditionalRequests={() => setCurrentStep("additionalRequests")}
                  disabled={locationPermission.denied} reorderStops={reorderStops}
                  />
                )}
              </div>
              <div className="md:w-[65%]">
              {showMap && (
                    <div className="h-[35vh] md:h-[87vh] max-h-[calc(100vh-0rem)] rounded-lg overflow-hidden border shadow-sm">
                  <MapComponent
                    className="h-full" pickupLocation={pickupLocation} dropoffLocation={dropoffLocation}
                    stops={additionalStops} showRoute={true} showCurrentLocation={true}
                    onUserLocationChange={setUserLocation} passMapRef={handleMapRef}
                        onLocationError={handleLocationError}
                      />
                    </div>
              )}
              </div>
            </>
          ) : (
            <>
              {!showDetailsForm ? (
                <div className="flex w-full h-full flex-col lg:flex-row gap-4">
                <div className="hidden lg:w-[29%] lg:block">
                    <Card className="border shadow-sm">
                      <CardContent className="px-4 space-y-2 py-0 my-0">
                        <div className="flex justify-between items-center mb-2">
                        <h2 className="text-base font-semibold">Journey Details</h2>
                        <Button variant="ghost" onClick={handleBackToForm} size="sm" className="h-8 text-sm p-1.5">Back</Button>
                        </div>
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">Pickup Location</label>
                        <div className="p-2 bg-muted/40 rounded-md text-sm">{pickupLocation?.address || "Not specified"}</div>
                          </div>
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">Dropoff Location</label>
                        <div className="p-2 bg-muted/40 rounded-md text-sm">{dropoffLocation?.address || "Not specified"}</div>
                          </div>
                        {additionalStops.length > 0 && (
                          <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">Stops ({additionalStops.length})</label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">{additionalStops.length} stop{additionalStops.length !== 1 ? "s" : ""}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                          <label className="text-xs font-medium mb-1 block text-muted-foreground">Date</label>
                          <p className="text-sm">{selectedDate ? new Date(selectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not selected"}</p>
                          </div>
                          <div>
                          <label className="text-xs font-medium mb-1 block text-muted-foreground">Time</label>
                          <p className="text-sm">{selectedTime || "Not selected"}</p>
                          </div>
                        </div>
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">Passengers & Luggage</label>
                        <div className="p-2 bg-muted/40 rounded-md text-sm">{getPassengerLuggageSummary()}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                <div className="w-full lg:w-[42%] lg:max-h-[calc(100vh-5.5rem)] overflow-hidden lg:flex lg:flex-col">
                  <div className="p-3 border-b"><h2 className="text-base font-semibold">Select Vehicle</h2></div>
                    <div className="overflow-y-auto flex-1 p-3 h-full">
                      {fareData && (
                        <VehicleSelection
                        fareData={fareData} pickupLocation={pickupLocation} dropoffLocation={dropoffLocation}
                        selectedDate={selectedDate} selectedTime={selectedTime} passengers={passengers}
                        checkedLuggage={checkedLuggage} mediumLuggage={mediumLuggage} handLuggage={handLuggage}
                        onBack={handleBackToForm} onSelectVehicle={handleVehicleSelect} layout="vertical"
                        />
                      )}
                    </div>
                    {selectedVehicle && (
                      <div className="px-3 py-3 border-t">
                      <Button onClick={continueToBooking} className="w-full text-sm h-10">Continue with {selectedVehicle.name}</Button>
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-[25%] h-[40vh] lg:h-[100vh] lg:max-h-[calc(100vh-6rem)] hidden lg:block">
                  {showMap && (
                      <div className="h-full rounded-lg overflow-hidden border shadow-sm">
                      <MapComponent
                        className="h-full" pickupLocation={pickupLocation} dropoffLocation={dropoffLocation}
                        stops={additionalStops} showRoute={true} showCurrentLocation={true}
                        onUserLocationChange={setUserLocation} passMapRef={handleMapRef}
                          onLocationError={handleLocationError}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row w-full h-full gap-4 pb-24">
                  <div className="w-full lg:w-2/3 relative flex flex-col h-fit">
                    {selectedVehicle && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto pr-2">
                          <div className="animate-in fade-in slide-in-from-right-5 duration-500 h-full flex flex-col">
                            <div className="space-y-6 bg-card border rounded-xl p-6 flex-1 flex flex-col justify-start">
                              <div className="flex justify-between items-center">
                              <h3 className="text-xl font-semibold">Update Booking Information</h3>
                              <Button variant="ghost" onClick={handleBackToVehicleSelection} size="sm" className="gap-2 h-8">
                                <ArrowLeft size={16} />Back
                                </Button>
                              </div>
                              <PersonalDetailsForm
                              onSubmit={handleSubmitBooking} onFormValidityChange={() => {}}
                              isSubmitting={isUpdatingBooking} error={bookingError}
                              hasAirportLocations={hasAirportLocations()} hasTrainStationLocations={hasTrainStationLocations()}
                              lockedDate={undefined}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-1/3 h-fit flex flex-col">
                    <Card className="border shadow-sm sticky top-0 flex-1 flex flex-col justify-start">
                    <CardHeader className="py-0"><CardTitle className="text-xl">Update Summary</CardTitle></CardHeader>
                      <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-start">
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">From</label>
                        <div className="p-2 bg-muted/40 rounded-md text-sm">{pickupLocation?.address || "Not specified"}</div>
                          </div>
                        {additionalStops.length > 0 && (
                          <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">Stops ({additionalStops.length})</label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">{additionalStops.length} stop{additionalStops.length !== 1 ? "s" : ""}</div>
                          </div>
                        )}
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">To</label>
                        <div className="p-2 bg-muted/40 rounded-md text-sm">{dropoffLocation?.address || "Not specified"}</div>
                          </div>
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">Date & Time</label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                          {selectedDate ? format(selectedDate, "EEE, d MMM yyyy") : "Not specified"} at {selectedTime}
                          </div>
                        </div>
                        <div>
                        <label className="text-sm font-medium mb-1 block text-muted-foreground">Passengers & Luggage</label>
                        <div className="p-2 bg-muted/40 rounded-md text-sm">{getPassengerLuggageSummary()}</div>
                          </div>
                        {selectedVehicle && (
                          <div className="mt-auto pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div>
                              <label className="text-sm font-medium text-muted-foreground">Selected Vehicle</label>
                              <p className="text-base font-medium mt-1">{selectedVehicle.name}</p>
                              </div>
                              <div className="text-right">
                              <label className="text-sm font-medium text-muted-foreground">Total Price</label>
                              <p className="text-2xl font-bold font-mono mt-1">£{selectedVehicle.price.amount.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      <Dialog open={bookingSuccess.show} onOpenChange={(open) => !open && handleCloseSuccessDialog()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="bg-emerald-100 rounded-full p-1.5">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              Booking Updated
              </DialogTitle>
            <DialogDescription className="text-base">Your booking has been successfully updated and is now being processed</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-2 text-sm font-medium">Booking Reference:</p>
            <div className="text-lg font-bold font-mono bg-primary/10 py-3 px-4 rounded-md text-center mb-4">{bookingSuccess.bookingId}</div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-slate-800 mb-2">What happens next?</h4>
              <p className="text-sm text-slate-700">One of our agents will contact you shortly to confirm your updated booking details. Please keep your phone available.</p>
              </div>
            {bookingSuccess.notifications && bookingSuccess.notifications.length > 0 && (
                  <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">Important Information:</p>
                    <ul className="text-sm space-y-1 text-amber-700">
                  {bookingSuccess.notifications.map((notification, index) => (
                          <li key={index} className="flex items-start gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5"></span>
                            <span>{notification}</span>
                          </li>
                  ))}
                    </ul>
                  </div>
                )}
            <p className="mt-4 text-sm text-muted-foreground">A confirmation email has been sent to your email address with all the updated booking details.</p>
            </div>
            <DialogFooter>
            <Button onClick={handleCloseSuccessDialog} className="w-full">Return to Dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}