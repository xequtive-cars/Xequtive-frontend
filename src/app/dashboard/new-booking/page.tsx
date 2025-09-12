"use client";

import { useState, useEffect, memo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "@/components/map/MapComponent";
import { Location } from "@/components/map/MapComponent";
import { Check, MapPin, ArrowLeft } from "lucide-react";
import BookingForm from "@/components/booking/BookingForm";
import { PersonalDetailsForm } from "@/components/booking/personal-details-form";
import VehicleSelection from "@/components/booking/vehicle-selection";
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

// Import types from booking components
import type { FareResponse, VehicleOption } from "@/components/booking/common/types";

// Create an interface for the map methods
interface MapInterface {
  updateLocations: (
    newPickup: Location | null,
    newDropoff: Location | null,
    newStops?: Location[]
  ) => void;
}

// Define the FareRequest interface for type safety
interface FareRequest {
  locations: {
    pickup: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    dropoff: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    stops: Array<{
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    }>;
  };
  datetime: {
    date: string;
    time: string;
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    mediumLuggage: number;
    handLuggage: number;
    babySeat: number;
    childSeat: number;
    boosterSeat: number;
    wheelchair: number;
  };
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

    // Return the map component with updated props
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
  },
  // Custom equality function for React.memo that only triggers re-render when actual location values change
  (prevProps: any, nextProps: any) => {
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

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Validate and correct time format
const validateTime = (time: string): string => {
  // If no time is provided, default to a reasonable time (not 12:00)
  // Since we need 24 hours advance notice, default to 00:00 (midnight)
  if (!time) return "00:00";

  // Split time into hours and minutes
  const [hours, minutes] = time.split(":").map(Number);

  // Validate and correct hours (0-23)
  const validHours = Math.min(Math.max(0, Math.floor(hours)), 23);

  // Validate and correct minutes (0-59)
  const validMinutes = Math.min(Math.max(0, Math.floor(minutes)), 59);

  // Format back to HH:mm with leading zeros
  return `${validHours.toString().padStart(2, "0")}:${validMinutes
    .toString()
    .padStart(2, "0")}`;
};

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

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
  
  // New state variables for one-way, hourly, and return booking system
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [returnTime, setReturnTime] = useState<string>("");
  const [bookingType, setBookingType] = useState<'one-way' | 'hourly' | 'return'>('one-way');
  const [hours, setHours] = useState<number>(3);
  const [multipleVehicles, setMultipleVehicles] = useState<number>(1);

  // Debug logging for hours state
  useEffect(() => {
    // Hours state changed
  }, [hours, bookingType]);

                // Ensure hours are properly set when booking type changes to hourly
  useEffect(() => {
    if (bookingType === 'hourly' && (hours < 3 || hours > 12)) {
      setHours(3);
    }
  }, [bookingType, hours]);

  // Debug logging for fare calculation
  useEffect(() => {
    if (bookingType === 'hourly') {
      // Hourly booking state
    }
  }, [hours, bookingType]);


  // Passenger/luggage states
  const [passengers, setPassengers] = useState<number>(1);
  const [checkedLuggage, setCheckedLuggage] = useState<number>(0);
  const [mediumLuggage, setMediumLuggage] = useState<number>(0);
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
    referenceNumber?: string;
    notifications: string[];
  }>({
    show: false,
    bookingId: "",
    referenceNumber: "",
    notifications: [],
  });

  // UI states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formModified, setFormModified] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<{
    denied: boolean;
    error: string | null;
  }>({
    denied: false,
    error: null,
  });

  // Additional requests state from Redux
  const booking = useAppSelector((state) => state.booking);
  const babySeat = booking.babySeat || 0;
  const childSeat = booking.childSeat || 0;
  const boosterSeat = booking.boosterSeat || 0;
  const wheelchair = booking.wheelchair || 0;

  // Add current step state
  const [currentStep, setCurrentStep] = useState("location");

  // Add state to track form validity
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDetailsFormValid, setIsDetailsFormValid] = useState(false);

  // Get date from search params
  const bookingDate = searchParams.get("date");

  // Geocode function to convert address to coordinates
  const geocodeAddress = async (address: string, type: 'pickup' | 'dropoff') => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        console.error('Mapbox token not found');
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&country=gb&limit=1`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const [longitude, latitude] = feature.center;
          
          const location = {
            address: feature.place_name || address,
            latitude,
            longitude,
          };

          if (type === 'pickup') {
            setPickupLocation(location);
          } else if (type === 'dropoff') {
            setDropoffLocation(location);
          }
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

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
      const mlParam = searchParams.get("ml"); // medium luggage
      const hlParam = searchParams.get("hl"); // hand luggage
      const stopsParam = searchParams.get("stops");

      // Restore pickup location - handle both JSON objects and simple strings
      if (pickup) {
        try {
          // Try to parse as JSON first (for complex objects)
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
          // If JSON parsing fails, treat as simple string address
          const pickupAddress = decodeURIComponent(pickup);
          if (pickupAddress && pickupAddress.trim()) {
            setPickupAddress(pickupAddress);
            // Geocode the address to get coordinates
            geocodeAddress(pickupAddress, 'pickup');
          }
        }
      }

      // Restore dropoff location - handle both JSON objects and simple strings
      if (dropoff) {
        try {
          // Try to parse as JSON first (for complex objects)
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
          // If JSON parsing fails, treat as simple string address
          const dropoffAddress = decodeURIComponent(dropoff);
          if (dropoffAddress && dropoffAddress.trim()) {
            setDropoffAddress(dropoffAddress);
            // Geocode the address to get coordinates
            geocodeAddress(dropoffAddress, 'dropoff');
          }
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

      if (mlParam) {
        const ml = parseInt(mlParam, 10);
        if (!isNaN(ml) && ml >= 0) {
          setMediumLuggage(ml);
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
        // Only include valid stops (non-zero coordinates and non-empty address)
        const validStops = additionalStops.filter(
          (stop) => stop.address && stop.address.trim() !== "" && stop.latitude !== 0 && stop.longitude !== 0
        );
        
        // Debug logging removed to prevent infinite loops
        
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
      currentParams.set("ml", mediumLuggage.toString());
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
      mediumLuggage !== 0 ||
      handLuggage !== 0;

    if (hasNonLocationData) {
      updateNonLocationParams();
    }
  }, [
    selectedDate,
    selectedTime,
    passengers,
    checkedLuggage,
    mediumLuggage,
    handLuggage,
  ]);

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

  // Stable user location change handler
  const handleUserLocationChange = useCallback((location: { latitude: number; longitude: number } | null) => {
    setUserLocation(location);
  }, []);

  // Handle pickup location selection
  const handlePickupLocationSelect = (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => {
    // Check if this is a clear operation (empty address or zero coordinates)
    if (
      !location.address ||
      location.address.trim() === "" ||
      (location.longitude === 0 && location.latitude === 0)
    ) {
      // Immediately set to null to ensure map updates right away
      setPickupLocation(null);
      setPickupAddress("");

      // Clear pickup parameter from URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        params.delete('pickup');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      }

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

    // Ensure coordinates have sufficient precision
    const preciseLat = parseFloat(location.latitude.toFixed(6));
    const preciseLng = parseFloat(location.longitude.toFixed(6));

    // Check if this location is too similar to the dropoff location
    if (dropoffLocation) {
      const latDiff = Math.abs(preciseLat - dropoffLocation.latitude);
      const lngDiff = Math.abs(preciseLng - dropoffLocation.longitude);
      
      if (latDiff < 0.001 && lngDiff < 0.001) {
        toast({
          title: "Invalid location selection",
          description: "Pickup and dropoff locations cannot be the same. Please select different locations.",
          variant: "destructive",
        });
        return;
      }
    }

    // Update pickup location
    const newPickupLocation = {
      address: location.address,
      latitude: preciseLat,
      longitude: preciseLng,
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
      location.address.trim() === "" ||
      (location.longitude === 0 && location.latitude === 0)
    ) {
      // Immediately set to null to ensure map updates right away
      setDropoffLocation(null);
      setDropoffAddress("");

      // Clear dropoff parameter from URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        params.delete('dropoff');
        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      }

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

    // Ensure coordinates have sufficient precision
    const preciseLat = parseFloat(location.latitude.toFixed(6));
    const preciseLng = parseFloat(location.longitude.toFixed(6));

    // Check if this location is too similar to the pickup location
    if (pickupLocation) {
      const latDiff = Math.abs(preciseLat - pickupLocation.latitude);
      const lngDiff = Math.abs(preciseLng - pickupLocation.longitude);
      
      if (latDiff < 0.001 && lngDiff < 0.001) {
        toast({
          title: "Invalid location selection",
          description: "Pickup and dropoff locations cannot be the same. Please select different locations.",
          variant: "destructive",
        });
        return;
      }
    }

    // Update dropoff location
    const newDropoffLocation = {
      address: location.address,
      latitude: preciseLat,
      longitude: preciseLng,
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

  // Handle stop location selection
  const handleStopLocationSelect = (
    index: number,
    location: { address: string; longitude: number; latitude: number }
  ) => {
    // Check if this is a clear operation (empty address or zero coordinates)
    if (
      !location.address ||
      location.address.trim() === "" ||
      (location.longitude === 0 && location.latitude === 0)
    ) {
      // This is a clear operation - just clear the address at the index without removing the stop

      // Validate index is within bounds for stopAddresses
      if (index < 0 || index >= stopAddresses.length) {
        return;
      }

      // Update the stop address at the specific index only
      const newStopAddresses = [...stopAddresses];
      newStopAddresses[index] = ""; // Clear only this specific address
      setStopAddresses(newStopAddresses);

      // Update additionalStops to reflect the cleared stop (empty coordinates) - just this specific one
      const newAdditionalStops = [...additionalStops];

      // Make sure the index exists in additionalStops
      while (newAdditionalStops.length <= index) {
        newAdditionalStops.push({
          address: "",
          latitude: 0,
          longitude: 0,
        });
      }

      // Clear the coordinates at the index only - don't touch other stops
      newAdditionalStops[index] = {
        address: "",
        latitude: 0,
        longitude: 0,
      };
      setAdditionalStops(newAdditionalStops);

      // Update map immediately
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(
          pickupLocation,
          dropoffLocation,
          newAdditionalStops
        );
      }
    } else {
      // This is a valid location selection

      // Validate index is within bounds for stopAddresses
      if (index < 0 || index >= stopAddresses.length) {
        return;
      }

      // Update the stop address at the specific index
      const newStopAddresses = [...stopAddresses];
      newStopAddresses[index] = location.address;
      setStopAddresses(newStopAddresses);

      // Update additionalStops with the new location
      const newAdditionalStops = [...additionalStops];

      // Make sure the index exists in additionalStops
      while (newAdditionalStops.length <= index) {
        newAdditionalStops.push({
          address: "",
          latitude: 0,
          longitude: 0,
        });
      }

      // Set the new location at the index
      newAdditionalStops[index] = {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      setAdditionalStops(newAdditionalStops);

      // Debug logging removed to prevent infinite loops

      // Update map immediately
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(
          pickupLocation,
          dropoffLocation,
          newAdditionalStops
        );
      }
    }

    // Mark form as modified if vehicle options are being shown
    if (showVehicleOptions) {
      setFormModified(true);
    }
  };

  // Add a new stop field
  const addStop = () => {
    setStopAddresses([...stopAddresses, ""]);
    // Also add an empty stop to additionalStops to keep arrays in sync
    setAdditionalStops([...additionalStops, {
      address: "",
      latitude: 0,
      longitude: 0,
    }]);
  };

  // Remove a stop from the list - completely rewritten
  const removeStop = (indexToRemove: number) => {
    try {
      // Sanity check on index bounds
      if (indexToRemove < 0 || indexToRemove >= stopAddresses.length) {
        return;
      }

      // Create a brand new array without the item at indexToRemove
      const newStopAddresses = stopAddresses.filter(
        (_, idx) => idx !== indexToRemove
      );

      // Create a brand new additionalStops array without the item at indexToRemove
      const newAdditionalStops = additionalStops.filter(
        (_, idx) => idx !== indexToRemove
      );

      // Update the states
      setStopAddresses(newStopAddresses);
      setAdditionalStops(newAdditionalStops);

      // Update the map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateLocations(
          pickupLocation,
          dropoffLocation,
          newAdditionalStops
        );
      }

      // Set form as modified
      setFormModified(true);
    } catch {
      // Error handling silently
    }
  };

  // Update stop address state
  const updateStopAddress = (index: number, value: string) => {
    const newStopAddresses = [...stopAddresses];
    newStopAddresses[index] = value;
    setStopAddresses(newStopAddresses);
  };

  // Reorder stops with drag-and-drop
  const reorderStops = (fromIndex: number, toIndex: number) => {
    // Validate indexes
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= stopAddresses.length ||
      toIndex >= stopAddresses.length
    ) {
      return;
    }

    // Reorder stop addresses
    const newStopAddresses = [...stopAddresses];
    const [removed] = newStopAddresses.splice(fromIndex, 1);
    newStopAddresses.splice(toIndex, 0, removed);
    setStopAddresses(newStopAddresses);

    // Reorder additional stops locations
    const newAdditionalStops = [...additionalStops];
    // Ensure the additionalStops array is at least as long as stopAddresses
    while (newAdditionalStops.length < stopAddresses.length) {
      newAdditionalStops.push({
        address: "",
        latitude: 0,
        longitude: 0,
      });
    }

    // Only attempt to reorder if fromIndex is valid
    if (fromIndex < newAdditionalStops.length) {
      const [removedStop] = newAdditionalStops.splice(fromIndex, 1);
      newAdditionalStops.splice(toIndex, 0, removedStop);
      setAdditionalStops(newAdditionalStops);
    }

    // Update map immediately when stops are reordered
    if (mapInstanceRef.current) {
      mapInstanceRef.current.updateLocations(
        pickupLocation,
        dropoffLocation,
        newAdditionalStops
      );
    }
  };

  // Get passenger and luggage summary
  const getPassengerLuggageSummary = () => {
    if (
      passengers === 0 &&
      checkedLuggage === 0 &&
      mediumLuggage === 0 &&
      handLuggage === 0
    ) {
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
        `${checkedLuggage} large ${checkedLuggage === 1 ? "luggage" : "luggage"}`
      );
    }
    if (mediumLuggage > 0) {
      luggageParts.push(
        `${mediumLuggage} medium ${mediumLuggage === 1 ? "luggage" : "luggage"}`
      );
    }
    if (handLuggage > 0) {
      luggageParts.push(
        `${handLuggage} small ${handLuggage === 1 ? "luggage" : "luggage"}`
      );
    }

    if (luggageParts.length > 0) {
      parts.push(`${luggageParts.join(", ")}`);
    }

    return parts.join(" with ");
  };

  // Handle calculate fare button
  const handleCalculateFare = async () => {
    try {
      setIsFetching(true);
      setFetchError(null);

      // Check if we have the required location data
      if (!pickupLocation) {
        toast({
          title: "Missing pickup location",
          description: "Please provide a pickup location.",
          variant: "destructive",
        });
        setIsFetching(false);
        return;
      }

      // For hourly bookings, dropoff location is optional
      // For one-way and return bookings, dropoff location is required
      if (bookingType !== 'hourly' && !dropoffLocation) {
        toast({
          title: "Missing dropoff location",
          description: "Please provide a dropoff location for one-way and return bookings.",
          variant: "destructive",
        });
        setIsFetching(false);
        return;
      }

      // Validate that coordinates are not zero or invalid
      if (pickupLocation.latitude === 0 && pickupLocation.longitude === 0) {
        toast({
          title: "Invalid pickup location",
          description: "Please select a valid pickup location.",
          variant: "destructive",
        });
        setIsFetching(false);
        return;
      }

      if (dropoffLocation && (dropoffLocation.latitude === 0 && dropoffLocation.longitude === 0)) {
        toast({
          title: "Invalid dropoff location",
          description: "Please select a valid dropoff location.",
          variant: "destructive",
        });
        setIsFetching(false);
        return;
      }

      // Check if locations are too similar (within 100 meters) - only for non-hourly bookings
      if (bookingType !== 'hourly' && dropoffLocation && pickupLocation) {
        const latDiff = Math.abs(pickupLocation.latitude - dropoffLocation.latitude);
        const lngDiff = Math.abs(pickupLocation.longitude - dropoffLocation.longitude);
        
        if (latDiff < 0.001 && lngDiff < 0.001) {
          toast({
            title: "Locations too similar",
            description: "Please select different pickup and dropoff locations.",
            variant: "destructive",
          });
          setIsFetching(false);
          return;
        }
      }

      // Additional validation for return bookings
      if (bookingType === 'return') {
        if (!returnDate) {
          toast({
            title: "Missing return date",
            description: "Please select a return date for your booking.",
            variant: "destructive",
          });
          setIsFetching(false);
          return;
        }
        if (!returnTime) {
          toast({
            title: "Missing return time",
            description: "Please select a return time for your booking.",
            variant: "destructive",
          });
          setIsFetching(false);
          return;
        }
      }

      // Validate and format time properly
      const validateAndFormatTime = (time: string): string => {
        if (!time) return "00:00"; // Default to midnight instead of 12:00
        
        const [hours, minutes] = time.split(":").map(Number);
        
        // Validate hours (0-23)
        const validHours = Math.min(Math.max(0, Math.floor(hours)), 23);
        
        // Validate minutes (0-59) - this was the issue!
        const validMinutes = Math.min(Math.max(0, Math.floor(minutes)), 59);
        
        // Format back to HH:mm with leading zeros
        return `${validHours.toString().padStart(2, "0")}:${validMinutes.toString().padStart(2, "0")}`;
      };

      // Validate time format before sending request
      const originalTime = selectedTime;
      const formattedTime = validateAndFormatTime(selectedTime);
      
      if (originalTime !== formattedTime) {
        toast({
          title: "Invalid time format",
          description: `Time "${originalTime}" was corrected to "${formattedTime}". Please select a valid time.`,
          variant: "destructive",
        });
        return;
      }

      // Prepare base request data
      const baseRequest = {
        locations: {
          pickup: {
            address: pickupLocation.address || "",
            coordinates: {
              lat: Number(pickupLocation.latitude.toFixed(6)),
              lng: Number(pickupLocation.longitude.toFixed(6)),
            },
          },
          ...(dropoffLocation && {
            dropoff: {
              address: dropoffLocation.address || "",
              coordinates: {
                lat: Number(dropoffLocation.latitude.toFixed(6)),
                lng: Number(dropoffLocation.longitude.toFixed(6)),
              },
            },
          }),
          stops: additionalStops.map((stop) => ({
            address: stop.address || "",
            coordinates: {
              lat: Number(stop.latitude.toFixed(6)),
              lng: Number(stop.longitude.toFixed(6)),
            },
          })),
        },
        datetime: {
          date: selectedDate ? formatDate(selectedDate) : "",
          time: validateAndFormatTime(selectedTime),
        },
        passengers: {
          count: passengers,
          checkedLuggage,
          mediumLuggage,
          handLuggage,
          babySeat,
          childSeat,
          boosterSeat,
          wheelchair,
        },
        // Add enhanced booking type parameters
        bookingType,
        ...(bookingType === 'hourly' && { 
          hours: Math.max(3, Math.min(12, Number(hours) || 3)), // Ensure hours is a valid number between 3-12
          hourlyDetails: {
            hours: Math.max(3, Math.min(12, Number(hours) || 3)), // Ensure hours is a valid number between 3-12
            pickupLocation: {
              address: pickupLocation.address || "",
              coordinates: {
                lat: Number(pickupLocation.latitude.toFixed(6)),
                lng: Number(pickupLocation.longitude.toFixed(6)),
              },
            },
            ...(dropoffLocation && {
              dropoffLocation: {
                address: dropoffLocation.address || "",
                coordinates: {
                  lat: Number(dropoffLocation.latitude.toFixed(6)),
                  lng: Number(dropoffLocation.longitude.toFixed(6)),
                },
              },
            }),
            additionalStops: additionalStops.map((stop) => ({
              address: stop.address || "",
              coordinates: {
                lat: Number(stop.latitude.toFixed(6)),
                lng: Number(stop.longitude.toFixed(6)),
              },
            })),
          }
        }),
        ...(bookingType === 'return' && returnDate && returnTime && {
          returnDate: formatDate(returnDate),
          returnTime: validateAndFormatTime(returnTime),
        }),
      };

      if (baseRequest.locations.dropoff) {
      }
      if (baseRequest.bookingType === 'hourly') {
      }
      if (baseRequest.bookingType === 'return') {
      }

      
      const response = await getFareEstimate(baseRequest);

      if (!response.success) {
        
        // Handle authentication errors specifically
        if (response.error?.message?.includes("Authentication required")) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to calculate fares. Redirecting to login...",
            variant: "destructive",
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/auth/signin";
          }, 2000);
          
          return;
        }

        // Handle hours validation errors specifically
        if (response.error?.message?.includes("Hours must be between 3 and 12")) {
          toast({
            title: "Validation Error",
            description: "Hours must be between 3 and 12 for hourly bookings. Please adjust your selection.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Fare Calculation Failed",
          description: response.error?.message || "Failed to calculate fare. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (response.success && response.data?.fare) {
        setFareData(response.data.fare);
        setShowVehicleOptions(true);
        setFetchError(null);
      } else {
        setFetchError(response.error?.message || "Failed to calculate fare");
        toast({
          title: "Fare calculation failed",
          description: response.error?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error calculating fare:", error);
      
      // Check if it's a validation error
      if (error instanceof Error && error.message.includes("Hours must be between 3 and 12")) {
        setFetchError("Invalid hours selection. Hours must be between 3 and 12 for hourly bookings.");
        toast({
          title: "Validation Error",
          description: "Hours must be between 3 and 12 for hourly bookings.",
          variant: "destructive",
        });
      } else {
        setFetchError("An unexpected error occurred. Please try again.");
        toast({
          title: "Error",
          description: "Failed to calculate fare. Please try again.",
          variant: "destructive",
        });
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
      flightInformation?: {
        airline?: string;
        flightNumber?: string;
        scheduledDeparture?: string;
        status?: "on-time" | "delayed" | "cancelled";
      };
      trainInformation?: {
        trainOperator?: string;
        trainNumber?: string;
        scheduledDeparture?: string;
        status?: "on-time" | "delayed" | "cancelled";
      };
    },
    agree: boolean
  ) => {

    if (!agree) {
      setBookingError("You must agree to the terms and conditions to proceed.");
      return;
    }

    // Validation based on booking type
    if (!pickupLocation || !selectedDate || !selectedTime || !selectedVehicle) {
      setBookingError("Missing required booking information");
      return;
    }

          // Additional validation for different booking types
      if (bookingType === 'hourly') {
        if (!hours || hours < 3 || hours > 12) {
          setBookingError("Hourly bookings must be between 3 and 12 hours");
          return;
        }
      } else if (bookingType === 'return') {
        if (!returnDate || !returnTime) {
          setBookingError("Return date and time are required for return bookings");
          return;
        }
      } else if (bookingType === 'one-way') {
      if (!dropoffLocation) {
        setBookingError("Dropoff location is required for one-way bookings");
        return;
      }
    }

    setIsCreatingBooking(true);
    setBookingError(null);

    try {
      // Validate and correct time format
      const formattedTime = validateTime(selectedTime);
      const formattedReturnTime = returnTime ? validateTime(returnTime) : "";

      // Prepare booking data for logging
      const bookingData = {
          pickupLocation,
          dropoffLocation,
          additionalStops,
          selectedDate,
          selectedTime: formattedTime,
          returnDate,
          returnTime: formattedReturnTime,
          bookingType,
          hours: bookingType === 'hourly' ? hours : undefined,
          passengers,
          checkedLuggage,
          mediumLuggage,
          handLuggage,
          selectedVehicle,
          babySeat,
          childSeat,
          boosterSeat,
          wheelchair,
      };

      // Call booking API with enhanced parameters
      const bookingResponse = await bookingService.createEnhancedBooking(
        personalDetails,
        {
          pickupLocation,
          dropoffLocation: dropoffLocation || undefined,
          additionalStops,
          selectedDate,
          selectedTime: formattedTime,
          returnDate,
          returnTime: formattedReturnTime,
          bookingType,
          hours: bookingType === 'hourly' ? hours : undefined,
          passengers,
          checkedLuggage,
          mediumLuggage,
          handLuggage,
          selectedVehicle,
          babySeat,
          childSeat,
          boosterSeat,
          wheelchair,
        }
      );

      // Debug: Log the full booking response to see the structure
      // Extract reference number from the response
      const referenceNumber = (bookingResponse as any).data?.referenceNumber || 
                             (bookingResponse as any).data?.details?.referenceNumber ||
                             undefined;
      
      setBookingSuccess({
        show: true,
        bookingId: bookingResponse.data.bookingId,
        referenceNumber: referenceNumber,
        notifications: bookingResponse.data.details?.notifications || [],
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
      setReturnDate(undefined);
      setReturnTime("");
      setBookingType('one-way');
      setHours(3);
      setMultipleVehicles(1);
      setPassengers(1);
      setCheckedLuggage(0);
      setMediumLuggage(0);
      setHandLuggage(0);
      setSelectedVehicle(null);
      setShowVehicleOptions(false);
      setShowDetailsForm(false);
    } catch (error) {
      // Booking creation error - show user-friendly message
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

  // Get additional requests summary
  const getAdditionalRequestsSummary = () => {
    const requests = [];
    if (babySeat > 0) {
      requests.push(`${babySeat} baby ${babySeat === 1 ? "seat" : "seats"}`);
    }
    if (childSeat > 0) {
      requests.push(`${childSeat} child ${childSeat === 1 ? "seat" : "seats"}`);
    }
    if (boosterSeat > 0) {
      requests.push(
        `${boosterSeat} booster ${boosterSeat === 1 ? "seat" : "seats"}`
      );
    }
    if (wheelchair > 0) {
      requests.push(
        `${wheelchair} ${wheelchair === 1 ? "wheelchair" : "wheelchairs"}`
      );
    }
    return requests.length > 0 ? requests.join(", ") : "Not specified";
  };

  // Add these methods to the existing NewBookingPage component
  const hasAirportLocations = () => {
    const airportKeywords = [
      "airport",
      "heathrow",
      "gatwick",
      "stansted",
      "luton",
      "city airport",
      "manchester airport",
    ];

    const checkLocation = (address?: string) =>
      !!address &&
      airportKeywords.some((keyword) =>
        address.toLowerCase().includes(keyword)
      );

    return (
      checkLocation(pickupLocation?.address) ||
      checkLocation(dropoffLocation?.address) ||
      additionalStops.some((stop) => checkLocation(stop.address))
    );
  };

  const hasTrainStationLocations = () => {
    const trainStationKeywords = [
      "station",
      "train station",
      "railway station",
      "paddington",
      "kings cross",
      "euston",
      "victoria",
      "waterloo",
      "liverpool street",
      "london bridge",
    ];

    const checkLocation = (address?: string) =>
      !!address &&
      trainStationKeywords.some((keyword) =>
        address.toLowerCase().includes(keyword)
      );

    return (
      checkLocation(pickupLocation?.address) ||
      checkLocation(dropoffLocation?.address) ||
      additionalStops.some((stop) => checkLocation(stop.address))
    );
  };

  return (
      <div className="h-full w-full flex flex-col pt-2 overflow-hidden">
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
        <div className="flex-1 flex flex-col md:flex-row gap-2 overflow-hidden justify-between">
          {!showVehicleOptions ? (
            <>
              {/* Booking Form */}
              <div className="md:w-[31%] h-fit">
                {currentStep === "additionalRequests" ? (
                  <div className="space-y-4">
                    <AdditionalRequestsForm
                      babySeat={babySeat}
                      childSeat={childSeat}
                      boosterSeat={boosterSeat}
                      wheelchair={wheelchair}
                      setBabySeat={(value: number) =>
                        dispatch(setBabySeat(value))
                      }
                      setChildSeat={(value: number) =>
                        dispatch(setChildSeat(value))
                      }
                      setBoosterSeat={(value: number) =>
                        dispatch(setBoosterSeat(value))
                      }
                      setWheelchair={(value: number) =>
                        dispatch(setWheelchair(value))
                      }
                      onBack={() => setCurrentStep("location")}
                      disabled={locationPermission.denied}
                    />
                  </div>
                ) : (
                  <BookingForm
                    pickupAddress={pickupAddress}
                    setPickupAddress={setPickupAddress}
                    dropoffAddress={dropoffAddress}
                    setDropoffAddress={setDropoffAddress}
                    stopAddresses={stopAddresses}
                    setStopAddresses={setStopAddresses}
                    setPickupLocation={setPickupLocation}
                    setDropoffLocation={setDropoffLocation}
                    pickupLocation={pickupLocation ? {
                      address: pickupLocation.address || "",
                      latitude: pickupLocation.latitude,
                      longitude: pickupLocation.longitude,
                      coordinates: {
                        lat: pickupLocation.latitude,
                        lng: pickupLocation.longitude
                      }
                    } : null}
                    dropoffLocation={dropoffLocation ? {
                      address: dropoffLocation.address || "",
                      latitude: dropoffLocation.latitude,
                      longitude: dropoffLocation.longitude,
                      coordinates: {
                        lat: dropoffLocation.latitude,
                        lng: dropoffLocation.longitude
                      }
                    } : null}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    passengers={passengers}
                    setPassengers={setPassengers}
                    checkedLuggage={checkedLuggage}
                    setCheckedLuggage={setCheckedLuggage}
                    mediumLuggage={mediumLuggage}
                    setMediumLuggage={setMediumLuggage}
                    handLuggage={handLuggage}
                    setHandLuggage={setHandLuggage}
                    babySeat={babySeat}
                    childSeat={childSeat}
                    boosterSeat={boosterSeat}
                    wheelchair={wheelchair}
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
                    calculateFare={handleCalculateFare}
                    getPassengerLuggageSummary={getPassengerLuggageSummary}
                    getAdditionalRequestsSummary={getAdditionalRequestsSummary}
                    onGoToAdditionalRequests={() =>
                      setCurrentStep("additionalRequests")
                    }
                    disabled={locationPermission.denied}
                    reorderStops={reorderStops}
                    // New props for one-way, hourly, and return booking system
                    returnDate={returnDate}
                    setReturnDate={setReturnDate}
                    returnTime={returnTime}
                    setReturnTime={setReturnTime}
                    bookingType={bookingType}
                    setBookingType={setBookingType}
                    hours={hours}
                    setHours={setHours}
                    multipleVehicles={multipleVehicles}
                    setMultipleVehicles={setMultipleVehicles}
                  />
                )}
              </div>

              {/* Map Section - Width adjusted proportionally */}
              <div className="md:w-[65%]">
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
                    <div className="h-[35vh] md:h-[87vh] max-h-[calc(100vh-0rem)] rounded-lg overflow-hidden border shadow-sm">
                      <StableMapComponent
                        className="h-full"
                        pickupLocation={pickupLocation ? {
                          latitude: pickupLocation.latitude,
                          longitude: pickupLocation.longitude,
                          address: pickupLocation.address
                        } : null}
                        dropoffLocation={dropoffLocation ? {
                          latitude: dropoffLocation.latitude,
                          longitude: dropoffLocation.longitude,
                          address: dropoffLocation.address
                        } : null}
                        stops={additionalStops}
                        showCurrentLocation={true}
                        onUserLocationChange={handleUserLocationChange}
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
                  {/* Mobile: Vehicle Selection First */}
                  <div className="w-full lg:hidden flex flex-col">
                    {/* Vehicle selection container with increased height to 85vh */}
                    <div className="w-full max-h-[88vh] md:max-h-[85vh] flex flex-col">
                      <div className="p-3 pt-0 border-b">
                        <h2 className="text-base font-semibold flex justify-between items-center">
                          <span>Select Vehicle</span>
                          <Button
                            variant="ghost"
                            onClick={handleBackToForm}
                            size="sm"
                            className="h-8 text-sm p-1.5"
                          >
                            Back
                          </Button>
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
                            additionalStops={additionalStops}
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            passengers={passengers}
                            checkedLuggage={checkedLuggage}
                            mediumLuggage={mediumLuggage}
                            handLuggage={handLuggage}
                            babySeat={babySeat}
                            childSeat={childSeat}
                            boosterSeat={boosterSeat}
                            wheelchair={wheelchair}
                            onBack={handleBackToForm}
                            onSelectVehicle={handleVehicleSelect}
                            layout="vertical"
                            bookingType={bookingType}
                            hours={hours}
                          />
                        )}
                      </div>

                      {/* Continue button - Increase size by 40% */}
                      {selectedVehicle && (
                        <div className="px-3 py-3 pb-15 border-t">
                          <Button
                            onClick={continueToBooking}
                            className="w-full text-sm h-14"
                          >
                            Continue
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Journey Details Second */}
                  <div className="w-full lg:hidden mt-6 pb-10 hidden">
                    <Card className="border shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-base font-semibold">
                            Journey Details
                          </h2>
                        </div>

                        {/* Journey content - made scrollable */}
                        <div className="max-h-[500px] overflow-y-auto pb-4">
                          {/* Pickup field */}
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Pickup Location
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {pickupLocation?.address || "Not specified"}
                            </div>
                          </div>

                          {/* Dropoff field */}
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Dropoff Location
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {dropoffLocation?.address || "Not specified"}
                            </div>
                          </div>

                          {/* Additional stops - Only show for one-way bookings */}
                          {bookingType === 'one-way' && additionalStops.length > 0 && (
                            <div className="mb-4">
                              <label className="text-sm font-medium mb-1 block text-muted-foreground">
                                Additional Stops
                              </label>
                              <div className="p-2 bg-muted/40 rounded-md text-sm">
                                {additionalStops.length} stop
                                {additionalStops.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          )}

                          {/* Date and time */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
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
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Passengers & Luggage
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {getPassengerLuggageSummary()}
                            </div>
                          </div>

                          {/* Return Journey Details - Only show for return bookings */}
                          {bookingType === 'return' && (
                            <div className="mb-4">
                              <label className="text-sm font-medium mb-1 block text-muted-foreground">
                                Return Journey
                              </label>
                              <div className="p-2 bg-muted/40 rounded-md text-sm">
                                {returnDate && returnTime ? (
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <span className="text-muted-foreground">Date:</span>
                                      <span className="font-medium">
                                        {returnDate.toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Return Time:</span>
                                      <span className="font-medium">{returnTime}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Return details not specified</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Journey details */}
                          <div className="mb-4">
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
                                    ? `${Math.floor(
                                        fareData.journey.duration_minutes / 60
                                      )}h ${
                                        fareData.journey.duration_minutes % 60
                                      }m`
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
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Desktop: Journey Details First */}
                  <div className="hidden lg:block lg:w-[29%]">
                    <Card className="border shadow-sm">
                      <CardContent className="px-4 space-y-2 py-0 my-0">
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

                        {/* Dropoff field - Only show for non-hourly bookings */}
                        {bookingType !== 'hourly' && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Dropoff Location
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {dropoffLocation?.address || "Not specified"}
                            </div>
                          </div>
                        )}

                        {/* Hours field - Only show for hourly bookings */}
                        {bookingType === 'hourly' && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Duration
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {hours} hours
                            </div>
                          </div>
                        )}

                        {/* Additional stops - Only show for one-way bookings */}
                        {bookingType === 'one-way' && additionalStops.length > 0 && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Stops ({additionalStops.length})
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {additionalStops.length} stop
                              {additionalStops.length !== 1 ? "s" : ""}
                            </div>
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

                        {/* Return Journey Details - Only show for return bookings */}
                        {bookingType === 'return' && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Return Journey
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {returnDate && returnTime ? (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">
                                      {returnDate.toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-medium">{returnTime}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Return details not specified</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Additional Requests */}
                        {(babySeat > 0 || childSeat > 0 || boosterSeat > 0 || wheelchair > 0) && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Additional Requests
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {getAdditionalRequestsSummary()}
                            </div>
                          </div>
                        )}

                        {/* Journey details - Only show for non-hourly bookings */}
                        {bookingType !== 'hourly' && (
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
                                    ? `${Math.floor(
                                        fareData.journey.duration_minutes / 60
                                      )}h ${
                                        fareData.journey.duration_minutes % 60
                                      }m`
                                    : "Not available"}
                                  </span>
                              </div>
                            </div>
                          </div>
                        )}

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

                        {/* Return Journey Details - Only show for return bookings */}
                        {bookingType === 'return' && returnDate && returnTime && (
                          <div className="mt-3 border-t pt-3 border-border/40">
                            <div className="text-muted-foreground mb-2 text-xs font-medium">
                              Return Journey:
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium">
                                  {returnDate.toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-medium">{returnTime}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Route:</span>
                                <span className="font-medium">
                                  {dropoffLocation?.address || "Not specified"} → {pickupLocation?.address || "Not specified"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Desktop: Vehicle Selection Second */}
                  <div className="hidden lg:w-[42%] lg:max-h-[calc(100vh-5.5rem)] overflow-hidden lg:flex lg:flex-col">
                    <div className="p-3 border-b">
                      <h2 className="text-base font-semibold">
                        Select Vehicle
                      </h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-3 h-full">
                      {fareData && (
                        <VehicleSelection
                          fareData={fareData}
                          pickupLocation={pickupLocation}
                          dropoffLocation={dropoffLocation}
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          passengers={passengers}
                          checkedLuggage={checkedLuggage}
                          mediumLuggage={mediumLuggage}
                          handLuggage={handLuggage}
                          onBack={handleBackToForm}
                          onSelectVehicle={handleVehicleSelect}
                          layout="vertical"
                          bookingType={bookingType}
                          hours={hours}
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
                          Continue
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Map Panel (for both views) */}
                  <div className="w-full lg:w-[25%] h-[40vh] lg:h-[100vh] lg:max-h-[calc(100vh-6rem)] hidden lg:block">
                    {showMap ? (
                      <div className="h-full rounded-lg overflow-hidden border shadow-sm">
                        <StableMapComponent
                          className="h-full"
                          pickupLocation={pickupLocation}
                          dropoffLocation={dropoffLocation}
                          stops={additionalStops}
                          showCurrentLocation={true}
                          onUserLocationChange={handleUserLocationChange}
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
                <div className="flex flex-col lg:flex-row w-full h-full gap-4 pb-24">
                  <div className="w-full lg:w-2/3 relative flex flex-col h-fit">
                    {selectedVehicle && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto pr-2">
                          <div className="animate-in fade-in slide-in-from-right-5 duration-500 h-full flex flex-col">
                            {/* Contact Information Form */}
                            <div className="space-y-6 bg-card border rounded-xl p-6 flex-1 flex flex-col justify-start">
                              <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold">
                                  Contact Information
                                </h3>
                                <Button
                                  variant="ghost"
                                  onClick={handleBackToVehicleSelection}
                                  size="sm"
                                  className="gap-2 h-8"
                                >
                                  <ArrowLeft size={16} />
                                  Back
                                </Button>
                              </div>
                              <PersonalDetailsForm
                                onSubmit={handleSubmitBooking}
                                onFormValidityChange={setIsDetailsFormValid}
                                isSubmitting={isCreatingBooking}
                                error={bookingError}
                                hasAirportLocations={hasAirportLocations()}
                                hasTrainStationLocations={hasTrainStationLocations()}
                                lockedDate={
                                  bookingDate
                                    ? new Date(bookingDate)
                                    : undefined
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side - Booking Summary */}
                  <div className="w-full lg:w-1/3 h-fit flex flex-col">
                    <Card className="border shadow-sm sticky top-0 flex-1 flex flex-col justify-start">
                      <CardHeader className="py-0">
                        <CardTitle className="text-xl">
                          Booking Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4 flex-1 flex flex-col justify-start">
                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            From
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {pickupLocation?.address || "Not specified"}
                          </div>
                        </div>

                        {additionalStops.length > 0 && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-muted-foreground">
                              Stops ({additionalStops.length})
                            </label>
                            <div className="p-2 bg-muted/40 rounded-md text-sm">
                              {additionalStops.length} stop
                              {additionalStops.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            To
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {dropoffLocation?.address || "Not specified"}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Date & Time
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {selectedDate
                              ? format(selectedDate, "EEE, d MMM yyyy")
                              : "Not specified"}{" "}
                            at {selectedTime}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block text-muted-foreground">
                            Passengers & Luggage
                          </label>
                          <div className="p-2 bg-muted/40 rounded-md text-sm">
                            {getPassengerLuggageSummary()}
                          </div>
                        </div>

                        {/* Selected Vehicle with larger price */}
                        {selectedVehicle && (
                          <div className="mt-auto pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Selected Vehicle
                                </label>
                                <p className="text-base font-medium mt-1">
                                  {selectedVehicle.name}
                                </p>
                              </div>
                              <div className="text-right">
                                <label className="text-sm font-medium text-muted-foreground">
                                  Total Price
                                </label>
                                <p className="text-2xl font-bold font-mono mt-1 notranslate">
                                  £{selectedVehicle.price.amount.toFixed(2)}
                                </p>
                                {bookingType === 'hourly' && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Total for {hours}h
                                  </p>
                                )}
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
                {bookingSuccess.referenceNumber || bookingSuccess.bookingId}
              </div>


              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-4">
                <h4 className="font-medium text-slate-800 mb-2">
                  What happens next?
                </h4>
                <p className="text-sm text-slate-700">
                  One of our agents will contact you shortly to confirm your
                  booking details. Please keep your phone available.
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
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.041 1.016-1.041 2.479 1.066 2.876 1.215 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    WhatsApp: (Urgent Support & Bookings within 24-hours) +447831054649
                  </a>
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
  );
}
