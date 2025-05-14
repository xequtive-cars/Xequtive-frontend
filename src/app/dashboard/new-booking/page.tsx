"use client";

import { useState, useEffect, memo, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "@/components/map/MapComponent";
import { Location } from "@/components/map/MapComponent";
import { Check, MapPin } from "lucide-react";
import {
  PersonalDetailsForm,
  VehicleSelection,
  FareResponse,
  VehicleOption,
  BookingForm,
} from "@/components/booking";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { authService } from "@/lib/auth";

// Create an interface for the map methods
interface MapInterface {
  updateLocations: (
    newPickup: Location | null,
    newDropoff: Location | null,
    newStops?: Location[]
  ) => void;
}

// Create a truly stable memoized version of MapComponent to prevent refreshes
const StableMapComponent = memo(
  ({
    pickupLocation,
    dropoffLocation,
    stops = [],
    showCurrentLocation,
    onUserLocationChange,
    className,
    passMapRef,
    onLocationError,
  }: {
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    stops?: Location[];
    showRoute?: boolean;
    showCurrentLocation: boolean;
    onUserLocationChange?: (
      location: { latitude: number; longitude: number } | null
    ) => void;
    className?: string;
    passMapRef: (mapInstance: MapInterface) => void;
    onLocationError: (error: string | null) => void;
  }) => {
    // Use ref to store the map interface and latest props to prevent re-renders
    const mapRef = useRef<MapInterface | null>(null);
    const propsRef = useRef({
      pickupLocation,
      dropoffLocation,
      stops,
    });

    // Update the ref values when props change, but don't trigger re-renders
    useEffect(() => {
      propsRef.current = {
        pickupLocation,
        dropoffLocation,
        stops,
      };

      // If map interface is available, update the locations without re-rendering
      if (mapRef.current) {
        mapRef.current.updateLocations(pickupLocation, dropoffLocation, stops);
      }
    }, [pickupLocation, dropoffLocation, stops]);

    // Register the map reference - this callback should never change
    const handleMapRef = useCallback(
      (mapInstance: MapInterface) => {
        mapRef.current = mapInstance;

        // Initial update of locations after getting map ref
        if (mapInstance) {
          const { pickupLocation, dropoffLocation, stops } = propsRef.current;
          mapInstance.updateLocations(pickupLocation, dropoffLocation, stops);

          // Pass the map instance to the parent component if passMapRef is provided
          if (passMapRef) {
            passMapRef(mapInstance);
          }
        }
      },
      [passMapRef]
    );

    // Create a single map component instance that never rerenders
    const mapComponent = useMemo(() => {
      return (
        <MapComponent
          className={className}
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          stops={stops}
          showRoute={true}
          showCurrentLocation={showCurrentLocation}
          onUserLocationChange={onUserLocationChange}
          passMapRef={handleMapRef}
          onLocationError={onLocationError}
        />
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - component is created exactly once

    return mapComponent;
  },
  // Custom equality function for React.memo that only triggers re-render when actual location values change
  (prevProps, nextProps) => {
    // Only re-render if the locations ACTUALLY changed their values (not just references)
    // This prevents re-renders when unrelated fields like time, date, passengers change
    const prevPickup = JSON.stringify(prevProps.pickupLocation);
    const nextPickup = JSON.stringify(nextProps.pickupLocation);

    const prevDropoff = JSON.stringify(prevProps.dropoffLocation);
    const nextDropoff = JSON.stringify(nextProps.dropoffLocation);

    const prevStops = JSON.stringify(prevProps.stops);
    const nextStops = JSON.stringify(nextProps.stops);

    // Return true if they're equal (meaning NO re-render needed)
    return (
      prevPickup === nextPickup &&
      prevDropoff === nextDropoff &&
      prevStops === nextStops
    );
  }
);

// Add display name for React DevTools
StableMapComponent.displayName = "StableMapComponent";

// Extend FareResponse type to include API response variations
declare module "@/components/booking" {
  interface FareResponse {
    distance_miles?: number;
    duration_minutes?: number;
  }
}

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Map ref to keep track of the map interface
  const mapInstanceRef = useRef<MapInterface | null>(null);

  // Map states
  const [showMap, setShowMap] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [additionalStops, setAdditionalStops] = useState<Location[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Form states
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [stopAddresses, setStopAddresses] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Passenger/luggage states
  const [passengers, setPassengers] = useState<number>(1);
  const [checkedLuggage, setCheckedLuggage] = useState<number>(0);
  const [handLuggage, setHandLuggage] = useState<number>(0);

  // API states
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Vehicle selection states
  const [fareData, setFareData] = useState<FareResponse | null>(null);
  const [showVehicleOptions, setShowVehicleOptions] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(
    null
  );

  // Booking form states
  const [showDetailsForm, setShowDetailsForm] = useState<boolean>(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    show: boolean;
    bookingId: string;
    notifications: string[];
  }>({
    show: false,
    bookingId: "",
    notifications: [],
  });

  // Form modified state
  const [formModified, setFormModified] = useState<boolean>(false);

  // Location permission state
  const [locationPermission, setLocationPermission] = useState<{
    denied: boolean;
    error: string | null;
  }>({
    denied: false,
    error: null,
  });

  // Load state from query parameters on initial load
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    try {
      // Get query parameters
      const pickup = searchParams.get("pickup");
      const dropoff = searchParams.get("dropoff");
      const dateParam = searchParams.get("date");
      const timeParam = searchParams.get("time");
      const paxParam = searchParams.get("pax");
      const clParam = searchParams.get("cl"); // checked luggage
      const hlParam = searchParams.get("hl"); // hand luggage
      const stopsParam = searchParams.get("stops");

      // Restore pickup location
      if (pickup) {
        try {
          const pickupData = JSON.parse(decodeURIComponent(pickup));
          if (
            pickupData.address &&
            pickupData.latitude &&
            pickupData.longitude
          ) {
            setPickupLocation({
              address: pickupData.address,
              latitude: pickupData.latitude,
              longitude: pickupData.longitude,
            });
            setPickupAddress(pickupData.address);
          }
        } catch {
          // Error parsing pickup location
        }
      }

      // Restore dropoff location
      if (dropoff) {
        try {
          const dropoffData = JSON.parse(decodeURIComponent(dropoff));
          if (
            dropoffData.address &&
            dropoffData.latitude &&
            dropoffData.longitude
          ) {
            setDropoffLocation({
              address: dropoffData.address,
              latitude: dropoffData.latitude,
              longitude: dropoffData.longitude,
            });
            setDropoffAddress(dropoffData.address);
          }
        } catch {
          // Error parsing dropoff location
        }
      }

      // Restore stops
      if (stopsParam) {
        try {
          const stopsData = JSON.parse(decodeURIComponent(stopsParam));
          if (Array.isArray(stopsData) && stopsData.length > 0) {
            const validStops = stopsData.filter(
              (stop) => stop.address && stop.latitude && stop.longitude
            );
            setAdditionalStops(validStops);
            setStopAddresses(validStops.map((stop) => stop.address));
          }
        } catch {
          // Error parsing stops
        }
      }

      // Restore date
      if (dateParam) {
        try {
          const date = new Date(dateParam);
          if (!isNaN(date.getTime())) {
            setSelectedDate(date);
          }
        } catch {
          // Error parsing date
        }
      }

      // Restore time
      if (timeParam) {
        setSelectedTime(timeParam);
      }

      // Restore passenger count
      if (paxParam) {
        const pax = parseInt(paxParam, 10);
        if (!isNaN(pax) && pax > 0) {
          setPassengers(pax);
        }
      }

      // Restore luggage counts
      if (clParam) {
        const cl = parseInt(clParam, 10);
        if (!isNaN(cl) && cl >= 0) {
          setCheckedLuggage(cl);
        }
      }

      if (hlParam) {
        const hl = parseInt(hlParam, 10);
        if (!isNaN(hl) && hl >= 0) {
          setHandLuggage(hl);
        }
      }
    } catch {
      // Error restoring state from URL
    }
  }, [searchParams]);

  // Update URL with booking details when they change
  useEffect(() => {
    // Only run on client-side and if we have basic info
    if (typeof window === "undefined") return;

    const updateQueryParams = () => {
      // Get current URL parameters
      const currentParams = new URLSearchParams(window.location.search);
      const params = new URLSearchParams(currentParams);

      // Add pickup location to URL if available
      if (pickupLocation) {
        const pickupData = {
          address: pickupLocation.address,
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
        };
        params.set("pickup", encodeURIComponent(JSON.stringify(pickupData)));
      } else {
        params.delete("pickup");
      }

      // Add dropoff location to URL if available
      if (dropoffLocation) {
        const dropoffData = {
          address: dropoffLocation.address,
          latitude: dropoffLocation.latitude,
          longitude: dropoffLocation.longitude,
        };
        params.set("dropoff", encodeURIComponent(JSON.stringify(dropoffData)));
      } else {
        params.delete("dropoff");
      }

      // Add stops to URL if available
      if (additionalStops.length > 0) {
        // Only include valid stops
        const validStops = additionalStops.filter(
          (stop) => stop.address && stop.latitude && stop.longitude
        );
        if (validStops.length > 0) {
          params.set("stops", encodeURIComponent(JSON.stringify(validStops)));
        } else {
          params.delete("stops");
        }
      } else {
        params.delete("stops");
      }

      // Update URL without refreshing the page
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    };

    // Don't update during initial loading
    if (
      pickupLocation !== null ||
      dropoffLocation !== null ||
      additionalStops.length > 0
    ) {
      updateQueryParams();
    }
  }, [pickupLocation, dropoffLocation, additionalStops]);

  // Separate effect for non-location parameters that won't trigger map redraws
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    const updateNonLocationParams = () => {
      // Get current URL parameters - preserve location params
      const currentParams = new URLSearchParams(window.location.search);

      // Update non-location parameters
      if (selectedDate) {
        currentParams.set("date", selectedDate.toISOString().split("T")[0]);
      } else {
        currentParams.delete("date");
      }

      if (selectedTime) {
        currentParams.set("time", selectedTime);
      } else {
        currentParams.delete("time");
      }

      // Add passenger and luggage counts
      currentParams.set("pax", passengers.toString());
      currentParams.set("cl", checkedLuggage.toString());
      currentParams.set("hl", handLuggage.toString());

      // Update URL without refreshing the page
      const newUrl =
        window.location.pathname +
        (currentParams.toString() ? `?${currentParams.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    };

    // Only update if we have something to save
    const hasNonLocationData =
      selectedDate !== undefined ||
      selectedTime !== "" ||
      passengers !== 1 ||
      checkedLuggage !== 0 ||
      handLuggage !== 0;

    if (hasNonLocationData) {
      updateNonLocationParams();
    }
  }, [selectedDate, selectedTime, passengers, checkedLuggage, handLuggage]);

  // Delay map rendering to prevent hydration issues
  useEffect(() => {
    setShowMap(true);
  }, []);

  // Effect to ensure the route line is drawn immediately after pickup and dropoff are selected
  useEffect(() => {
    // Force immediate route drawing whenever location props change
    if (mapInstanceRef.current && pickupLocation && dropoffLocation) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.updateLocations(
            pickupLocation,
            dropoffLocation,
            additionalStops
          );
        }
      }, 0);
    }
  }, [pickupLocation, dropoffLocation, additionalStops]); // Only depend on location-related props

  // Handler to capture the map interface reference
  const handleMapRef = useCallback(
    (mapInstance: MapInterface) => {
      mapInstanceRef.current = mapInstance;

      // If we already have locations loaded from URL parameters, draw the route
      if (mapInstance && pickupLocation && dropoffLocation) {
        mapInstance.updateLocations(
          pickupLocation,
          dropoffLocation,
          additionalStops
        );
      }
    },
    [pickupLocation, dropoffLocation, additionalStops]
  );

  // Handle pickup location selection
  const handlePickupLocationSelect = (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => {
    // Check if this is a clear operation (empty address or zero coordinates)
    if (
      !location.address ||
      (location.longitude === 0 && location.latitude === 0)
    ) {
      // Immediately set to null to ensure map updates right away
      setPickupLocation(null);
      setPickupAddress("");

      // Update map immediately
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(
          null,
          dropoffLocation,
          additionalStops
        );
      }

      // Mark form as modified if we're in the vehicle selection view
      if (showVehicleOptions) setFormModified(true);
      return;
    }

    // Update pickup location
    const newPickupLocation = {
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setPickupLocation(newPickupLocation);
    setPickupAddress(location.address);

    // Update map immediately to draw route without waiting for other form fields
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(
        newPickupLocation,
        dropoffLocation,
        additionalStops
      );
    }

    // Mark form as modified if we're in the vehicle selection view
    if (showVehicleOptions) setFormModified(true);
  };

  // Handle dropoff location selection
  const handleDropoffLocationSelect = (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => {
    // Check if this is a clear operation (empty address or zero coordinates)
    if (
      !location.address ||
      (location.longitude === 0 && location.latitude === 0)
    ) {
      // Immediately set to null to ensure map updates right away
      setDropoffLocation(null);
      setDropoffAddress("");

      // Update map immediately
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(
          pickupLocation,
          null,
          additionalStops
        );
      }

      // Mark form as modified if we're in the vehicle selection view
      if (showVehicleOptions) setFormModified(true);
      return;
    }

    // Update dropoff location
    const newDropoffLocation = {
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setDropoffLocation(newDropoffLocation);
    setDropoffAddress(location.address);

    // Update map immediately to draw route without waiting for other form fields
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(
        pickupLocation,
        newDropoffLocation,
        additionalStops
      );
    }

    // Mark form as modified if we're in the vehicle selection view
    if (showVehicleOptions) setFormModified(true);
  };

  // Handle additional stop location selection
  const handleStopLocationSelect = (
    index: number,
    location: { address: string; longitude: number; latitude: number }
  ) => {
    // Check if this is a clear operation (empty address or zero coordinates)
    if (
      !location.address ||
      (location.longitude === 0 && location.latitude === 0)
    ) {
      const newStopAddresses = [...stopAddresses];
      newStopAddresses[index] = "";
      setStopAddresses(newStopAddresses);

      // Immediately update the stops array to ensure map updates right away
      const newAdditionalStops = [...additionalStops];
      newAdditionalStops.splice(index, 1);
      setAdditionalStops(newAdditionalStops);

      // Update map immediately
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(
          pickupLocation,
          dropoffLocation,
          newAdditionalStops
        );
      }

      // Mark form as modified if we're in the vehicle selection view
      if (showVehicleOptions) setFormModified(true);
      return;
    }

    // Update stops
    const newStops = [...additionalStops];
    newStops[index] = {
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    };
    setAdditionalStops(newStops);

    // Update the stop address
    const newStopAddresses = [...stopAddresses];
    newStopAddresses[index] = location.address;
    setStopAddresses(newStopAddresses);

    // Update map immediately to draw route without waiting for other form fields
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(
        pickupLocation,
        dropoffLocation,
        newStops
      );
    }

    // Mark form as modified if we're in the vehicle selection view
    if (showVehicleOptions) setFormModified(true);
  };

  // Add a new stop field
  const addStop = () => {
    setStopAddresses([...stopAddresses, ""]);
  };

  // Remove a stop field
  const removeStop = (index: number) => {
    const newStopAddresses = [...stopAddresses];
    newStopAddresses.splice(index, 1);
    setStopAddresses(newStopAddresses);

    const newAdditionalStops = [...additionalStops];
    newAdditionalStops.splice(index, 1);
    setAdditionalStops(newAdditionalStops);

    // Update map immediately when a stop is removed
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(
        pickupLocation,
        dropoffLocation,
        newAdditionalStops
      );
    }
  };

  // Update stop address state
  const updateStopAddress = (index: number, value: string) => {
    const newStopAddresses = [...stopAddresses];
    newStopAddresses[index] = value;
    setStopAddresses(newStopAddresses);
  };

  // Get passenger and luggage summary
  const getPassengerLuggageSummary = () => {
    if (passengers === 0 && checkedLuggage === 0 && handLuggage === 0) {
      return "Not specified";
    }

    const parts = [];
    if (passengers > 0) {
      parts.push(
        `${passengers} ${passengers === 1 ? "passenger" : "passengers"}`
      );
    }

    const luggageParts = [];
    if (checkedLuggage > 0) {
      luggageParts.push(
        `${checkedLuggage} large ${checkedLuggage === 1 ? "bag" : "bags"}`
      );
    }
    if (handLuggage > 0) {
      luggageParts.push(
        `${handLuggage} small ${handLuggage === 1 ? "bag" : "bags"}`
      );
    }

    if (luggageParts.length > 0) {
      parts.push(luggageParts.join(" and "));
    }

    return parts.join(" with ");
  };

  // Calculate fare and get vehicle options
  const calculateFare = async () => {
    setIsFetching(true);
    setFetchError(null);
    setFareData(null);
    setShowVehicleOptions(false);
    setSelectedVehicle(null);
    setShowDetailsForm(false);

    // Check if we have the required location data
    if (!pickupLocation || !dropoffLocation) {
      setFetchError("Please specify pickup and dropoff locations");
      setIsFetching(false);
      return;
    }

    if (!selectedDate || !selectedTime) {
      setFetchError("Please specify pickup date and time");
      setIsFetching(false);
      return;
    }

    try {
      // Create a properly formatted request for getFareEstimate
      const formattedRequest = {
        locations: {
          pickup: {
            address: pickupLocation.address || "",
            coordinates: {
              lat: pickupLocation.latitude,
              lng: pickupLocation.longitude,
            },
          },
          dropoff: {
            address: dropoffLocation.address || "",
            coordinates: {
              lat: dropoffLocation.latitude,
              lng: dropoffLocation.longitude,
            },
          },
          additionalStops: additionalStops.map((stop) => ({
            address: stop.address || "",
            coordinates: {
              lat: stop.latitude,
              lng: stop.longitude,
            },
          })),
        },
        datetime: {
          date: selectedDate,
          time: selectedTime,
        },
        passengers: {
          count: passengers || 1,
          checkedLuggage: checkedLuggage || 0,
          handLuggage: handLuggage || 0,
        },
      };

      const fareResponse = await getFareEstimate(formattedRequest);

      // Check for authentication errors
      if (
        !fareResponse.success &&
        fareResponse.error &&
        (fareResponse.error.code === "AUTH_ERROR" ||
          fareResponse.error.code === "AUTH_REFRESH_REQUIRED")
      ) {
        console.error("Authentication error:", fareResponse.error.message);
        // Clear any existing session data
        authService.clearAuthData();
        // Show error message
        setFetchError(`${fareResponse.error.message} Redirecting to login...`);
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
        return;
      }

      // First check if we have a valid fare response at all
      if (
        !fareResponse ||
        !fareResponse.success ||
        !fareResponse.data ||
        !fareResponse.data.fare
      ) {
        setFetchError(
          "Received invalid fare data from server. Please try again."
        );
        return;
      }

      // Set the journey data regardless of vehicle options
      setFareData(fareResponse.data.fare);

      // Check specifically for vehicle options only when attempting to show the vehicle selection screen
      if (
        !fareResponse.data.fare.vehicleOptions ||
        fareResponse.data.fare.vehicleOptions.length === 0
      ) {
        setFetchError(
          "No vehicle options available for this journey. Please try again or contact customer support."
        );
        return;
      }

      // If we have vehicle options, show the vehicle selection screen
      setShowVehicleOptions(true);
    } catch (error: unknown) {
      // Handle axios error with response data
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                code?: string;
                message?: string;
              };
            };
          };
        };

        if (axiosError.response?.data?.error) {
          const apiError = axiosError.response.data.error;

          // Handle specific error codes from the API
          switch (apiError.code) {
            case "VALIDATION_ERROR":
              setFetchError(
                `Validation Error: ${
                  apiError.message || "Invalid data provided"
                }`
              );
              break;
            case "INVALID_LOCATION":
              setFetchError(
                `Location Error: ${apiError.message || "Invalid locations"}`
              );
              break;
            case "FARE_CALCULATION_ERROR":
              setFetchError(
                `Calculation Error: ${
                  apiError.message || "Could not calculate fare"
                }`
              );
              break;
            default:
              setFetchError(
                apiError.message || "Failed to retrieve fare estimates"
              );
              break;
          }
        }
      } else if (error && typeof error === "object" && "message" in error) {
        // Handle error objects with message property
        setFetchError((error as { message: string }).message);
      } else {
        // Default error message
        setFetchError("Failed to retrieve fare estimates. Please try again.");
      }
    } finally {
      setIsFetching(false);
    }
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: VehicleOption) => {
    setSelectedVehicle(vehicle);
  };

  // Go back to booking form from vehicle selection
  const handleBackToForm = () => {
    setShowVehicleOptions(false);
    setFareData(null);
    setSelectedVehicle(null);
    setShowDetailsForm(false);
  };

  // Go back to vehicle selection from details form
  const handleBackToVehicleSelection = () => {
    setShowDetailsForm(false);
  };

  // Continue to personal details form
  const continueToBooking = () => {
    if (selectedVehicle) {
      setShowDetailsForm(true);
    }
  };

  // Handle booking submission
  const handleSubmitBooking = async (
    personalDetails: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests: string;
    },
    agree: boolean
  ) => {
    if (!agree) {
      setBookingError("You must agree to the terms and conditions to proceed.");
      return;
    }

    if (
      !pickupLocation ||
      !dropoffLocation ||
      !selectedDate ||
      !selectedTime ||
      !selectedVehicle
    ) {
      setBookingError("Missing required booking information");
      return;
    }

    setIsCreatingBooking(true);
    setBookingError(null);

    try {
      // Call booking API
      const bookingResponse = await bookingService.createBooking(
        personalDetails,
        {
          pickupLocation,
          dropoffLocation,
          additionalStops,
          selectedDate,
          selectedTime,
          passengers,
          checkedLuggage,
          handLuggage,
          selectedVehicle,
        }
      );

      // Update success state with the booking ID and notifications if any
      setBookingSuccess({
        show: true,
        bookingId: bookingResponse.bookingId,
        notifications: bookingResponse.details?.notifications || [],
      });

      // Clear form fields by resetting state
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
      setHandLuggage(0);
      setSelectedVehicle(null);
      setShowVehicleOptions(false);
      setShowDetailsForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      setBookingError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Close success dialog and reset form
  const handleCloseSuccessDialog = () => {
    setBookingSuccess({ show: false, bookingId: "", notifications: [] });

    // Reset form and navigate to dashboard page
    setShowVehicleOptions(false);
    setShowDetailsForm(false);
    setFareData(null);
    setSelectedVehicle(null);

    // Use router to navigate to dashboard page
    router.push("/dashboard");
  };

  // Auto-calculate fare when all required information is available
  useEffect(() => {
    // Check if we have the required data and we're not already fetching
    if (
      pickupLocation &&
      dropoffLocation &&
      selectedDate &&
      selectedTime &&
      !isFetching &&
      !fareData &&
      !showVehicleOptions &&
      !showDetailsForm
    ) {
      // Create a lightweight version of the fare calculation that only updates journey info
      const autoCalculateJourneyInfo = async () => {
        try {
          console.log("Auto-calculating journey info...");
          console.log("Using pickup:", pickupLocation?.address);
          console.log("Using dropoff:", dropoffLocation?.address);
          console.log("Auth token exists:", !!authService.getToken());

          // Create request without triggering loading state
          const formattedRequest = {
            locations: {
              pickup: {
                address: pickupLocation.address || "",
                coordinates: {
                  lat: pickupLocation.latitude,
                  lng: pickupLocation.longitude,
                },
              },
              dropoff: {
                address: dropoffLocation.address || "",
                coordinates: {
                  lat: dropoffLocation.latitude,
                  lng: dropoffLocation.longitude,
                },
              },
              additionalStops: additionalStops.map((stop) => ({
                address: stop.address || "",
                coordinates: {
                  lat: stop.latitude,
                  lng: stop.longitude,
                },
              })),
            },
            datetime: {
              date: selectedDate,
              time: selectedTime,
            },
            passengers: {
              count: passengers || 1,
              checkedLuggage: checkedLuggage || 0,
              handLuggage: handLuggage || 0,
            },
          };

          console.log(
            "Auto-calculation request:",
            JSON.stringify(formattedRequest, null, 2)
          );

          // Silently get fare estimate for journey info only
          try {
            const fareResponse = await getFareEstimate(formattedRequest);

            // Check for authentication errors
            if (
              !fareResponse.success &&
              fareResponse.error &&
              (fareResponse.error.code === "AUTH_ERROR" ||
                fareResponse.error.code === "AUTH_REFRESH_REQUIRED")
            ) {
              console.error(
                "Authentication error during auto-calculation:",
                fareResponse.error.message
              );
              // Don't show error - this is a silent calculation
              // But do redirect after a short delay
              setTimeout(() => {
                router.push("/auth/signin");
              }, 500);
              return;
            }

            console.log(
              "Auto-calculation response received:",
              fareResponse.success ? "SUCCESS" : "FAILED"
            );

            if (fareResponse?.success) {
              console.log(
                "Journey data:",
                fareResponse.data?.fare?.journey?.distance_miles,
                fareResponse.data?.fare?.journey?.duration_minutes
              );
            } else {
              console.log("Error in response:", fareResponse.error);
            }

            // Update only the journey info without showing vehicle options
            if (
              fareResponse &&
              fareResponse.success &&
              fareResponse.data &&
              fareResponse.data.fare
            ) {
              // Just update fare data for journey info display
              console.log(
                "Auto-calculation successful, updating journey info:",
                fareResponse.data.fare.journey?.distance_miles,
                fareResponse.data.fare.journey?.duration_minutes
              );

              // Create a copy of the fare data for display
              const displayFareData = { ...fareResponse.data.fare };

              // Make sure journey data exists, add it if not
              if (!displayFareData.journey) {
                displayFareData.journey = {
                  distance_miles: 0,
                  duration_minutes: 0,
                };
              }

              // Update the journey info
              setFareData(displayFareData);
            } else {
              console.warn("Auto-calculation response missing fare data");
            }
          } catch (apiError) {
            console.error("API call error:", apiError);
          }
        } catch (error) {
          // Silently fail - we don't want to show errors for auto-calculation
          console.error("Auto-calculation failed:", error);
        }
      };

      // Run the auto-calculation
      autoCalculateJourneyInfo();
    }
  }, [
    pickupLocation,
    dropoffLocation,
    selectedDate,
    selectedTime,
    isFetching,
    fareData,
    showVehicleOptions,
    showDetailsForm,
    additionalStops,
    passengers,
    checkedLuggage,
    handLuggage,
  ]);

  // Handle location permission errors from the MapComponent
  const handleLocationError = useCallback((error: string | null) => {
    if (error === "PERMISSION_DENIED") {
      setLocationPermission({
        denied: true,
        error: "Location permission denied",
      });
    } else if (error === "POSITION_UNAVAILABLE") {
      setLocationPermission({
        denied: false,
        error: "Unable to determine your position",
      });
    } else if (error === "TIMEOUT") {
      setLocationPermission({
        denied: false,
        error: "Location request timed out",
      });
    } else if (error) {
      setLocationPermission({
        denied: false,
        error,
      });
    } else {
      setLocationPermission({
        denied: false,
        error: null,
      });
    }
  }, []);

  // Function to request location permission again
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      // This will trigger the browser's native permission dialog
      navigator.geolocation.getCurrentPosition(
        () => {
          // Success - reset permission state
          setLocationPermission({
            denied: false,
            error: null,
          });
        },
        (error) => {
          // Error handling - check if permission is denied
          if (error.code === 1) {
            setLocationPermission({
              denied: true,
              error: "Location permission denied",
            });
          } else if (error.code === 2) {
            setLocationPermission({
              denied: false,
              error: "Unable to determine your position",
            });
          } else if (error.code === 3) {
            setLocationPermission({
              denied: false,
              error: "Location request timed out",
            });
          } else {
            setLocationPermission({
              denied: false,
              error: "An error occurred while getting your location",
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-[100vh] w-full flex flex-col pt-2 overflow-hidden">
        {/* Location Permission Banner */}
        {locationPermission.denied && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 mx-2">
            <div className="flex items-start">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Location Access Required
                </h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p>
                    Please enable location access in your browser settings to
                    use the booking system effectively.
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={requestLocationPermission}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Enable Location Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col md:flex-row gap-2 overflow-hidden">
          {!showVehicleOptions ? (
            <>
              {/* Booking Form - Width reduced by 20% */}
              <div className="md:w-[28%] h-fit">
                <BookingForm
                  pickupAddress={pickupAddress}
                  setPickupAddress={setPickupAddress}
                  dropoffAddress={dropoffAddress}
                  setDropoffAddress={setDropoffAddress}
                  stopAddresses={stopAddresses}
                  pickupLocation={pickupLocation}
                  dropoffLocation={dropoffLocation}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  passengers={passengers}
                  setPassengers={setPassengers}
                  checkedLuggage={checkedLuggage}
                  setCheckedLuggage={setCheckedLuggage}
                  handLuggage={handLuggage}
                  setHandLuggage={setHandLuggage}
                  userLocation={userLocation}
                  showVehicleOptions={showVehicleOptions}
                  setFormModified={setFormModified}
                  isFetching={isFetching}
                  fetchError={fetchError}
                  handlePickupLocationSelect={handlePickupLocationSelect}
                  handleDropoffLocationSelect={handleDropoffLocationSelect}
                  handleStopLocationSelect={handleStopLocationSelect}
                  updateStopAddress={updateStopAddress}
                  addStop={addStop}
                  removeStop={removeStop}
                  calculateFare={calculateFare}
                  getPassengerLuggageSummary={getPassengerLuggageSummary}
                  disabled={locationPermission.denied}
                />
              </div>

              {/* Map Section - Width increased proportionally */}
              <div className="flex-1 md:w-[72%]">
                {showMap ? (
                  locationPermission.denied ? (
                    <div className="h-full max-h-[calc(100vh-6rem)] rounded-lg overflow-hidden border shadow-sm flex items-center justify-center bg-muted/20">
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                          <MapPin className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          Location Access Required
                        </h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          To use the map and see your current location, please
                          enable location services in your browser.
                        </p>
                        <Button
                          onClick={requestLocationPermission}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Enable Location Access
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full max-h-[calc(100vh-6rem)] rounded-lg overflow-hidden border shadow-sm">
                      <StableMapComponent
                        className="h-full"
                        pickupLocation={pickupLocation}
                        dropoffLocation={dropoffLocation}
                        stops={additionalStops}
                        showCurrentLocation={true}
                        onUserLocationChange={setUserLocation}
                        passMapRef={handleMapRef}
                        onLocationError={handleLocationError}
                      />
                    </div>
                  )
                ) : null}
              </div>
            </>
          ) : (
            <>
              {!showDetailsForm ? (
                <div className="flex w-full h-full flex-col lg:flex-row gap-4">
                  {/* Left panel: Width increased */}
                  <div className="w-full lg:w-[29%]">
                    <Card className="border shadow-sm">
                      <CardContent className="p-3 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-base font-semibold">
                            Journey Details
                          </h2>
                          <Button
                            variant="ghost"
                            onClick={handleBackToForm}
                            size="sm"
                            className="h-8 text-sm p-1.5"
                          >
                            Back
                          </Button>
                        </div>

                        {/* Pickup field */}
                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Pickup Location
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {pickupLocation?.address || "Not specified"}
                          </div>
                        </div>

                        {/* Dropoff field */}
                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Dropoff Location
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {dropoffLocation?.address || "Not specified"}
                          </div>
                        </div>

                        {/* Additional stops */}
                        {additionalStops.length > 0 && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Additional Stops
                            </label>
                            {additionalStops.map((stop, index) => (
                              <div
                                key={index}
                                className="p-2 bg-muted/40 rounded-md mb-1 text-sm"
                              >
                                {stop.address}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Date and time */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block text-muted-foreground">
                              Date
                            </label>
                            <p className="text-sm">
                              {selectedDate
                                ? new Date(selectedDate).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "Not selected"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block text-muted-foreground">
                              Time
                            </label>
                            <p className="text-sm">
                              {selectedTime || "Not selected"}
                            </p>
                          </div>
                        </div>

                        {/* Passengers & Luggage */}
                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Passengers & Luggage
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {getPassengerLuggageSummary()}
                          </div>
                        </div>

                        {/* Journey details */}
                        <div className="mb-3">
                          <label className="text-xs font-medium mb-1 block text-muted-foreground">
                            Journey Info
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">
                                Distance:
                              </span>
                              <span className="font-medium">
                                {fareData?.journey?.distance_miles
                                  ? `${fareData.journey.distance_miles.toFixed(
                                      1
                                    )} miles`
                                  : "Not available"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
                              <span className="font-medium">
                                {fareData?.journey?.duration_minutes
                                  ? `${fareData.journey.duration_minutes} min`
                                  : "Not available"}
                              </span>
                            </div>

                            {/* Fare Notifications */}
                            {fareData &&
                              fareData.notifications &&
                              fareData.notifications.length > 0 && (
                                <div className="mt-2 border-t pt-2 border-border/40">
                                  <div className="text-muted-foreground mb-1 text-xs font-medium">
                                    Special Conditions:
                                  </div>
                                  <ul className="space-y-1">
                                    {fareData.notifications.map(
                                      (notification, index) => (
                                        <li
                                          key={index}
                                          className="text-xs flex items-start"
                                        >
                                          <span className="bg-blue-100 text-blue-700 rounded-full w-4 h-4 flex items-center justify-center mr-1.5 mt-0.5 flex-shrink-0">
                                            i
                                          </span>
                                          <span>{notification}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Re-Calculate Button - Increase height and font size by 40% */}
                        <Button
                          variant={formModified ? "default" : "outline"}
                          className="w-full text-sm h-10"
                          onClick={() => {
                            if (formModified) {
                              calculateFare();
                            } else {
                              handleBackToForm();
                            }
                          }}
                          disabled={isFetching}
                        >
                          {isFetching
                            ? "Calculating..."
                            : formModified
                            ? "Re-Calculate Fare"
                            : "Back to Form"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Middle panel: Vehicle selection */}
                  <div className="w-full lg:w-[42%] max-h-[calc(70vh + 70px)] lg:max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                    <div className="p-3 border-b">
                      <h2 className="text-base font-semibold">
                        Select Vehicle
                      </h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-3 h-full">
                      {/* Add CSS to resize vehicle cards by 40% */}
                      <style jsx global>{`
                        /* Make vehicle cards larger and better designed */
                        .vehicle-card {
                          height: 160px !important;
                          max-height: 160px !important;
                          margin-bottom: 1rem !important;
                          padding: 1rem !important;
                          border-radius: 0.5rem !important;
                          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
                          border: 1px solid #e5e7eb !important;
                          transition: all 0.2s ease-in-out !important;
                          position: relative !important;
                        }
                        .vehicle-card:hover {
                          transform: translateY(-2px) !important;
                          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                        }
                        .vehicle-card.selected {
                          border-color: #3b82f6 !important;
                          background-color: #eff6ff !important;
                        }
                        .vehicle-card.selected:before {
                          content: "✓" !important;
                          position: absolute !important;
                          top: -10px !important;
                          right: -10px !important;
                          width: 24px !important;
                          height: 24px !important;
                          background-color: #3b82f6 !important;
                          color: white !important;
                          border-radius: 50% !important;
                          display: flex !important;
                          align-items: center !important;
                          justify-content: center !important;
                          font-weight: bold !important;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
                          z-index: 10 !important;
                          font-size: 12px !important;
                        }
                        /* Fix vehicle images */
                        .vehicle-image {
                          display: block !important;
                          position: relative !important;
                          width: 80px !important;
                          height: 50px !important;
                          margin-right: 1rem !important;
                        }
                        .vehicle-image img {
                          object-fit: contain !important;
                          max-height: 50px !important;
                        }
                        /* Adjust text sizes */
                        .vehicle-card h3 {
                          font-size: 1.125rem !important;
                          margin-bottom: 0.35rem !important;
                        }
                        .vehicle-card p,
                        .vehicle-card span {
                          font-size: 1rem !important;
                        }
                        /* Adjust vehicle card content spacing */
                        .vehicle-card-content {
                          gap: 0.5rem !important;
                          display: flex !important;
                          flex-direction: column !important;
                          justify-content: space-between !important;
                          height: 100% !important;
                        }
                        .vehicle-card .vehicle-details {
                          display: flex !important;
                          justify-content: space-between !important;
                          width: 100% !important;
                        }
                      `}</style>

                      {fareData && (
                        <VehicleSelection
                          fareData={fareData}
                          pickupLocation={pickupLocation}
                          dropoffLocation={dropoffLocation}
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          passengers={passengers}
                          checkedLuggage={checkedLuggage}
                          handLuggage={handLuggage}
                          onBack={handleBackToForm}
                          onSelectVehicle={handleVehicleSelect}
                          layout="vertical"
                        />
                      )}
                    </div>

                    {/* Continue button - Increase size by 40% */}
                    {selectedVehicle && (
                      <div className="px-3 py-3 border-t">
                        <Button
                          onClick={continueToBooking}
                          className="w-full text-sm h-10"
                        >
                          Continue with {selectedVehicle.name}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right panel: Map - width reduced by 10% */}
                  <div className="w-full lg:w-[25%] h-[40vh] lg:h-full lg:max-h-[calc(100vh-6rem)] hidden lg:block">
                    {showMap ? (
                      <div className="h-full rounded-lg overflow-hidden border shadow-sm">
                        <StableMapComponent
                          className="h-full"
                          pickupLocation={pickupLocation}
                          dropoffLocation={dropoffLocation}
                          stops={additionalStops}
                          showCurrentLocation={true}
                          onUserLocationChange={setUserLocation}
                          passMapRef={handleMapRef}
                          onLocationError={handleLocationError}
                        />
                      </div>
                    ) : (
                      <div className="h-full rounded-lg overflow-hidden border shadow-sm flex items-center justify-center">
                        <div className="text-muted-foreground">
                          Loading map...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Personal details form - simplified layout
                <div className="flex flex-col lg:flex-row w-full h-full gap-4">
                  <div className="w-full lg:w-2/3 max-h-[calc(100vh-5rem)] relative">
                    {selectedVehicle && (
                      <div className="h-full overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto pr-2 pb-4 relative">
                          <PersonalDetailsForm
                            selectedVehicle={selectedVehicle}
                            pickupLocation={pickupLocation}
                            dropoffLocation={dropoffLocation}
                            additionalStops={additionalStops}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            passengers={passengers}
                            checkedLuggage={checkedLuggage}
                            handLuggage={handLuggage}
                            onBack={handleBackToVehicleSelection}
                            onSubmit={handleSubmitBooking}
                            isSubmitting={isCreatingBooking}
                            error={bookingError}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Map display - height matching second screen */}
                  <div className="w-full lg:w-1/3 h-[40vh] lg:h-full lg:max-h-[calc(100vh-6rem)] hidden lg:block">
                    {showMap ? (
                      <div className="h-full rounded-lg overflow-hidden border shadow-sm">
                        <StableMapComponent
                          className="h-full"
                          pickupLocation={pickupLocation}
                          dropoffLocation={dropoffLocation}
                          stops={additionalStops}
                          showCurrentLocation={true}
                          onUserLocationChange={setUserLocation}
                          passMapRef={handleMapRef}
                          onLocationError={handleLocationError}
                        />
                      </div>
                    ) : (
                      <div className="h-full rounded-lg overflow-hidden border shadow-sm flex items-center justify-center">
                        <div className="text-muted-foreground">
                          Loading map...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Success Dialog - no changes */}
        <Dialog
          open={bookingSuccess.show}
          onOpenChange={(open) => !open && handleCloseSuccessDialog()}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="bg-emerald-100 rounded-full p-1.5">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                Booking Confirmed
              </DialogTitle>
              <DialogDescription className="text-base">
                Your booking has been successfully created and is now being
                processed
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="mb-2 text-sm font-medium">Booking Reference:</p>
              <div className="text-lg font-bold font-mono bg-primary/10 py-3 px-4 rounded-md text-center mb-4">
                {bookingSuccess.bookingId}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-4">
                <h4 className="font-medium text-slate-800 mb-2">
                  What happens next?
                </h4>
                <p className="text-sm text-slate-700">
                  One of our agents will contact you shortly to confirm your
                  booking details. Please keep your phone available.
                </p>
              </div>

              {/* Display notifications if any */}
              {bookingSuccess.notifications &&
                bookingSuccess.notifications.length > 0 && (
                  <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Important Information:
                    </p>
                    <ul className="text-sm space-y-1 text-amber-700">
                      {bookingSuccess.notifications.map(
                        (notification, index) => (
                          <li key={index} className="flex items-start gap-1.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5"></span>
                            <span>{notification}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              <p className="mt-4 text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with
                all the booking details.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleCloseSuccessDialog} className="w-full">
                Return to Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
