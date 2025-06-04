import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical, Loader2, ArrowRight } from "lucide-react";
import { UkLocationInput } from "@/components/ui/uk-location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { PassengerLuggageForm } from "@/components/booking";
import { Location } from "@/components/map/MapComponent";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

interface BookingFormProps {
  pickupAddress: string;
  setPickupAddress: (value: string) => void;
  dropoffAddress: string;
  setDropoffAddress: (value: string) => void;
  stopAddresses: string[];
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
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
}: {
  id: string;
  address: string;
  stopIndex: number;
  updateAddress: (value: string) => void;
  onLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  removeStop: (index: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
  disabled?: boolean;
  isFetching: boolean;
  isEmpty: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
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
      className="relative flex items-center mb-2"
      data-stop-index={stopIndex}
    >
      <div
        {...attributes}
        {...listeners}
        className={`h-full px-2 flex items-center cursor-grab ${
          isEmpty ? "opacity-50" : ""
        }`}
      >
        <GripVertical
          size={16}
          className={`text-foreground ${isEmpty ? "opacity-50" : ""}`}
        />
      </div>

      <div className="flex-grow relative">
        <div className="relative">
          <UkLocationInput
            placeholder={`Enter stop ${stopIndex + 1}`}
            initialLocation={
              address
                ? {
                    address,
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
            onSelect={(location) => {
              updateAddress(location.address);
              onLocationSelect({
                address: location.address,
                longitude: location.coordinates.lng,
                latitude: location.coordinates.lat,
              });
            }}
            locationType="stop"
            initialSuggestionsTitle="Suggested stop locations"
            userLocation={userLocation}
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

export function BookingForm({
  pickupAddress,
  setPickupAddress,
  dropoffAddress,
  setDropoffAddress,
  stopAddresses,
  pickupLocation,
  dropoffLocation,
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
  handlePickupLocationSelect,
  handleDropoffLocationSelect,
  handleStopLocationSelect,
  updateStopAddress,
  addStop,
  removeStop,
  calculateFare,
  getPassengerLuggageSummary,
  getAdditionalRequestsSummary,
  onGoToAdditionalRequests,
  disabled,
  reorderStops,
}: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState<"location" | "luggage">(
    "location"
  );

  // Add DND sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag activation
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Add drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && reorderStops) {
      const oldIndex = parseInt(active.id.toString().split("-")[1], 10);
      const newIndex = parseInt(over.id.toString().split("-")[1], 10);

      if (!isNaN(oldIndex) && !isNaN(newIndex)) {
        reorderStops(oldIndex, newIndex);
        setFormModified(true);
      }
    }
  };

  return (
    <>
      {currentStep === "location" ? (
        <Card className="w-[100%] md:w-[110%] booking-form-card">
          <CardContent>
            <div className="space-y-3">
              {/* Pickup */}
              <UkLocationInput
                placeholder="Enter pickup location"
                initialLocation={
                  pickupAddress
                    ? {
                        address: pickupAddress,
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
                onSelect={(location) => {
                  setPickupAddress(location.address);
                  handlePickupLocationSelect({
                    address: location.address,
                    longitude: location.coordinates.lng,
                    latitude: location.coordinates.lat,
                  });
                  setFormModified(true);
                }}
                onClear={() => {
                  setPickupAddress("");
                  handlePickupLocationSelect({
                    address: "",
                    longitude: 0,
                    latitude: 0,
                  });
                  setFormModified(true);
                }}
                locationType="pickup"
                initialSuggestionsTitle="Suggested pickup locations"
                userLocation={userLocation}
                className="bg-muted/40 text-sm h-10 rounded-md w-full"
                disabled={disabled || isFetching}
              />

              {/* Stops */}
              {stopAddresses.length > 0 && (
                <div className="pt-2 pb-1">
                  {/* Wrap stops in DndContext */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={stopAddresses.map((_, i) => `stop-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {stopAddresses.map((address, i) => {
                        // Create a unique key that doesn't change
                        const stopKey = `stop-${i}-${address.substring(0, 3)}`;

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
                            />
                          </div>
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Add stop button */}
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

              {/* Dropoff */}
              <UkLocationInput
                placeholder="Enter dropoff location"
                initialLocation={
                  dropoffAddress
                    ? {
                        address: dropoffAddress,
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
                onSelect={(location) => {
                  setDropoffAddress(location.address);
                  handleDropoffLocationSelect({
                    address: location.address,
                    longitude: location.coordinates.lng,
                    latitude: location.coordinates.lat,
                  });
                  setFormModified(true);
                }}
                onClear={() => {
                  setDropoffAddress("");
                  handleDropoffLocationSelect({
                    address: "",
                    longitude: 0,
                    latitude: 0,
                  });
                  setFormModified(true);
                }}
                locationType="dropoff"
                initialSuggestionsTitle="Suggested dropoff locations"
                userLocation={userLocation}
                className="bg-muted/40 text-sm h-10 rounded-md w-full"
                disabled={disabled || isFetching}
              />

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
                    !dropoffLocation ||
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
