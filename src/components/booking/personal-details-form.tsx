import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { VehicleOption } from "./vehicle-selection";
import {
  Check,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  CalendarIcon,
  Car,
  Lock,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Location } from "@/components/map/MapComponent";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

// Interfaces for booking data types
export interface VerifiedFare {
  vehicleId: string;
  vehicleName: string;
  price: {
    amount: number;
    currency: string;
  };
  distance_miles: number;
  duration_minutes: number;
}

export interface BookingVerification {
  bookingId: string;
  verificationToken: string;
  verifiedFare: VerifiedFare;
  expiresIn?: number;
}

interface BookingDetailsProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

function BookingDetail({ label, value, icon: Icon }: BookingDetailsProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mt-0.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-medium">{value}</p>
      </div>
    </div>
  );
}

export interface PersonalDetailsFormProps {
  selectedVehicle: VehicleOption;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
  selectedDate: Date | undefined;
  selectedTime: string;
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;
  onBack: () => void;
  onSubmit: (
    personalDetails: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests: string;
    },
    agree: boolean
  ) => void;
  isSubmitting: boolean;
  error: string | null;
}

export function PersonalDetailsForm({
  selectedVehicle,
  pickupLocation,
  dropoffLocation,
  additionalStops,
  selectedDate,
  selectedTime,
  passengers,
  checkedLuggage,
  mediumLuggage,
  handLuggage,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: PersonalDetailsFormProps) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Pre-fill form fields with user data when component mounts
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");

      // The phone field will be filled from the user object
      // which gets loaded from Firestore by the auth context
      setPhone(user.phoneNumber || "");
    }
  }, [user]);

  // Form validation
  const isFormValid =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    email.includes("@") &&
    phone.trim() !== "" &&
    // Validate UK phone number format
    /^\+44[0-9]{9,10}$/.test(phone.replace(/-/g, ""));

  const handleSubmit = () => {
    if (isFormValid) {
      // Submit the booking with agreement
      onSubmit(
        {
          fullName,
          email,
          phone,
          specialRequests,
        },
        true
      );
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not specified";
    return format(date, "EEE, d MMM yyyy");
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-5 duration-500 h-full flex flex-col">
      {!showConfirmation ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold">Passenger Details</h2>
            <Button
              variant="ghost"
              onClick={onBack}
              size="lg"
              className="gap-2 h-12"
            >
              <ArrowLeft size={20} />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-grow overflow-y-auto">
            {/* Contact Information Card - Reduced vertical gaps and 3-1 layout */}
            <Card className="border shadow-sm flex-1 flex flex-col">
              <CardHeader className="py-3">
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* 3 small fields on the left (reduced by 30%) */}
                  <div className="md:col-span-3 space-y-4">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="text-base font-medium"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 h-12 bg-muted/40"
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-base font-medium flex items-center gap-1"
                      >
                        Email Address *{" "}
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        className="mt-1 h-12 bg-muted/50"
                        required
                        readOnly
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-base font-medium">
                        Phone Number *
                      </Label>
                      <div
                        className={`relative flex h-12 rounded-lg overflow-hidden transition-all mt-1 ${
                          phone && phone.length > 3
                            ? /^\+44[0-9]{9,10}$/.test(phone.replace(/-/g, ""))
                              ? "ring-2 ring-green-500 ring-offset-1"
                              : "ring-2 ring-destructive ring-offset-1"
                            : "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1"
                        }`}
                      >
                        <div className="flex items-center justify-center bg-muted px-4 border-r">
                          <span className="text-base font-medium">+44</span>
                        </div>
                        <Input
                          id="phone"
                          placeholder="Enter a UK number"
                          value={
                            phone.startsWith("+44")
                              ? phone.substring(3)
                              : phone.startsWith("0")
                              ? phone.substring(1)
                              : phone
                          }
                          onChange={(e) => {
                            // Remove any non-digit characters
                            let value = e.target.value.replace(/[^0-9]/g, "");

                            // Limit to 10 digits total
                            if (value.length > 10) {
                              value = value.substring(0, 10);
                            }

                            // Format with full international code
                            setPhone(`+44${value}`);
                          }}
                          className="border-0 h-full focus-visible:ring-0 bg-muted/40"
                          required
                        />
                        {phone && phone.length > 3 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {/^\+44[0-9]{9,10}$/.test(
                              phone.replace(/-/g, "")
                            ) ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <span className="text-destructive text-sm">
                                Invalid
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter a valid UK mobile number
                      </p>
                    </div>
                  </div>

                  {/* Special Requests field (increased width) */}
                  <div className="md:col-span-3 flex flex-col h-full">
                    <Label
                      htmlFor="specialRequests"
                      className="text-base font-medium mb-1"
                    >
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special requirements or notes for the driver..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="flex-grow resize-none h-full min-h-[192px] bg-muted/40"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary Card - No changes */}
            <Card className="border shadow-sm flex-1 flex flex-col">
              <CardHeader className="py-3">
                <CardTitle className="text-xl">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4 flex-grow">
                <BookingDetail
                  label="Pickup Location"
                  value={pickupLocation?.address || "Not specified"}
                  icon={MapPin}
                />

                {additionalStops.length > 0 && (
                  <div className="ml-11">
                    <p className="text-sm text-muted-foreground mb-1">
                      Stops ({additionalStops.length})
                    </p>
                    <ul className="text-base list-disc pl-4 space-y-1">
                      {additionalStops.map((stop, index) => (
                        <li key={index} className="text-base">
                          {stop.address}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <BookingDetail
                  label="Dropoff Location"
                  value={dropoffLocation?.address || "Not specified"}
                  icon={MapPin}
                />

                <BookingDetail
                  label="Date & Time"
                  value={`${formatDate(selectedDate)} at ${selectedTime}`}
                  icon={CalendarIcon}
                />

                <BookingDetail
                  label="Vehicle"
                  value={selectedVehicle.name}
                  icon={Car}
                />

                <BookingDetail
                  label="Passengers & Luggage"
                  value={`${passengers} passenger${
                    passengers !== 1 ? "s" : ""
                  } | ${checkedLuggage + mediumLuggage + handLuggage} bag${
                    checkedLuggage + mediumLuggage + handLuggage !== 1
                      ? "s"
                      : ""
                  }`}
                  icon={User}
                />

                <div className="flex-grow"></div>
              </CardContent>
              <CardFooter className="bg-muted/40 flex justify-between items-center py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <div className="font-semibold text-2xl">
                    {selectedVehicle.price.currency}
                    {selectedVehicle.price.amount}
                  </div>
                </div>
              </CardFooter>
            </Card>

            {/* Book Now button right under the Booking Summary card */}
            <div className="sticky bottom-0 border-t px-3 py-3 bg-background mt-4 w-full">
              <Button
                className="w-full text-sm h-10"
                disabled={!isFormValid || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Book Now"
                )}
              </Button>
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Booking Confirmation Screen */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-3xl font-semibold">Confirm Your Booking</h2>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              size="lg"
              className="gap-2 h-12"
            >
              <ArrowLeft size={20} />
              Back
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto flex flex-col">
            <Card className="border shadow-md mb-6 flex-grow flex flex-col">
              <CardHeader className="py-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Check className="h-6 w-6 text-primary" />
                  Booking Summary
                </CardTitle>
                <CardDescription className="text-base">
                  Please review and confirm your booking details
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 py-4 flex-grow">
                {/* Booking summary - More compact layout */}
                <div className="grid-cols-1 gap-6 h-full flex flex-col">
                  {/* Trip Details Section */}
                  <div>
                    <h3 className="font-medium text-primary text-base mb-3">
                      Trip Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mt-0.5">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              From
                            </p>
                            <p className="text-base font-medium">
                              {pickupLocation?.address || "Not specified"}
                            </p>
                          </div>

                          {additionalStops.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Via {additionalStops.length} stop
                                {additionalStops.length !== 1 ? "s" : ""}
                              </p>
                              <ul className="text-sm pl-4 space-y-1 list-disc">
                                {additionalStops.map((stop, index) => (
                                  <li key={index}>{stop.address}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <p className="text-sm text-muted-foreground">To</p>
                            <p className="text-base font-medium">
                              {dropoffLocation?.address || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <BookingDetail
                          label="Date & Time"
                          value={`${formatDate(selectedDate)}, ${selectedTime}`}
                          icon={CalendarIcon}
                        />

                        <BookingDetail
                          label="Passengers & Luggage"
                          value={`${passengers} pax, ${
                            checkedLuggage + mediumLuggage + handLuggage
                          } bags`}
                          icon={User}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details Section */}
                  <div>
                    <h3 className="font-medium text-primary text-base mb-2">
                      Contact Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <BookingDetail
                        label="Full Name"
                        value={fullName}
                        icon={User}
                      />

                      <BookingDetail label="Phone" value={phone} icon={Phone} />
                    </div>

                    <BookingDetail
                      label="Email Address"
                      value={email}
                      icon={Mail}
                    />

                    {specialRequests && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Special Requests:
                        </p>
                        <p className="text-base mt-0.5">{specialRequests}</p>
                      </div>
                    )}
                  </div>

                  {/* Vehicle & Price Section */}
                  <div className="bg-muted/40 p-4 rounded-md space-y-3 mt-auto">
                    {/* Vehicle details with updated image */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-40 h-40 flex items-center justify-center bg-primary/5 rounded">
                          {selectedVehicle.id.includes("executive") ? (
                            <Image
                              src="/images/vehicles/xequtive-3-removebg-preview.png"
                              alt={selectedVehicle.name}
                              width={160}
                              height={160}
                              className="object-contain scale-125"
                            />
                          ) : selectedVehicle.id.includes("mpv") ||
                            selectedVehicle.id.includes("van") ? (
                            <Image
                              src="/images/vehicles/xequtive-6-removebg-preview.png"
                              alt={selectedVehicle.name}
                              width={160}
                              height={160}
                              className="object-contain scale-125"
                            />
                          ) : (
                            <Image
                              src="/images/vehicles/xequtive-9-removebg-preview.png"
                              alt={selectedVehicle.name}
                              width={160}
                              height={160}
                              className="object-contain scale-125"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Vehicle
                          </p>
                          <p className="text-lg font-medium">
                            {selectedVehicle.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total Price
                        </p>
                        <p className="text-xl font-bold">
                          {selectedVehicle.price.currency}
                          {selectedVehicle.price.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions and Submit Button */}
            <div className="space-y-6 mt-auto">
              <Card className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="mb-2 font-medium">
                        Secure Booking Confirmation
                      </p>
                      <p className="text-muted-foreground">
                        By clicking &quot;Confirm Booking&quot; you agree to our{" "}
                        <a href="#" className="text-primary underline">
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full h-14 text-lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>

              {error && (
                <p className="text-destructive text-base text-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
