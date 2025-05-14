import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { UkLocationInput } from "@/components/ui/uk-location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { PassengerLuggageForm } from "@/components/booking";
import { Location } from "@/components/map/MapComponent";

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
  handLuggage: number;
  setHandLuggage: (value: number) => void;
  userLocation: { latitude: number; longitude: number } | null;
  showVehicleOptions: boolean;
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
  disabled?: boolean;
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
  handLuggage,
  setHandLuggage,
  userLocation,
  showVehicleOptions,
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
  disabled,
}: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState<"location" | "luggage">(
    "location"
  );

  return (
    <>
      {currentStep === "location" ? (
        <Card className="border border-border/60 rounded-md shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Pickup field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90 block">
                Pickup Location
              </label>
              <UkLocationInput
                placeholder="Enter pickup address"
                value={pickupAddress}
                onChange={setPickupAddress}
                onLocationSelect={handlePickupLocationSelect}
                showInitialSuggestions={true}
                type="pickup"
                initialSuggestionsTitle="Suggested pickup locations"
                userLocation={userLocation}
                className="text-sm h-10 rounded-md bg-muted/40 !w-full [&>input]:h-10 [&>input]:text-sm [&>input]:rounded-md [&>input]:px-3 [&>input]:bg-muted/40"
                disabled={disabled || isFetching}
              />
            </div>

            {/* Dropoff field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90 block">
                Dropoff Location
              </label>
              <UkLocationInput
                placeholder="Enter dropoff address"
                value={dropoffAddress}
                onChange={setDropoffAddress}
                onLocationSelect={handleDropoffLocationSelect}
                showInitialSuggestions={true}
                type="dropoff"
                initialSuggestionsTitle="Suggested dropoff locations"
                userLocation={userLocation}
                className="text-sm h-10 rounded-md bg-muted/40 !w-full [&>input]:h-10 [&>input]:text-sm [&>input]:rounded-md [&>input]:px-3 [&>input]:bg-muted/40"
                disabled={disabled || isFetching}
              />
            </div>

            {/* Additional stops */}
            {stopAddresses.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/90 block">
                  Additional Stops
                </label>
                <div className="space-y-2">
                  {stopAddresses.map((address, index) => (
                    <div key={`stop-${index}`} className="relative">
                      <UkLocationInput
                        placeholder={`Enter stop ${index + 1}`}
                        value={address}
                        onChange={(value) => updateStopAddress(index, value)}
                        onLocationSelect={(location) =>
                          handleStopLocationSelect(index, location)
                        }
                        showInitialSuggestions={true}
                        type="stop"
                        initialSuggestionsTitle="Suggested stop locations"
                        userLocation={userLocation}
                        className="text-sm h-10 rounded-md pr-10 bg-muted/40 !w-full [&>input]:h-10 [&>input]:text-sm [&>input]:rounded-md [&>input]:px-3 [&>input]:bg-muted/40"
                        disabled={disabled || isFetching}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStop(index)}
                        className="h-7 w-7 p-0 absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <X size={16} className="text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add stop button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-sm font-medium rounded-md"
              onClick={addStop}
              disabled={disabled || isFetching}
            >
              <Plus size={16} className="mr-2" />
              Add Stop
            </Button>

            {/* Date Picker - Consistent sizing */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90 block">
                Date
              </label>
              <DatePicker
                date={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  if (showVehicleOptions) setFormModified(true);
                }}
                label=""
                selectedTime={selectedTime}
                className="h-10 text-sm w-full [&>button]:h-10 [&>button]:text-sm [&>button]:px-3 [&>button]:rounded-md [&>button]:border [&>button]:border-input [&>button]:bg-muted/20"
                disabled={disabled || isFetching}
              />
            </div>

            {/* Time Picker - Consistent sizing */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90 block">
                Time
              </label>
              <TimePicker
                time={selectedTime}
                onTimeChange={(time) => {
                  setSelectedTime(time);
                  if (showVehicleOptions) setFormModified(true);
                }}
                label=""
                placeholder="Select time"
                className="h-10 text-sm w-full [&>button]:h-10 [&>button]:text-sm [&>button]:px-3 [&>button]:rounded-md [&>button]:border [&>button]:border-input [&>button]:bg-muted/20"
                disabled={disabled || isFetching}
              />
            </div>

            {/* Passengers & Luggage */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90 block">
                Passengers & Luggage
              </label>
              <Button
                variant="outline"
                className="w-full h-10 text-sm font-medium rounded-md flex justify-between items-center bg-muted/40"
                onClick={() => setCurrentStep("luggage")}
                disabled={disabled || isFetching}
              >
                <span>{getPassengerLuggageSummary()}</span>
                <span className="text-primary">Edit</span>
              </Button>
            </div>

            {/* Calculate fare button */}
            <Button
              className="w-full h-10 text-sm font-medium mt-2"
              onClick={calculateFare}
              disabled={
                !pickupLocation ||
                !dropoffLocation ||
                !selectedDate ||
                !selectedTime ||
                disabled ||
                isFetching
              }
            >
              {isFetching ? "Calculating..." : "Calculate Fare"}
            </Button>

            {/* Display error message if any */}
            {fetchError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {fetchError}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <PassengerLuggageForm
          passengers={passengers}
          checkedLuggage={checkedLuggage}
          handLuggage={handLuggage}
          onPassengersChange={setPassengers}
          onCheckedLuggageChange={setCheckedLuggage}
          onHandLuggageChange={setHandLuggage}
          disabled={disabled || isFetching}
          onBack={() => setCurrentStep("location")}
          className="h-fit"
        />
      )}
    </>
  );
}
