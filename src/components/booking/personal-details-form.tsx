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
import { Check, ChevronDown, Plane, Train, CreditCard, Banknote } from "lucide-react";
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
import { SimplePhoneInput } from "@/components/ui/simple-phone-input";
import { SearchableInput } from "@/components/ui/searchable-input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
  paymentMethod: z.enum(["cash", "card"], {
    required_error: "Please select a payment method",
  }),
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
      paymentMethod: undefined,
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

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      // Only update if the field is currently empty
      if (!form.getValues("fullName") && user.displayName) {
        form.setValue("fullName", user.displayName);
      }
      if (!form.getValues("email") && user.email) {
        form.setValue("email", user.email);
      }
      if (!form.getValues("phone") && user.phoneNumber) {
        form.setValue("phone", user.phoneNumber);
      }
    }
  }, [user, form]);

  // Add useEffect to track form validity
  useEffect(() => {
    // Check form validity and notify parent component
    const { isValid } = form.formState;

    // Explicitly check required fields
    const requiredFieldsFilled =
      !!form.getValues("fullName") &&
      !!form.getValues("email") &&
      !!form.getValues("phone") &&
      form.getValues("termsAgreed") === true;

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



    const { fullName, email, phone, specialRequests, termsAgreed, flightInformation, trainInformation } = data;

    // Explicitly check terms agreement
    if (!termsAgreed) {
      form.setError("termsAgreed", {
        type: "manual",
        message: "You must agree to the terms and conditions",
      });
      return;
    }

    // Prepare the submission data with optional flight/train information
    const submissionData = {
      fullName,
      email,
      phone,
      specialRequests: specialRequests || "",
      ...(flightInformation && flightInformation.airline && flightInformation.flightNumber && flightInformation.scheduledDeparture && {
        flightInformation: {
          airline: flightInformation.airline,
          flightNumber: flightInformation.flightNumber,
          scheduledDeparture: flightInformation.scheduledDeparture,
        }
      }),
      ...(trainInformation && trainInformation.trainOperator && trainInformation.trainNumber && trainInformation.scheduledDeparture && {
        trainInformation: {
          trainOperator: trainInformation.trainOperator,
          trainNumber: trainInformation.trainNumber,
          scheduledDeparture: trainInformation.scheduledDeparture,
        }
      }),
    };

    onSubmit(submissionData, termsAgreed, e);
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
                    <FormLabel className="text-sm">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={false}
                        className="h-10 bg-background border border-border cursor-text text-xs md:text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    {!user?.displayName && (
                      <p className="text-xs text-muted-foreground">
                        This information will be saved to your profile
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        disabled
                        className="h-10 bg-muted/40 border border-border cursor-not-allowed text-xs md:text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Phone Number</FormLabel>
                    <FormControl>
                      <SimplePhoneInput
                        {...field}
                        onChange={(value) => {
                          form.setValue('phone', value, { 
                            shouldValidate: true,
                            shouldDirty: true
                          });
                        }}
                        error={!!form.formState.errors.phone}
                        className="w-full text-xs md:text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    {!user?.phoneNumber && (
                      <p className="text-xs text-muted-foreground">
                        This information will be saved to your profile
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <FormLabel className="text-sm font-medium">Payment Method</FormLabel>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          {/* Cash on Arrival Option */}
                          <div 
                            className={cn(
                              "relative flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                              field.value === "cash" 
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                                : "border-border hover:border-green-300"
                            )}
                            onClick={() => field.onChange("cash")}
                          >
                            <FormControl>
                              <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 transition-all duration-200",
                                  field.value === "cash"
                                    ? "border-green-500 bg-green-500"
                                    : "border-muted-foreground"
                                )}>
                                  {field.value === "cash" && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                  )}
                                </div>
                              </div>
                            </FormControl>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <Banknote className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium">Cash on Arrival</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Pay with cash when the driver arrives
                              </p>
                            </div>
                          </div>

                          {/* Card on Arrival Option */}
                          <div 
                            className={cn(
                              "relative flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                              field.value === "card" 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                                : "border-border hover:border-blue-300"
                            )}
                            onClick={() => field.onChange("card")}
                          >
                            <FormControl>
                              <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 transition-all duration-200",
                                  field.value === "card"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-muted-foreground"
                                )}>
                                  {field.value === "card" && (
                                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                  )}
                                </div>
                              </div>
                            </FormControl>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium">Card on Arrival</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Pay with card when the driver arrives
                              </p>
                            </div>
                          </div>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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
                              <SearchableInput
                                value={field.value || ""}
                                onChange={(value: string) => {
                                  field.onChange(value);
                                  form.trigger("flightInformation.airline");
                                }}
                                placeholder="Type or select airline"
                                suggestions={[
                                  "British Airways",
                                  "EasyJet",
                                  "Ryanair",
                                  "Jet2",
                                  "TUI Airways",
                                  "Virgin Atlantic",
                                  "Wizz Air",
                                  "Aer Lingus",
                                  "Emirates",
                                  "Qatar Airways",
                                  "Lufthansa",
                                  "KLM",
                                  "Air France",
                                  "Turkish Airlines",
                                ]}
                                className="w-full bg-background h-11"
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
                        name="flightInformation.flightNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Flight Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. BA1440"
                                className="w-full bg-background h-11"
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  form.trigger("flightInformation.flightNumber");
                                }}
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
                            <FormLabel>Arrival/Scheduled Departure</FormLabel>
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
                              <SearchableInput
                                value={field.value || ""}
                                onChange={(value: string) => {
                                  field.onChange(value);
                                  form.trigger("trainInformation.trainOperator");
                                }}
                                placeholder="Type or select operator"
                                suggestions={[
                                  "Great Western Railway",
                                  "Avanti West Coast",
                                  "TransPennine Express",
                                  "LNER",
                                  "CrossCountry",
                                  "South Western Railway",
                                  "Southeastern",
                                  "Northern",
                                  "Chiltern Railways",
                                  "ScotRail",
                                  "Transport for Wales",
                                  "Greater Anglia",
                                  "Thameslink",
                                  "Southern",
                                ]}
                                className="w-full bg-background h-11"
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
                        name="trainInformation.trainNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Train Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. GWR123"
                                className="w-full bg-background h-11"
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  form.trigger("trainInformation.trainNumber");
                                }}
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
                            <FormLabel>Arrival/Scheduled Departure</FormLabel>
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
                      href="/policy"
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
