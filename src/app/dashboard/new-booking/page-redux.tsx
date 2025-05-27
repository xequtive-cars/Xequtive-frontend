"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import MapComponent from "@/components/map/MapComponent";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UkLocationInput } from "@/components/ui/uk-location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { VehicleSelectionContainer } from "@/components/booking";
import { PersonalDetailsForm } from "@/components/booking/personal-details-form";
import { VehicleOption } from "@/components/booking/common/types";
import { AdditionalRequestsForm } from "@/components/booking/additional-requests-form";

// Import actions from Redux slices
import {
  setPickupAddress,
  setDropoffAddress,
  addStop as addStopAction,
  removeStop as removeStopAction,
  updateStopAddress as updateStopAddressAction,
  setSelectedDate,
  setSelectedTime,
  setPassengers,
  setCheckedLuggage,
  setMediumLuggage,
  setHandLuggage,
  setSelectedVehicle as setSelectedVehicleAction,
  setBabySeat,
  setChildSeat,
  setBoosterSeat,
  setWheelchair,
} from "@/store/slices/bookingSlice";

import {
  setShowMap,
  goToLocationStep,
  goToLuggageStep,
  goToDetailsStep,
  handleBackToForm,
  handleBackToVehicleSelection,
  handleCloseSuccessDialog,
  goToAdditionalRequestsStep,
} from "@/store/slices/uiSlice";

import { calculateFare, submitBooking } from "@/store/slices/apiSlice";

// Helper to create wrapper functions for UkLocationInput with proper types
const createInputChangeHandler = (
  dispatch: ReturnType<typeof useAppDispatch>,
  actionCreator: (value: string) => { type: string; payload: string }
) => {
  return (value: string) => {
    dispatch(actionCreator(value));
  };
};

export default function NewBookingPageRedux() {
  const dispatch = useAppDispatch();

  // Select state from Redux
  const booking = useAppSelector((state) => state.booking);
  const ui = useAppSelector((state) => state.ui);
  const api = useAppSelector((state) => state.api);
  const validation = useAppSelector((state) => state.validation);

  // Destructure booking state
  const {
    pickupLocation,
    dropoffLocation,
    additionalStops,
    pickupAddress,
    dropoffAddress,
    stopAddresses,
    selectedDate,
    selectedTime,
    passengers,
    checkedLuggage,
    mediumLuggage,
    handLuggage,
    selectedVehicle,
    babySeat,
    childSeat,
    boosterSeat,
    wheelchair,
  } = booking;

  // Destructure UI state
  const {
    currentStep,
    showMap,
    showRoute,
    showVehicleOptions,
    showDetailsForm,
    bookingSuccess,
  } = ui;

  // Destructure API state
  const { isFetching, isCreatingBooking, fetchError, bookingError, fareData } =
    api;

  // Destructure validation state
  const { errors } = validation;

  // Create change handlers for inputs
  const handlePickupAddressChange = createInputChangeHandler(
    dispatch,
    setPickupAddress
  );
  const handleDropoffAddressChange = createInputChangeHandler(
    dispatch,
    setDropoffAddress
  );

  // Initialize map after component mounts
  useEffect(() => {
    dispatch(setShowMap(true));
  }, [dispatch]);

  // Create wrapper for updateStopAddress
  const createStopAddressChangeHandler = (index: number) => {
    return (value: string) => {
      dispatch(updateStopAddressAction({ index, value }));
    };
  };

  // Add a new stop field
  const addStop = () => {
    dispatch(addStopAction());
  };

  // Remove a stop field
  const removeStop = (index: number) => {
    dispatch(removeStopAction(index));
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
      parts.push(`${luggageParts.join(" and ")}`);
    }

    return parts.join(" with ");
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

  // Handle moving to luggage step
  const goToLuggage = () => {
    dispatch(goToLuggageStep());
  };

  // Handle calculate fare button
  const handleCalculateFare = () => {
    dispatch(calculateFare());
  };

  // Handle continue to booking
  const continueToBooking = () => {
    if (selectedVehicle) {
      dispatch(goToDetailsStep());
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
    dispatch(
      submitBooking({
        personalDetails,
        agree,
      })
    );
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: VehicleOption) => {
    dispatch(setSelectedVehicleAction(vehicle));
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Form panel */}
        <div
          className={cn(
            "w-full md:w-2/5 lg:w-1/3 p-6 flex flex-col space-y-6 bg-white border-r",
            {
              hidden: showVehicleOptions && showDetailsForm,
              "md:hidden": showVehicleOptions && !showDetailsForm,
            }
          )}
        >
          {/* Location form */}
          {currentStep === "location" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Book your ride</h2>

              {/* Pickup location */}
              <div className="space-y-2">
                <label className="font-medium">Pickup Location</label>
                <UkLocationInput
                  value={pickupAddress}
                  onChange={handlePickupAddressChange}
                  locationType="pickup"
                  userLocation={null}
                  placeholder="Enter pickup address"
                />
                {errors.pickupLocation && (
                  <p className="text-red-500 text-sm">
                    {errors.pickupLocation}
                  </p>
                )}
              </div>

              {/* Additional stops */}
              {stopAddresses.map((address: string, index: number) => (
                <div key={`stop-${index}`} className="space-y-2 relative">
                  <div className="flex items-center">
                    <label className="font-medium grow">Stop {index + 1}</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStop(index)}
                      className="ml-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <UkLocationInput
                    value={address}
                    onChange={createStopAddressChangeHandler(index)}
                    locationType="stop"
                    userLocation={null}
                    placeholder={`Enter stop ${index + 1} address`}
                  />
                </div>
              ))}

              {stopAddresses.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStop}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Stop
                </Button>
              )}

              {/* Dropoff location */}
              <div className="space-y-2">
                <label className="font-medium">Dropoff Location</label>
                <UkLocationInput
                  value={dropoffAddress}
                  onChange={handleDropoffAddressChange}
                  locationType="dropoff"
                  userLocation={null}
                  placeholder="Enter dropoff address"
                />
                {errors.dropoffLocation && (
                  <p className="text-red-500 text-sm">
                    {errors.dropoffLocation}
                  </p>
                )}
              </div>

              {/* Date and time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium">Date</label>
                  <DatePicker
                    date={selectedDate}
                    onDateChange={(date) => dispatch(setSelectedDate(date))}
                  />
                  {errors.selectedDate && (
                    <p className="text-red-500 text-sm">
                      {errors.selectedDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Time</label>
                  <TimePicker
                    time={selectedTime}
                    onTimeChange={(time) => dispatch(setSelectedTime(time))}
                    selectedDate={selectedDate}
                  />
                  {errors.selectedTime && (
                    <p className="text-red-500 text-sm">
                      {errors.selectedTime}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={goToLuggage}
                disabled={
                  !pickupLocation ||
                  !dropoffLocation ||
                  !selectedDate ||
                  !selectedTime
                }
                className="w-full"
              >
                Next: Passengers & Luggage
              </Button>
            </div>
          )}

          {/* Passenger and luggage form */}
          {currentStep === "luggage" && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(goToLocationStep())}
                className="mb-2"
              >
                ← Back to Route
              </Button>

              <h2 className="text-2xl font-bold">Passengers & Luggage</h2>

              {/* Passenger & Luggage Field */}
              <Card>
                <CardContent className="!pt-0">
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
                          <h3 className="text-base font-medium">
                            Passengers & Luggage
                          </h3>
                          <p className="text-xs text-gray-500">1 passenger</p>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 hover:translate-x-1 transition-transform"
                      onClick={() => {
                        dispatch(setPassengers(passengers));
                        dispatch(setCheckedLuggage(checkedLuggage));
                        dispatch(setMediumLuggage(mediumLuggage));
                        dispatch(setHandLuggage(handLuggage));
                        dispatch(goToLuggageStep());
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Requests Field */}
              <Card>
                <CardContent className="!pt-0">
                  <div className="flex items-center justify-between py-0">
                    <div>
                      {(babySeat as number) > 0 ||
                      (childSeat as number) > 0 ||
                      (boosterSeat as number) > 0 ||
                      (wheelchair as number) > 0 ? (
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
                      type="button"
                      variant="ghost"
                      onClick={() => dispatch(goToAdditionalRequestsStep())}
                      className="h-auto p-1 hover:translate-x-1 transition-transform"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleCalculateFare}
                  disabled={isFetching}
                  className="w-full"
                >
                  {isFetching
                    ? "Calculating..."
                    : "Calculate Fare & Select Vehicle"}
                </Button>
                {fetchError && (
                  <p className="mt-2 text-red-500 text-sm">{fetchError}</p>
                )}
              </div>
            </div>
          )}

          {/* Additional Requests form */}
          {currentStep === "additionalRequests" && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(goToLuggageStep())}
                className="mb-2"
              >
                ← Back to Passengers & Luggage
              </Button>

              <h2 className="text-2xl font-bold">Additional Requests</h2>

              <Card>
                <CardContent className="pt-6">
                  <AdditionalRequestsForm
                    babySeat={babySeat}
                    setBabySeat={(value) => dispatch(setBabySeat(value))}
                    childSeat={childSeat}
                    setChildSeat={(value) => dispatch(setChildSeat(value))}
                    boosterSeat={boosterSeat}
                    setBoosterSeat={(value) => dispatch(setBoosterSeat(value))}
                    wheelchair={wheelchair}
                    setWheelchair={(value) => dispatch(setWheelchair(value))}
                    onBack={() => dispatch(goToLuggageStep())}
                  />
                </CardContent>
              </Card>

              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleCalculateFare}
                  disabled={isFetching}
                  className="w-full"
                >
                  {isFetching
                    ? "Calculating..."
                    : "Calculate Fare & Select Vehicle"}
                </Button>
                {fetchError && (
                  <p className="mt-2 text-red-500 text-sm">{fetchError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map and vehicle selection panel */}
        <div
          className={cn("w-full md:w-3/5 lg:w-2/3 relative", {
            hidden: showDetailsForm,
          })}
        >
          {showMap && (
            <div className="h-[calc(100vh-4rem)] sticky top-16">
              <MapComponent
                showRoute={showRoute}
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                stops={additionalStops}
                showCurrentLocation={true}
                className="h-full"
              />
            </div>
          )}

          {/* Vehicle selection overlay */}
          {showVehicleOptions && fareData && (
            <div className="absolute inset-0 bg-white bg-opacity-95 overflow-y-auto">
              <div className="p-6 max-w-3xl mx-auto">
                <VehicleSelectionContainer
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
                  onBack={() => dispatch(handleBackToForm())}
                  onSelectVehicle={(vehicle) => {
                    handleVehicleSelect(vehicle);
                    continueToBooking();
                  }}
                  selectedVehicle={selectedVehicle}
                />
              </div>
            </div>
          )}
        </div>

        {/* Booking details panel */}
        {showDetailsForm && (
          <div className="w-full p-6 bg-white">
            <div className="max-w-3xl mx-auto space-y-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(handleBackToVehicleSelection())}
                className="mb-2"
              >
                ← Back to Vehicle Selection
              </Button>

              <h2 className="text-2xl font-bold">Complete Your Booking</h2>

              {/* Booking summary */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Booking Summary</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">From</p>
                      <p>{pickupLocation?.address}</p>
                    </div>
                    <div>
                      <p className="font-medium">To</p>
                      <p>{dropoffLocation?.address}</p>
                    </div>

                    {additionalStops.length > 0 && (
                      <div className="col-span-2">
                        <p className="font-medium">Stops</p>
                        <ul className="list-disc list-inside">
                          {additionalStops.map(
                            (
                              stop: {
                                address: string;
                                latitude: number;
                                longitude: number;
                              },
                              i: number
                            ) => (
                              <li key={i}>{stop.address}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p>
                        {selectedDate
                          ? new Date(selectedDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}{" "}
                        at {selectedTime}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Passengers & Luggage</p>
                      <p>{getPassengerLuggageSummary()}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="font-medium">Selected Vehicle</p>
                      <div className="flex items-center justify-between mt-1">
                        <p>{selectedVehicle?.name}</p>
                        <p className="font-bold">
                          {selectedVehicle?.price.currency}{" "}
                          {selectedVehicle?.price.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal details form */}
              <PersonalDetailsForm
                onSubmit={handleSubmitBooking}
                isSubmitting={isCreatingBooking}
                error={bookingError}
                selectedVehicle={selectedVehicle}
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                additionalStops={additionalStops}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                passengers={passengers}
                checkedLuggage={checkedLuggage}
                mediumLuggage={mediumLuggage}
                handLuggage={handLuggage}
                onBack={() => dispatch(handleBackToVehicleSelection())}
              />
            </div>
          </div>
        )}

        {/* Booking success dialog */}
        <Dialog open={bookingSuccess.show} onOpenChange={() => null}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Confirmed!</DialogTitle>
              <DialogDescription>
                Your ride has been successfully booked.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-6">
              <div className="rounded-full bg-green-100 p-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-center mb-4">
              Your booking reference:{" "}
              <strong>{bookingSuccess.bookingId}</strong>
            </p>
            <p className="text-center text-sm text-gray-500">
              You will receive a confirmation email with all your booking
              details.
            </p>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={() => dispatch(handleCloseSuccessDialog())}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
