import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import UKLocationInput from "@/components/ui/uk-location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Loader2, Plus, Minus } from "lucide-react";
import { Location } from "@/components/map/MapComponent";
import { HourlyFareRequest, HourlyFareResponse } from "@/types/hourlyBooking";

interface BookingFormProps {
  pickupAddress: string;
  setPickupAddress: (value: string) => void;
  dropoffAddress: string;
  setDropoffAddress: (value: string) => void;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  setPickupLocation: (location: Location | null) => void;
  setDropoffLocation: (location: Location | null) => void;
  handlePickupLocationSelect: (location: { address: string; longitude: number; latitude: number }) => void;
  handleDropoffLocationSelect: (location: { address: string; longitude: number; latitude: number }) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  returnDate: Date | undefined;
  setReturnDate: (date: Date | undefined) => void;
  returnTime: string;
  setReturnTime: (time: string) => void;
  bookingType: 'one-way' | 'hourly' | 'return';
  setBookingType: (value: 'one-way' | 'hourly' | 'return') => void;
  hours: number;
  setHours: (value: number) => void;
  passengers: number;
  setPassengers: (value: number) => void;
  checkedLuggage: number;
  setCheckedLuggage: (value: number) => void;
  mediumLuggage: number;
  setMediumLuggage: (value: number) => void;
  handLuggage: number;
  setHandLuggage: (value: number) => void;
  multipleVehicles: number;
  setMultipleVehicles: (value: number) => void;
  calculateFare: () => void;
  isFetching: boolean;
  fetchError: string | null;
  disabled?: boolean;
  setFormModified: (value: boolean) => void;
  returnType?: 'wait-and-return' | 'later-date';
  setReturnType?: (value: 'wait-and-return' | 'later-date') => void;

  userLocation: { latitude: number; longitude: number } | null;
  showVehicleOptions?: boolean;
}

export default function HourlyBookingForm({
  pickupAddress,
  setPickupAddress,
  dropoffAddress,
  setDropoffAddress,
  pickupLocation,
  dropoffLocation,
  setPickupLocation,
  setDropoffLocation,
  handlePickupLocationSelect,
  handleDropoffLocationSelect,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  returnDate,
  setReturnDate,
  returnTime,
  setReturnTime,
  bookingType,
  setBookingType,
  hours,
  setHours,
  passengers,
  setPassengers,
  checkedLuggage,
  setCheckedLuggage,
  mediumLuggage,
  setMediumLuggage,
  handLuggage,
  setHandLuggage,
  multipleVehicles,
  setMultipleVehicles,
  calculateFare,
  isFetching,
  fetchError,
  disabled = false,
  setFormModified,
  returnType,
  setReturnType,
  userLocation,
  showVehicleOptions = false,
}: BookingFormProps) {
  // Function to reset location data when booking type changes
  const resetLocationData = () => {
    setPickupAddress("");
    setDropoffAddress("");
    setPickupLocation(null);
    setDropoffLocation(null);
  };

  return (
    <>
      {!showVehicleOptions ? (
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
                placeholder="Enter pick-up location"
                value={pickupAddress}
                onChange={setPickupAddress}
                onSelect={(location: Location) => {
                  setPickupAddress(location.address || "");
                  handlePickupLocationSelect({
                    address: location.address || "",
                    longitude: location.longitude,
                    latitude: location.latitude,
                  });
                  setFormModified(true);
                }}
                userLocation={userLocation}
                locationType="pickup"
                className="bg-muted/40 text-sm h-10 rounded-md w-full"
                disabled={disabled || isFetching}
              />

              {/* 3. Dropoff - Only show for non-hourly bookings */}
              {bookingType !== 'hourly' && (
                <UKLocationInput
                  placeholder="Enter drop-off location"
                  value={dropoffAddress}
                  onChange={setDropoffAddress}
                  onSelect={(location: Location) => {
                    setDropoffAddress(location.address || "");
                    handleDropoffLocationSelect({
                      address: location.address || "",
                      longitude: location.longitude,
                      latitude: location.latitude,
                    });
                    setFormModified(true);
                  }}
                  userLocation={userLocation}
                  locationType="dropoff"
                  className="bg-muted/40 text-sm h-10 rounded-md w-full"
                  disabled={disabled || isFetching}
                />
              )}

              {/* 4. Date & Time */}
              {bookingType !== 'return' ? (
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
              ) : (
                <div className="space-y-3">
                  {/* Pickup leg */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Pickup</div>
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
                  </div>
                  {/* Return leg */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Return</div>
                    
                    {/* Return Type Selection */}
                    <div className="space-y-2 mb-3">
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
                    {returnType === 'later-date' && returnDate && (
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
                </div>
              )}

              {/* 5. Hours, Passengers, Luggage, Multiple Vehicles */}
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

                {/* Passengers & Luggage */}
                <div className="space-y-3">
                  {/* Passengers - Separate Row */}
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Passengers</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (passengers > 1) {
                              setPassengers(passengers - 1);
                              setFormModified(true);
                            }
                          }}
                          disabled={passengers <= 1 || disabled || isFetching}
                          className="p-0 flex items-center justify-center border-2"
                        >
                          <Minus className="h-3 w-3 text-foreground" />
                        </Button>
                        <span className="w-8 text-center font-medium">{passengers}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPassengers(passengers + 1);
                            setFormModified(true);
                          }}
                          disabled={disabled || isFetching}
                          className="p-0 flex items-center justify-center border-2"
                        >
                          <Plus className="h-3 w-3 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Luggage - Separate Row */}
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Luggage</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (checkedLuggage > 0) {
                              setCheckedLuggage(checkedLuggage - 1);
                              setFormModified(true);
                            }
                          }}
                          disabled={checkedLuggage <= 0 || disabled || isFetching}
                          className="p-0 flex items-center justify-center border-2"
                        >
                          <Minus className="h-3 w-3 text-foreground" />
                        </Button>
                        <span className="w-8 text-center font-medium">{checkedLuggage}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCheckedLuggage(checkedLuggage + 1);
                            setFormModified(true);
                          }}
                          disabled={disabled || isFetching}
                          className="p-0 flex items-center justify-center border-2"
                        >
                          <Plus className="h-3 w-3 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Vehicles - Separate Row */}
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Multiple Vehicles</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (multipleVehicles > 1) {
                              setMultipleVehicles(multipleVehicles - 1);
                              setFormModified(true);
                            }
                          }}
                          disabled={multipleVehicles <= 1 || disabled || isFetching}
                          className="p-0 flex items-center justify-center border-2"
                        >
                          <Minus className="h-3 w-3 text-foreground" />
                        </Button>
                        <span className="w-8 text-center font-medium">{multipleVehicles}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMultipleVehicles(multipleVehicles + 1);
                            setFormModified(true);
                          }}
                          disabled={disabled || isFetching}
                          className="p-0 flex items-center justify-center border-2"
                        >
                          <Plus className="h-3 w-3 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculate Fare Button */}
              <div className="pt-2">
                <Button
                  disabled={
                    !pickupLocation ||
                    (bookingType !== 'hourly' && !dropoffLocation) ||
                    !selectedDate ||
                    !selectedTime ||
                    (bookingType === 'return' && returnType === 'later-date' && (!returnDate || !returnTime)) ||
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
        <div className="w-[100%]">
          {/* This would be the luggage form - simplified for now */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Luggage configuration would go here
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
