import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical, Loader2, ArrowRight } from "lucide-react";
import UKLocationInput, { Location } from "@/components/ui/uk-location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { PassengerLuggageForm } from "@/components/booking";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Slider } from "@/components/ui/slider";

// Add type for location parameter
type LocationData = {
  address: string;
  longitude: number;
  latitude: number;
};

interface BookingFormProps {
  pickupAddress: string;
  setPickupAddress: (value: string) => void;
  dropoffAddress: string;
  setDropoffAddress: (value: string) => void;
  stopAddresses: string[];
  setStopAddresses: (value: string[]) => void;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  setPickupLocation: (location: Location | null) => void;
  setDropoffLocation: (location: Location | null) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  passengers: number;
  setPassengers: (value: number) => void;
  checkedLuggage: number;
  setCheckedLuggage: (value: number) => void;
  mediumLuggage: number;
  setMediumLuggage: (value: number) => void;
  handLuggage: number;
  setHandLuggage: (value: number) => void;
  babySeat: number;
  childSeat: number;
  boosterSeat: number;
  wheelchair: number;
  userLocation: { latitude: number; longitude: number } | null;
  showVehicleOptions?: boolean;
  setFormModified: (value: boolean) => void;
  isFetching: boolean;
  fetchError: string | null;
  handlePickupLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  handleDropoffLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  handleStopLocationSelect: (
    index: number,
    location: { address: string; longitude: number; latitude: number }
  ) => void;
  updateStopAddress: (index: number, value: string) => void;
  addStop: () => void;
  removeStop: (index: number) => void;
  calculateFare: () => void;
  getPassengerLuggageSummary: () => string;
  getAdditionalRequestsSummary: () => string;
  onGoToAdditionalRequests: () => void;
  disabled?: boolean;
  reorderStops?: (fromIndex: number, toIndex: number) => void;
  // New props for one-way, hourly, and return booking system
  returnDate?: Date | undefined;
  setReturnDate?: (value: Date | undefined) => void;
  returnTime?: string;
  setReturnTime?: (value: string) => void;
  bookingType: 'one-way' | 'hourly' | 'return';
  setBookingType: (value: 'one-way' | 'hourly' | 'return') => void;
  hours: number;
  setHours: (value: number) => void;
  multipleVehicles: number;
  setMultipleVehicles: (value: number) => void;
  returnType?: 'wait-and-return' | 'later-date';
  setReturnType?: (value: 'wait-and-return' | 'later-date') => void;

}

// Add SortableStopInputField component
function SortableStopInputField({
  id,
  address,
  stopIndex,
  updateAddress,
  onLocationSelect,
  removeStop,
  userLocation,
  disabled,
  isFetching,
  isEmpty,
  className = '',
}: {
  id: string;
  address: string;
  stopIndex: number;
  updateAddress: (value: string) => void;
  onLocationSelect: (location: LocationData) => void;
  removeStop: (index: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
  disabled?: boolean;
  isFetching: boolean;
  isEmpty: boolean;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Create a stable unique ID for each stop
  const stopId = `stop-field-${stopIndex}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={stopId}
      className={`relative flex items-center mb-2 min-h-[44px] md:min-h-[40px] ${
        isDragging ? 'opacity-50 scale-105 z-50' : ''
      } ${className}`}
      data-stop-index={stopIndex}
    >
      <div
        {...attributes}
        {...listeners}
        className={`h-full px-3 py-2 flex items-center cursor-grab touch-none select-none ${
          isEmpty ? "opacity-50" : ""
        } hover:bg-muted/20 active:bg-muted/30 transition-colors md:px-2 md:py-1 rounded-l-md`}
        style={{ touchAction: 'none' }}
        title="Drag to reorder"
      >
        <GripVertical
          size={18}
          className={`text-foreground ${isEmpty ? "opacity-50" : ""} md:w-4 md:h-4`}
        />
      </div>

      <div className="flex-grow relative">
        <div className="relative">
          <UKLocationInput
            placeholder={`Enter stop ${stopIndex + 1}`}
            value={address}
            onChange={updateAddress}
            initialLocation={
              address
                ? {
                    address,
                    latitude: 0,
                    longitude: 0,
                    coordinates: { lat: 0, lng: 0 },
                    type: "landmark",
                    metadata: {
                      postcode: undefined,
                      city: undefined,
                      region: undefined,
                      category: undefined,
                    },
                  }
                : null
            }
            onSelect={(location: Location) => {
              updateAddress(location.address);
              onLocationSelect({
                address: location.address,
                longitude: location.longitude,
                latitude: location.latitude,
              });
            }}
            locationType="stop"
            
                          disabled={disabled || isFetching}
              className="bg-muted/40 text-sm h-10 rounded-md"
          />

          {/* Direct DOM reference remove button */}
          <button
            type="button"
            id={`remove-stop-${stopIndex}`}
            onClick={() => {
              // Use the exact index from the data attribute
              removeStop(stopIndex);
            }}
            className="absolute right-0 top-0 h-full flex items-center pr-3 justify-end z-[100]"
            aria-label={`Remove stop ${stopIndex + 1}`}
            data-stop-index={stopIndex}
          >
            <X size={19} className="text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Define a more flexible Location type
// export type Location = {
//   [key: string]: any;
//   id?: string;
//   address: string;
//   name?: string;
//   mainText?: string;
//   secondaryText?: string;
//   latitude?: number;
//   longitude?: number;
//   coordinates?: {
//     lat: number;
//     lng: number;
//   };
//   metadata?: {
//     [key: string]: any;
//     primaryType?: string;
//     postcode?: string;
//     city?: string;
//     region?: string;
//     type?: string;
//     category?: string;
//   };
//   type?: string;
// }

export default function BookingForm({
  pickupAddress,
  setPickupAddress,
  dropoffAddress,
  setDropoffAddress,
  stopAddresses,
  setStopAddresses,
  pickupLocation,
  dropoffLocation,
  setPickupLocation,
  setDropoffLocation,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  passengers,
  setPassengers,
  checkedLuggage,
  setCheckedLuggage,
  mediumLuggage,
  setMediumLuggage,
  handLuggage,
  setHandLuggage,
  babySeat,
  childSeat,
  boosterSeat,
  wheelchair,
  userLocation,
  setFormModified,
  isFetching,
  fetchError,
  handlePickupLocationSelect: externalHandlePickupLocationSelect,
  handleDropoffLocationSelect: externalHandleDropoffLocationSelect,
  handleStopLocationSelect: externalHandleStopLocationSelect,
  updateStopAddress,
  addStop,
  removeStop,
  calculateFare,
  getPassengerLuggageSummary,
  getAdditionalRequestsSummary,
  onGoToAdditionalRequests,
  disabled,
  reorderStops,
  // New props for one-way, hourly, and return booking system
  returnDate,
  setReturnDate,
  returnTime,
  setReturnTime,
  bookingType,
  setBookingType,
  hours,
  setHours,
  multipleVehicles,
  setMultipleVehicles,
  returnType,
  setReturnType,
}: BookingFormProps) {
  // Function to reset location data when booking type changes
  const resetLocationData = () => {
    setPickupAddress("");
    setDropoffAddress("");
    setPickupLocation(null);
    setDropoffLocation(null);
    setStopAddresses([]);
  };

  // Add currentStep state
  const [currentStep, setCurrentStep] = useState<"location" | "luggage">("location");

  // Ensure mapRef is properly defined INSIDE the component
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // State for drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);

  // Modify state setters to use the flexible type INSIDE the component
  const handlePickupLocationChange = (location: Location | null) => {
    // Validate location
    if (!location) {
      externalHandlePickupLocationSelect({
        address: '',
        longitude: 0,
        latitude: 0
      });
      return;
    }

    // Update pickup location
    externalHandlePickupLocationSelect({
      address: location.address,
      longitude: location.longitude || 0,
      latitude: location.latitude || 0
    });

    // Update map center if MapComponent is available
    if (mapRef.current && location?.coordinates) {
      mapRef.current.flyTo({
        center: [location.coordinates.lng, location.coordinates.lat],
        zoom: 12
      });
    }
  };

  const handleDropoffLocationChange = (location: Location | null) => {
    // Similar implementation as handlePickupLocationChange
    if (!location) {
      externalHandleDropoffLocationSelect({
        address: '',
        longitude: 0,
        latitude: 0
      });
      return;
    }

    // Update dropoff location
    externalHandleDropoffLocationSelect({
      address: location.address,
      longitude: location.longitude || 0,
      latitude: location.latitude || 0
    });

    // Update map center if MapComponent is available
    if (mapRef.current && location?.coordinates) {
      mapRef.current.flyTo({
        center: [location.coordinates.lng, location.coordinates.lat],
        zoom: 12
      });
    }
  };

  // Add DND sensors for drag and drop with mobile-friendly configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Even smaller distance for ultra-responsive drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // Minimal delay for instant touch responsiveness
        tolerance: 2, // Extremely precise touch tracking
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Memoize drag start handler to prevent unnecessary re-renders
  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id);
  }, []);

  // Memoize drag end handler for performance
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && reorderStops) {
      const oldIndex = parseInt(active.id.toString().split("-")[1], 10);
      const newIndex = parseInt(over.id.toString().split("-")[1], 10);

      if (!isNaN(oldIndex) && !isNaN(newIndex)) {
        reorderStops(oldIndex, newIndex);
        setFormModified(true);
      }
    }

    setActiveId(null);
  }, [reorderStops, setFormModified]);

  // Find the active item for drag overlay
  const activeItem = activeId 
    ? stopAddresses[parseInt(activeId.toString().split("-")[1], 10)] 
    : null;

  // Modify location handling functions to use type assertion
  const handlePickupLocationSelect = (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => {
    const newLocation = {
      address: location.address,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      },
      metadata: {
        postcode: undefined,
        city: undefined,
        region: undefined,
        category: undefined,
        type: "landmark"
      },
      type: "landmark",
      latitude: location.latitude,
      longitude: location.longitude,
      mainText: location.address,
      secondaryText: location.address
    } as any;
    
    // @ts-ignore
    handlePickupLocationChange(newLocation);
    // @ts-ignore
    setPickupAddress(location.address);
    // @ts-ignore
    setFormModified(true);
  };

  const handleDropoffLocationSelect = (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => {
    const newLocation = {
      address: location.address,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      },
      metadata: {
        postcode: undefined,
        city: undefined,
        region: undefined,
        category: undefined,
        type: "landmark"
      },
      type: "landmark",
      latitude: location.latitude,
      longitude: location.longitude,
      mainText: location.address,
      secondaryText: location.address
    } as any;
    
    // @ts-ignore
    handleDropoffLocationChange(newLocation);
    // @ts-ignore
    setDropoffAddress(location.address);
    // @ts-ignore
    setFormModified(true);
  };

  const handleStopLocationSelect = (
    index: number,
    location: { address: string; longitude: number; latitude: number }
  ) => {
    // Call the external handler passed from the parent component
    externalHandleStopLocationSelect(index, location);
    setFormModified(true);
  };

  // Helper function to create a Location object
  return (
    <>
      {currentStep === "location" ? (
        <Card className="w-[100%] md:w-[110%] booking-form-card">
          <CardContent>
            <div className="space-y-3">
              {/* 1. Booking Type Selection - Moved to top */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative group">
                    <Button
                      type="button"
                      variant={bookingType === 'one-way' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setBookingType('one-way');
                        resetLocationData();
                        setFormModified(true);
                      }}
                      className="h-9 text-xs w-full"
                      disabled={disabled || isFetching}
                    >
                      One-Way
                    </Button>
                    {/* Hover Tooltip - Below button */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999]">
                      Point-to-point journey
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600"></div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <Button
                      type="button"
                      variant={bookingType === 'hourly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setBookingType('hourly');
                        resetLocationData();
                        setFormModified(true);
                      }}
                      className="h-9 text-xs w-full"
                      disabled={disabled || isFetching}
                    >
                      Hourly (3-12h)
                    </Button>
                    {/* Hover Tooltip - Below button */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999]">
                      Continuous service
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600"></div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <Button
                      type="button"
                      variant={bookingType === 'return' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setBookingType('return');
                        resetLocationData();
                        setFormModified(true);
                      }}
                      className="h-9 text-xs w-full"
                      disabled={disabled || isFetching}
                    >
                      Return
                    </Button>
                    {/* Hover Tooltip - Below button */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999]">
                      Round-trip with discount
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Pickup */}
              <UKLocationInput
                placeholder="Enter pickup location"
                value={pickupAddress}
                onChange={setPickupAddress}
                initialLocation={
                  pickupAddress
                    ? {
                        address: pickupAddress,
                        latitude: pickupLocation?.latitude || 0,
                        longitude: pickupLocation?.longitude || 0,
                        coordinates: pickupLocation
                          ? {
                              lat: pickupLocation.latitude,
                              lng: pickupLocation.longitude,
                            }
                          : { lat: 0, lng: 0 },
                        type: "landmark",
                        metadata: {
                          postcode: undefined,
                          city: undefined,
                          region: undefined,
                          category: undefined,
                        },
                      }
                    : null
                }
                onSelect={(location: Location) => {
                  setPickupAddress(location.address);
                  handlePickupLocationSelect({
                    address: location.address,
                    longitude: location.longitude,
                    latitude: location.latitude,
                  });
                  setFormModified(true);
                }}

                locationType="pickup"

                className="bg-muted/40 text-sm h-10 rounded-md w-full"
                disabled={disabled || isFetching}
              />

              {/* Stops */}
              {stopAddresses.length > 0 && bookingType === 'one-way' && (
                <div className="pt-2 pb-1">
                  {stopAddresses.length > 1 && (
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <GripVertical size={12} />
                      <span>Drag to reorder stops</span>
                    </div>
                  )}
                  {/* Wrap stops in DndContext */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={stopAddresses.map((_, i) => `stop-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {stopAddresses.map((address, i) => {
                        // Use stable key based on index only - don't include address content
                        const stopKey = `stop-${i}`;

                        return (
                          <div
                            key={stopKey}
                            className="stop-item-container"
                            data-index={i}
                          >
                            <SortableStopInputField
                              id={`stop-${i}`}
                              address={address}
                              stopIndex={i}
                              updateAddress={(value) => {
                                updateStopAddress(i, value);
                                setFormModified(true);
                              }}
                              onLocationSelect={(location) => {
                                handleStopLocationSelect(i, location);
                                setFormModified(true);
                              }}
                              removeStop={(exactIndex) => {
                                // Direct call to parent's removeStop with the exact index
                                removeStop(exactIndex);
                                setFormModified(true);
                              }}
                              userLocation={userLocation}
                              disabled={disabled || isFetching}
                              isFetching={isFetching}
                              isEmpty={address.trim() === ""}
                              className={i % 2 === 0 ? 'bg-muted/40' : 'bg-muted/50'}
                            />
                          </div>
                        );
                      })}
                    </SortableContext>
                    <DragOverlay 
                      dropAnimation={{
                        duration: 150, // Quick drop animation
                        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Smooth easing
                      }}
                      modifiers={[
                        ({ transform }) => ({
                          ...transform,
                          scaleX: 1.03, // Slight scale for depth
                          scaleY: 1.03,
                        })
                      ]}
                    >
                      {activeItem ? (
                        <div className="w-full">
                          <SortableStopInputField
                            id={activeId || ''}
                            address={activeItem}
                            stopIndex={parseInt(activeId?.toString().split("-")[1] || '0', 10)}
                            updateAddress={() => {}}
                            onLocationSelect={() => {}}
                            removeStop={() => {}}
                            userLocation={userLocation}
                            disabled={true}
                            isFetching={false}
                            isEmpty={false}
                            className="opacity-70 shadow-lg" // Slightly transparent with shadow
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}

              {/* Add stop button */}
              {bookingType === 'one-way' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addStop();
                    setFormModified(true);
                  }}
                  className="w-full h-9 text-sm"
                  disabled={
                    stopAddresses.length >= 7 ||
                    disabled ||
                    isFetching ||
                    !pickupAddress ||
                    !dropoffAddress
                  }
                >
                  <Plus size={16} className="mr-2" />
                  Add Stop
                </Button>
              )}

              {/* Dropoff Location - Only show for non-hourly bookings */}
              {bookingType !== 'hourly' && (
                <UKLocationInput
                  placeholder="Enter dropoff location"
                  value={dropoffAddress}
                  onChange={setDropoffAddress}
                  initialLocation={
                    dropoffAddress
                      ? {
                          address: dropoffAddress,
                          latitude: dropoffLocation?.latitude || 0,
                          longitude: dropoffLocation?.longitude || 0,
                          coordinates: dropoffLocation
                            ? {
                                lat: dropoffLocation.latitude,
                                lng: dropoffLocation.longitude,
                              }
                            : { lat: 0, lng: 0 },
                          type: "landmark",
                          metadata: {
                            postcode: undefined,
                            city: undefined,
                            region: undefined,
                            category: undefined,
                          },
                        }
                      : null
                  }
                  onSelect={(location: Location) => {
                    setDropoffAddress(location.address);
                    handleDropoffLocationSelect({
                      address: location.address,
                      longitude: location.longitude,
                      latitude: location.latitude,
                    });
                    setFormModified(true);
                  }}
                  locationType="dropoff"
                  className="bg-muted/40 text-sm h-10 rounded-md w-full"
                  disabled={disabled || isFetching}
                />
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  date={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    setFormModified(true);
                  }}
                  className="w-full bg-muted/40 h-10 text-sm [&>button]:h-10 rounded-md"
                  disabled={disabled || isFetching}
                />
                <TimePicker
                  time={selectedTime}
                  onTimeChange={(time) => {
                    setSelectedTime(time);
                    setFormModified(true);
                  }}
                  className="w-full bg-muted/40 h-10 text-sm [&>button]:h-10 rounded-md"
                  disabled={disabled || isFetching}
                  selectedDate={selectedDate}
                />
              </div>

              {/* Return leg for return bookings */}
              {bookingType === 'return' && (
                <div className="space-y-3">
                  {/* Return Type Selection */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Return Type</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={returnType === 'wait-and-return' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setReturnType && setReturnType('wait-and-return');
                          setFormModified(true);
                        }}
                        className="h-9 text-xs"
                        disabled={disabled || isFetching}
                      >
                        Wait & Return
                      </Button>
                      <Button
                        type="button"
                        variant={returnType === 'later-date' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setReturnType && setReturnType('later-date');
                          setFormModified(true);
                        }}
                        className="h-9 text-xs"
                        disabled={disabled || isFetching}
                      >
                        Later Date
                      </Button>
                    </div>
                  </div>

                  {/* Return Date/Time - Only show for later-date returns */}
                  {returnType === 'later-date' && (
                    <div className="grid grid-cols-2 gap-3">
                      <DatePicker
                        date={returnDate}
                        onDateChange={(date) => {
                          setReturnDate && setReturnDate(date);
                          setFormModified(true);
                        }}
                        className="w-full bg-muted/40 h-10 text-sm [&>button]:h-10 rounded-md"
                        disabled={disabled || isFetching}
                      />
                      <TimePicker
                        time={returnTime || ''}
                        onTimeChange={(time) => {
                          setReturnTime && setReturnTime(time);
                          setFormModified(true);
                        }}
                        className="w-full bg-muted/40 h-10 text-sm [&>button]:h-10 rounded-md"
                        disabled={disabled || isFetching}
                        selectedDate={returnDate}
                      />
                    </div>
                  )}


                </div>
              )}

              {/* 4. Passenger & Luggage Field */}
              <div className="space-y-3">
                {/* Hours Slider for Hourly Bookings */}
                {bookingType === 'hourly' && (
                  <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                    <div className="flex justify-between text-sm">
                      <span>Hours: {hours}</span>
                      <span className="text-muted-foreground">3-12 hours</span>
                    </div>
                    <Slider
                      value={[hours]}
                      onValueChange={(value) => {
                        setHours(value[0]);
                        setFormModified(true);
                      }}
                      min={3}
                      max={12}
                      step={1}
                      className="w-full"
                      disabled={disabled || isFetching}
                    />
                    <div className="text-xs text-muted-foreground">
                      <div>• <strong>3-6 hours:</strong> Higher hourly rates</div>
                      <div>• <strong>6-12 hours:</strong> Lower hourly rates</div>
                    </div>
                  </div>
                )}

                {/* Passenger & Luggage Field */}
                <Card>
                  <CardContent className="py-0">
                    <div className="flex items-center justify-between py-0">
                      <div>
                        {passengers > 1 ||
                        checkedLuggage > 0 ||
                        mediumLuggage > 0 ||
                        handLuggage > 0 ? (
                          <p className="text-sm">
                            {getPassengerLuggageSummary()}
                          </p>
                        ) : (
                          <>
                            <h3 className="text-base font-small">
                              Passengers & Luggage
                            </h3>
                            <p className="text-xs text-gray-500">1 passenger</p>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentStep("luggage");
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Requests Field */}
                <Card>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between py-0">
                      <div>
                        {babySeat > 0 ||
                        childSeat > 0 ||
                        boosterSeat > 0 ||
                        wheelchair > 0 ? (
                          <p className="text-sm">
                            {getAdditionalRequestsSummary()}
                          </p>
                        ) : (
                          <>
                            <h3 className="text-base font-medium">
                              Additional Requests
                            </h3>
                            <p className="text-xs text-gray-500">Not specified</p>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGoToAdditionalRequests();
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Calculate Fare Button */}
                <div className="pt-1">
                  <Button
                    disabled={
                      !pickupLocation ||
                      (bookingType !== 'hourly' && !dropoffLocation) ||
                      !selectedDate ||
                      !selectedTime ||
                      isFetching ||
                      disabled
                    }
                    onClick={calculateFare}
                    className="w-full h-10 text-sm font-semibold"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Fare"
                    )}
                  </Button>
                </div>

                {fetchError && (
                  <div className="text-sm text-destructive mt-2">
                    {fetchError}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PassengerLuggageForm
          passengers={passengers}
          onPassengersChange={setPassengers}
          checkedLuggage={checkedLuggage}
          onCheckedLuggageChange={setCheckedLuggage}
          mediumLuggage={mediumLuggage}
          onMediumLuggageChange={setMediumLuggage}
          handLuggage={handLuggage}
          onHandLuggageChange={setHandLuggage}
          onBack={() => setCurrentStep("location")}
          className="w-[100%]"
          disabled={disabled || isFetching}
        />
      )}
    </>
  );
}
