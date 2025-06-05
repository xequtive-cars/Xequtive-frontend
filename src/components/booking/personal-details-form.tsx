import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronDown, Plane, Train } from "lucide-react";
import { CountryPhoneInput } from "@/components/ui/country-phone-input";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdvancedTimePicker } from "@/components/ui/advanced-datetime-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for travel information
interface FlightInformation {
  airline: string;
  flightNumber: string;
  scheduledDeparture: string;
  status?: "on-time" | "delayed" | "cancelled";
}

interface TrainInformation {
  trainOperator: string;
  trainNumber: string;
  scheduledDeparture: string;
  status?: "on-time" | "delayed" | "cancelled";
}

// Updated schema to match the requirements
const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  specialRequests: z.string().optional(),
  flightInformation: z
    .object({
      airline: z.string().optional(),
      flightNumber: z.string().optional(),
      scheduledDeparture: z.string().optional(),
    })
    .optional(),
  trainInformation: z
    .object({
      trainOperator: z.string().optional(),
      trainNumber: z.string().optional(),
      scheduledDeparture: z.string().optional(),
    })
    .optional(),
  termsAgreed: z.boolean().refine((val) => val, {
    message: "You must agree to the terms and conditions",
  }),
});

type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsFormProps {
  onSubmit: (
    details: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests: string;
      flightInformation?: FlightInformation;
      trainInformation?: TrainInformation;
    },
    agree: boolean,
    e?: React.BaseSyntheticEvent
  ) => void;
  onFormValidityChange?: (isValid: boolean) => void;
  isSubmitting?: boolean;
  error?: string | null;
  hasAirportLocations?: boolean;
  hasTrainStationLocations?: boolean;
  lockedDate?: Date | string;
}

export function PersonalDetailsForm({
  onSubmit,
  onFormValidityChange,
  isSubmitting = false,
  error,
  hasAirportLocations = false,
  hasTrainStationLocations = false,
  lockedDate,
}: PersonalDetailsFormProps) {
  const { user } = useAuth();
  const [isFlightDetailsOpen, setIsFlightDetailsOpen] = useState(false);
  const [isTrainDetailsOpen, setIsTrainDetailsOpen] = useState(false);

  // Ensure lockedDate is a valid date object
  const validLockedDate =
    lockedDate instanceof Date
      ? lockedDate
      : lockedDate
      ? new Date(lockedDate)
      : new Date(); // Default to current date if no date is provided

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      specialRequests: "",
      flightInformation: {
        airline: "",
        flightNumber: "",
        scheduledDeparture: "",
      },
      trainInformation: {
        trainOperator: "",
        trainNumber: "",
        scheduledDeparture: "",
      },
      termsAgreed: false,
    },
    mode: "onChange",
  });

  // Add useEffect to track form validity
  useEffect(() => {
    // Check form validity and notify parent component
    const { isValid, errors } = form.formState;

    console.log("Form Validity:", isValid);
    console.log("Form Errors:", errors);

    // Explicitly check required fields
    const requiredFieldsFilled =
      !!form.getValues("fullName") &&
      !!form.getValues("email") &&
      !!form.getValues("phone") &&
      form.getValues("termsAgreed") === true;

    console.log("Required Fields Filled:", requiredFieldsFilled);

    onFormValidityChange?.(isValid && requiredFieldsFilled);
  }, [
    form,
    form.formState.isValid,
    form.formState.errors,
    form.getValues,
    onFormValidityChange,
  ]);

  const submitForm = (
    data: PersonalDetailsFormData,
    e?: React.BaseSyntheticEvent
  ) => {
    // Add explicit prevention of default
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("Submit Form Called - Preventing Default", {
      event: e,
      data,
    });

    const { fullName, email, phone, specialRequests, termsAgreed } = data;

    // Explicitly check terms agreement
    if (!termsAgreed) {
      form.setError("termsAgreed", {
        type: "manual",
        message: "You must agree to the terms and conditions",
      });
      return;
    }

    onSubmit(
      {
        fullName,
        email,
        phone,
        specialRequests: specialRequests || "",
      },
      termsAgreed,
      e
    );
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitForm)}
          className="space-y-6 w-full max-h-none overflow-visible pr-0"
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Three Fields */}
            <div className="col-span-12 md:col-span-5 space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={!!user?.displayName}
                        className="h-11 bg-background border border-border cursor-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        disabled
                        className="h-11 bg-muted/40 border border-border cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <CountryPhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!!user?.phoneNumber}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column - Special Requests */}
            <div className="col-span-12 md:col-span-7">
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem className="h-full">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        Special Requests
                      </h3>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional requirements or notes (Optional)"
                        {...field}
                        className="min-h-[250px] max-h-[400px] resize-y border border-border cursor-text"
                        style={{
                          backgroundColor:
                            "color-mix(in oklab, var(--input) 30%, transparent)",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Flight Details Section - Conditionally Rendered */}
          {hasAirportLocations && (
            <div className="space-y-1.5 border-t pt-4 mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsFlightDetailsOpen(!isFlightDetailsOpen)}
              >
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Flight Details</span>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isFlightDetailsOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isFlightDetailsOpen && (
                <div className="space-y-3 mt-2 p-3 bg-muted/40 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name="flightInformation.airline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Airline</FormLabel>
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={(selectedValue) => {
                                  field.onChange(selectedValue);
                                }}
                              >
                                <SelectTrigger className="w-full bg-muted/40 h-11 min-w-[200px]">
                                  <SelectValue placeholder="Select Airline" />
                                </SelectTrigger>
                                <SelectContent className="select-content min-w-[250px] w-full">
                                  {[
                                    "British Airways",
                                    "EasyJet",
                                    "Ryanair",
                                    "Jet2",
                                    "TUI Airways",
                                    "Virgin Atlantic",
                                    "Wizz Air",
                                    "Aer Lingus",
                                  ].map((airline) => (
                                    <SelectItem
                                      key={airline}
                                      value={airline}
                                      className="select-item"
                                    >
                                      {airline}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name="flightInformation.flightNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Flight Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. BA1440"
                                className="w-full bg-muted/40 h-11 border border-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name="flightInformation.scheduledDeparture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Departure</FormLabel>
                            <FormControl>
                              <AdvancedTimePicker
                                datetime={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onDateTimeChange={(datetime) => {
                                  field.onChange(
                                    datetime
                                      ? datetime.toISOString()
                                      : undefined
                                  );
                                }}
                                lockedDate={validLockedDate}
                                className="bg-muted/40 h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hey, we noticed you selected airport locations. Would you
                    like to add your flight information for a more convenient
                    experience?
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Train Details Section - Conditionally Rendered */}
          {hasTrainStationLocations && (
            <div className="space-y-1.5 border-t pt-4 mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsTrainDetailsOpen(!isTrainDetailsOpen)}
              >
                <div className="flex items-center gap-2">
                  <Train className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Train Details</span>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isTrainDetailsOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isTrainDetailsOpen && (
                <div className="space-y-3 mt-2 p-3 bg-muted/40 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name="trainInformation.trainOperator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Train Operator</FormLabel>
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={(selectedValue) => {
                                  field.onChange(selectedValue);
                                }}
                              >
                                <SelectTrigger className="w-full bg-muted/40 h-11 min-w-[200px]">
                                  <SelectValue placeholder="Select Operator" />
                                </SelectTrigger>
                                <SelectContent className="select-content min-w-[250px] w-full">
                                  {[
                                    "Great Western Railway",
                                    "Avanti West Coast",
                                    "TransPennine Express",
                                    "LNER",
                                    "CrossCountry",
                                    "South Western Railway",
                                    "Southeastern",
                                    "Northern",
                                    "Chiltern Railways",
                                  ].map((operator) => (
                                    <SelectItem
                                      key={operator}
                                      value={operator}
                                      className="select-item"
                                    >
                                      {operator}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name="trainInformation.trainNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Train Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. GWR123"
                                className="w-full bg-muted/40 h-11 border border-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-full">
                      <FormField
                        control={form.control}
                        name="trainInformation.scheduledDeparture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Departure</FormLabel>
                            <FormControl>
                              <AdvancedTimePicker
                                datetime={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onDateTimeChange={(datetime) => {
                                  field.onChange(
                                    datetime
                                      ? datetime.toISOString()
                                      : undefined
                                  );
                                }}
                                lockedDate={validLockedDate}
                                className="bg-muted/40 h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We noticed you selected train station locations. Would you
                    like to add your train information for a more convenient
                    experience?
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start space-x-3 mt-4 bg-muted/30 p-3 rounded-lg border border-border">
            <FormField
              control={form.control}
              name="termsAgreed"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <FormControl>
                    <div
                      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer transition-all 
                        ${
                          field.value
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border"
                        }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      {field.value && <Check className="h-4 w-4" />}
                    </div>
                  </FormControl>
                  <div className="text-sm">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={
              !form.getValues("fullName") ||
              !form.getValues("email") ||
              !form.getValues("phone") ||
              !form.getValues("termsAgreed")
            }
          >
            {isSubmitting ? "Submitting..." : "Book Now"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
