"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  Plus, 
  Minus,
  Building,
  User,
  FileText
} from 'lucide-react';
import { VehicleSlider } from './vehicle-slider';
import { hourlyBookingService } from '@/utils/services/hourly-booking-service';
import { 
  HourlyFareRequest, 
  HourlyFareResponse, 
  HourlyBookingRequest,
  HourlyVehicleOption,
  HourlyBookingLocation
} from '@/types/hourlyBooking';
import { useToast } from '@/hooks/use-toast';
import UKLocationInput from '@/components/ui/uk-location-input';
import { format } from 'date-fns';

interface HourlyBookingFormProps {
  className?: string;
}

export function HourlyBookingForm({ className }: HourlyBookingFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupName, setGroupName] = useState('');
  const [bookingType, setBookingType] = useState<'one-way' | 'hourly' | 'return'>('hourly');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [hours, setHours] = useState(4);
  const [pickupLocation, setPickupLocation] = useState<HourlyBookingLocation | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<HourlyBookingLocation | null>(null);
  const [additionalStops, setAdditionalStops] = useState<HourlyBookingLocation[]>([]);
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [numVehicles, setNumVehicles] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  // API state
  const [fareData, setFareData] = useState<HourlyFareResponse | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<HourlyVehicleOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateFare = async () => {
    if (!selectedDate || !selectedTime || !pickupLocation) return;

    setIsLoading(true);
    try {
      // Build request based on booking type
      const baseRequest = {
        bookingType,
        datetime: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime
        },
        passengers: {
          count: passengers,
          luggage
        },
        numVehicles
      };

      let request: HourlyFareRequest;

             if (bookingType === 'one-way') {
         request = {
           ...baseRequest,
           oneWayDetails: {
             pickupLocation: {
               lat: pickupLocation.coordinates.lat,
               lng: pickupLocation.coordinates.lng,
             },
             dropoffLocation: {
               lat: dropoffLocation!.coordinates.lat,
               lng: dropoffLocation!.coordinates.lng,
             },
            additionalStops: additionalStops.length > 0 ? additionalStops.map(stop => ({
              lat: stop.coordinates.lat,
              lng: stop.coordinates.lng,
            })) : undefined,
          }
        };
      } else if (bookingType === 'hourly') {
        request = {
          ...baseRequest,
          hourlyDetails: {
            hours,
            pickupLocation: {
              lat: pickupLocation.coordinates.lat,
              lng: pickupLocation.coordinates.lng,
            },
            dropoffLocation: dropoffLocation ? {
              lat: dropoffLocation.coordinates.lat,
              lng: dropoffLocation.coordinates.lng,
            } : undefined,
            additionalStops: additionalStops.length > 0 ? additionalStops.map(stop => ({
              lat: stop.coordinates.lat,
              lng: stop.coordinates.lng,
            })) : undefined,
          }
        };
      } else {
        // Return booking - simplified for now
        request = {
          ...baseRequest,
          returnDetails: {
            outboundPickup: {
              lat: pickupLocation.coordinates.lat,
              lng: pickupLocation.coordinates.lng,
            },
            outboundDropoff: {
              lat: dropoffLocation?.coordinates.lat || 0,
              lng: dropoffLocation?.coordinates.lng || 0,
            },
            outboundDateTime: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              time: selectedTime
            },
            returnType: 'later-date',
            returnPickup: {
              lat: dropoffLocation?.coordinates.lat || 0,
              lng: dropoffLocation?.coordinates.lng || 0,
            },
            returnDropoff: {
              lat: pickupLocation.coordinates.lat,
              lng: pickupLocation.coordinates.lng,
            },
            returnDateTime: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              time: selectedTime
            }
          }
        };
      }

      const response = await hourlyBookingService.getFareEstimate(request);
      setFareData(response);
      
      // Auto-select first vehicle if none selected
      if (!selectedVehicle && response.fare.vehicleOptions.length > 0) {
        setSelectedVehicle(response.fare.vehicleOptions[0]);
      }
    } catch (error) {
      console.error('Error calculating fare:', error);
      toast({
        title: "Error",
        description: "Failed to calculate fare. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate fare when relevant fields change
  useEffect(() => {
    if (selectedDate && selectedTime && pickupLocation && (bookingType !== 'hourly' || hours >= 4)) {
      calculateFare();
    }
  }, [selectedDate, selectedTime, pickupLocation, hours, passengers, luggage, bookingType]);

  const handlePickupLocationSelect = (location: { address: string; longitude: number; latitude: number }) => {
    setPickupLocation({
      address: location.address,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      }
    });
  };

  const handleDropoffLocationSelect = (location: { address: string; longitude: number; latitude: number }) => {
    setDropoffLocation({
      address: location.address,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      }
    });
  };

  const addStop = () => {
    setAdditionalStops([...additionalStops, { address: '', coordinates: { lat: 0, lng: 0 } }]);
  };

  const removeStop = (index: number) => {
    setAdditionalStops(additionalStops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, location: { address: string; longitude: number; latitude: number }) => {
    const newStops = [...additionalStops];
    newStops[index] = {
      address: location.address,
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      }
    };
    setAdditionalStops(newStops);
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !selectedDate || !selectedTime || !pickupLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build booking request based on booking type
      const baseBookingData = {
        customer: {
          fullName,
          email,
          phoneNumber: phone,
          groupName: groupName || undefined
        },
        bookingType,
        datetime: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime
        },
        passengers: {
          count: passengers,
          luggage
        },
        vehicle: {
          id: selectedVehicle.id,
          name: selectedVehicle.name
        },
        numVehicles,
        specialRequests: specialRequests || undefined
      };

      let request: HourlyBookingRequest;

      if (bookingType === 'one-way') {
        request = {
          ...baseBookingData,
          oneWayDetails: {
            pickupLocation,
            dropoffLocation: dropoffLocation!,
            additionalStops: additionalStops.length > 0 ? additionalStops : undefined
          }
        };
      } else if (bookingType === 'hourly') {
        request = {
          ...baseBookingData,
          hourlyDetails: {
            hours,
            pickupLocation,
            dropoffLocation: dropoffLocation || undefined,
            additionalStops: additionalStops.length > 0 ? additionalStops : undefined
          }
        };
      } else {
        // Return booking
        request = {
          ...baseBookingData,
          returnDetails: {
            outboundPickup: pickupLocation,
            outboundDropoff: dropoffLocation!,
            outboundDateTime: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              time: selectedTime
            },
            returnType: 'later-date',
            returnPickup: dropoffLocation!,
            returnDropoff: pickupLocation,
            returnDateTime: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              time: selectedTime
            }
          }
        };
      }

      const response = await hourlyBookingService.createBooking(request);
      
      toast({
        title: "Booking Successful",
        description: `Your ${bookingType} booking has been created. Reference: ${response.data.bookingId}`,
      });

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setGroupName('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setHours(4);
      setPickupLocation(null);
      setDropoffLocation(null);
      setAdditionalStops([]);
      setPassengers(1);
      setLuggage(0);
      setNumVehicles(1);
      setSpecialRequests('');
      setSelectedVehicle(null);
      setFareData(null);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event & Group Booking Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group / Organisation Name</Label>
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name (optional)"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Booking Type
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'one-way', label: 'One-Way' },
                    { value: 'hourly', label: 'Hourly (4-24h)' },
                    { value: 'return', label: 'Return' }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={bookingType === type.value ? "default" : "outline"}
                      onClick={() => setBookingType(type.value as 'one-way' | 'hourly' | 'return')}
                      className="h-12"
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pick-up Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pick-up Date *</Label>
                    <DatePicker
                      date={selectedDate}
                      onDateChange={setSelectedDate}
                      placeholder="Select date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pick-up Time *</Label>
                    <TimePicker
                      time={selectedTime}
                      onTimeChange={setSelectedTime}
                      placeholder="Select time"
                      selectedDate={selectedDate}
                    />
                  </div>
                </div>

                {/* Hours Slider for Hourly Booking */}
                {bookingType === 'hourly' && (
                  <div className="space-y-2">
                    <Label>Duration: {hours} hours</Label>
                    <Slider
                      value={[hours]}
                      onValueChange={(value) => setHours(value[0])}
                      min={4}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>4 hours minimum</span>
                      <span>24 hours maximum</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Locations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Locations
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pick-up Location *</Label>
                    <UKLocationInput
                      placeholder="Enter pick-up location"
                      onSelect={handlePickupLocationSelect}
                      className="w-full"
                    />
                  </div>
                  
                  {bookingType !== 'hourly' && (
                    <div className="space-y-2">
                      <Label>Drop-off Destination *</Label>
                      <UKLocationInput
                        placeholder="Enter drop-off location"
                        onSelect={handleDropoffLocationSelect}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Additional Stops */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Additional Stops</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addStop}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Stop
                      </Button>
                    </div>
                    {additionalStops.map((stop, index) => (
                      <div key={index} className="flex gap-2">
                        <UKLocationInput
                          placeholder={`Stop ${index + 1}`}
                          onSelect={(location) => updateStop(index, location)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStop(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Passengers & Luggage */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Passengers & Luggage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Passengers</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        disabled={passengers <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{passengers}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPassengers(passengers + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Luggage</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLuggage(Math.max(0, luggage - 1))}
                        disabled={luggage <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{luggage}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLuggage(luggage + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Multiple Vehicles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Multiple Vehicles
                </h3>
                <div className="space-y-2">
                  <Label>Number of Vehicles Required</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNumVehicles(Math.max(1, numVehicles - 1))}
                      disabled={numVehicles <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">{numVehicles}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNumVehicles(numVehicles + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Special Requests */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes / Special Requests
                </h3>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Enter any special requests or additional notes..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedVehicle}
                className="w-full h-12 text-lg"
              >
                {isSubmitting ? "Creating Booking..." : `Create ${bookingType} Booking`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Calculating fares...</p>
                  </div>
                ) : fareData ? (
                  <VehicleSlider
                    vehicles={fareData.fare.vehicleOptions}
                    selectedVehicle={selectedVehicle}
                    onVehicleSelect={setSelectedVehicle}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Fill in the booking details to see available vehicles
                    </p>
                  </div>
                )}

                {/* Notifications */}
                {fareData?.fare.notifications && fareData.fare.notifications.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Important Information</h4>
                    <ul className="text-sm space-y-1 text-blue-700">
                      {fareData.fare.notifications.map((notification: string, index: number) => (
                        <li key={index} className="flex items-start gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                          <span>{notification}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 