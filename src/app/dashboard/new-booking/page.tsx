"use client";

import { useState, useEffect, memo, useRef, useCallback, useMemo } from "react";
import MapComponent from "@/components/map/MapComponent";
import { Location } from "@/components/map/MapComponent";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
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
import { useRouter, useSearchParams } from "next/navigation";

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
      console.log(
        "StableMapComponent: Props changed, updating refs and map if available"
      );
      propsRef.current = {
        pickupLocation,
        dropoffLocation,
        stops,
      };

      // If map interface is available, update the locations without re-rendering
      if (mapRef.current) {
        console.log(
          "StableMapComponent: Updating map locations from ref update"
        );
        mapRef.current.updateLocations(pickupLocation, dropoffLocation, stops);
      }
    }, [pickupLocation, dropoffLocation, stops]);

    // Register the map reference - this callback should never change
    const handleMapRef = useCallback(
      (mapInstance: MapInterface) => {
        console.log("StableMapComponent: Map instance received");
        mapRef.current = mapInstance;

        // Initial update of locations after getting map ref
        if (mapInstance) {
          const { pickupLocation, dropoffLocation, stops } = propsRef.current;
          console.log("StableMapComponent: Initializing map with locations");
          mapInstance.updateLocations(pickupLocation, dropoffLocation, stops);

          // Pass the map instance to the parent component if passMapRef is provided
          if (passMapRef) {
            console.log("StableMapComponent: Passing map instance to parent");
            passMapRef(mapInstance);
          }
        }
      },
      [passMapRef]
    );

    // Create a single map component instance that never rerenders
    const mapComponent = useMemo(() => {
      console.log("Creating map component - this should only happen once");
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
    distance_km?: number;
    duration_min?: number;
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
  }>({ show: false, bookingId: "" });

  // Form modified state
  const [formModified, setFormModified] = useState<boolean>(false);

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
        } catch (e) {
          console.error("Error parsing pickup location from URL:", e);
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
        } catch (e) {
          console.error("Error parsing dropoff location from URL:", e);
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
        } catch (e) {
          console.error("Error parsing stops from URL:", e);
        }
      }

      // Restore date
      if (dateParam) {
        try {
          const date = new Date(dateParam);
          if (!isNaN(date.getTime())) {
            setSelectedDate(date);
          }
        } catch (e) {
          console.error("Error parsing date from URL:", e);
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
    } catch (error) {
      console.error("Error restoring state from URL:", error);
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
      console.log("IMMEDIATE UPDATE: Location changed - forcing route draw");

      // Use setTimeout with 0ms to ensure this runs after React state updates
      setTimeout(() => {
        if (mapInstanceRef.current) {
          console.log(
            "IMMEDIATE UPDATE: Executing map update with current locations"
          );
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
      console.log("Map interface captured");
      mapInstanceRef.current = mapInstance;

      // If we already have locations loaded from URL parameters, draw the route
      if (mapInstance && pickupLocation && dropoffLocation) {
        console.log("Drawing initial route from URL parameters");
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
        console.log("Updating map after clearing pickup location");
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
      console.log("Updating map with new pickup location:", location.address);
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
        console.log("Updating map after clearing dropoff location");
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
      console.log("Updating map with new dropoff location:", location.address);
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
        console.log("Updating map after removing stop");
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
      console.log("Updating map with new stop location:", location.address);
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
      console.log("Updating map after removing stop at index:", index);
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
    // Validate required fields
    if (!pickupLocation || !dropoffLocation) {
      setFetchError("Please specify pickup and dropoff locations");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setFetchError("Please specify pickup date and time");
      return;
    }

    setIsFetching(true);
    setFetchError(null); // Clear previous errors
    // Reset the form modified state since we're recalculating
    setFormModified(false);

    // Log data being sent for debugging
    console.log(
      "%c 🚀 CALCULATE FARE BUTTON CLICKED 🚀",
      "background: #4CAF50; color: white; font-size: 20px; font-weight: bold; padding: 10px;"
    );
    console.log("Data being sent to getFareEstimate:");
    console.log("Pickup:", pickupLocation);
    console.log("Dropoff:", dropoffLocation);
    console.log("Stops:", additionalStops);
    console.log("Date:", selectedDate);
    console.log("Time:", selectedTime);
    console.log("Passengers:", passengers);
    console.log("Checked Luggage:", checkedLuggage);
    console.log("Hand Luggage:", handLuggage);

    try {
      console.log("🔍 About to call getFareEstimate function...");
      const fareResponse = await getFareEstimate(
        pickupLocation,
        dropoffLocation,
        additionalStops,
        selectedDate,
        selectedTime,
        passengers,
        checkedLuggage,
        handLuggage
      );

      console.log("✅ getFareEstimate returned with data:", {
        responseReceived: !!fareResponse,
        responseType: typeof fareResponse,
        isObject: fareResponse && typeof fareResponse === "object",
        hasVehicleOptions: fareResponse && "vehicleOptions" in fareResponse,
        vehicleOptionsCount: fareResponse?.vehicleOptions?.length || 0,
        vehicleOptionsSample: fareResponse?.vehicleOptions?.[0]
          ? {
              id: fareResponse.vehicleOptions[0].id,
              name: fareResponse.vehicleOptions[0].name,
              price: fareResponse.vehicleOptions[0].price,
            }
          : null,
        fullResponse: fareResponse,
      });

      // Make sure we have valid data before proceeding
      if (
        !fareResponse ||
        !fareResponse.vehicleOptions ||
        fareResponse.vehicleOptions.length === 0
      ) {
        console.error("Invalid fare response received:", fareResponse);
        setFetchError(
          "Received invalid fare data from server. Please try again."
        );
        return;
      }

      // Log the fare data we're about to use
      console.log(
        "Setting fare data in state:",
        JSON.stringify(fareResponse, null, 2)
      );

      // The API response structure has the fare data inside data.fare
      // Transform it to match our expected structure if needed
      const formattedFareData: FareResponse = {
        estimatedDistance: fareResponse.estimatedDistance || 0,
        estimatedTime: fareResponse.estimatedTime || 0,
        fare: fareResponse.fare || { baseFare: 0, currency: "£", total: 0 },
        vehicleOptions: fareResponse.vehicleOptions || [],
      };

      setFareData(formattedFareData);
      setShowVehicleOptions(true);
    } catch (error: unknown) {
      console.error("❌ Error fetching fare estimates:", error);

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

  // Handle creating booking
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

    // Check if we have all required booking information
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

    // Clear previous errors
    setBookingError(null);
    setIsCreatingBooking(true);

    try {
      console.log("Submitting booking...");

      // Step 1: Submit booking for verification
      const verificationDetails = await bookingService.createBooking(
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

      console.log("Booking verification received:", verificationDetails);

      // Step 2: Confirm booking with verification token
      const confirmationResponse = await bookingService.confirmBooking(
        verificationDetails
      );

      console.log("Booking confirmed:", confirmationResponse);

      // Show success message
      if (confirmationResponse.success && confirmationResponse.data) {
        setBookingSuccess({
          show: true,
          bookingId: confirmationResponse.data.bookingId,
        });
      } else {
        throw new Error("Booking confirmation failed");
      }
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
    setBookingSuccess({ show: false, bookingId: "" });

    // Reset form and navigate to my bookings page
    setShowVehicleOptions(false);
    setShowDetailsForm(false);
    setFareData(null);
    setSelectedVehicle(null);

    // Use router to navigate to "my bookings" page
    router.push("/dashboard/my-bookings");
  };

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-4.5rem)] w-full flex flex-col pt-2">
        {/* Main content area */}
        <div className="flex-1 flex flex-col md:flex-row gap-2">
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
                />
              </div>

              {/* Map Section - Width increased proportionally */}
              <div className="flex-1 md:w-[72%]">
                {showMap ? (
                  <div className="h-full max-h-[calc(100vh-6rem)] rounded-lg overflow-hidden border shadow-sm">
                    <StableMapComponent
                      className="h-full"
                      pickupLocation={pickupLocation}
                      dropoffLocation={dropoffLocation}
                      stops={additionalStops}
                      showCurrentLocation={true}
                      onUserLocationChange={setUserLocation}
                      passMapRef={handleMapRef}
                    />
                  </div>
                ) : (
                  <div className="h-full rounded-lg overflow-hidden border shadow-sm flex items-center justify-center">
                    <div className="text-muted-foreground">Loading map...</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {!showDetailsForm ? (
                <div className="flex w-full h-full gap-4">
                  {/* Left panel: Width increased by 30% */}
                  <div className="w-[24%] h-fit">
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

                        {/* Date & Time */}
                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Date & Time
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {selectedDate
                              ? format(selectedDate, "EEE, MMM dd, yyyy")
                              : ""}{" "}
                            at {selectedTime}
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

                        {/* Distance & Duration */}
                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Journey Info
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">
                                Distance:
                              </span>
                              <span className="font-medium">
                                {fareData && fareData.estimatedDistance
                                  ? `${fareData.estimatedDistance.toFixed(
                                      1
                                    )} km`
                                  : fareData && fareData.distance_km
                                  ? `${fareData.distance_km.toFixed(1)} km`
                                  : "Calculating..."}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Duration:
                              </span>
                              <span className="font-medium">
                                {fareData && fareData.estimatedTime
                                  ? `${fareData.estimatedTime} min`
                                  : fareData && fareData.duration_min
                                  ? `${fareData.duration_min} min`
                                  : "~30 min"}
                              </span>
                            </div>
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

                  {/* Middle panel: Vehicle selection - adjusted width */}
                  <div className="w-[42%] h-full max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
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

                  {/* Right panel: Map - width reduced */}
                  <div className="w-[30%] h-full max-h-[calc(100vh-6rem)]">
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
                // Personal details form - increase size by 40%
                <div className="flex flex-col md:flex-row w-full h-full gap-8">
                  <div className="md:w-2/3">
                    {selectedVehicle && (
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
                    )}
                  </div>

                  {/* Map display for context in personal details view */}
                  <div className="md:w-1/3 h-full hidden md:block">
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="bg-primary/20 rounded-full p-1">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                Booking Confirmed
              </DialogTitle>
              <DialogDescription>
                Your booking has been successfully created
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="mb-2 text-sm">Booking Reference:</p>
              <div className="text-lg font-bold font-mono bg-primary/10 py-3 px-4 rounded-md text-center">
                {bookingSuccess.bookingId}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with
                all the booking details.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleCloseSuccessDialog} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
