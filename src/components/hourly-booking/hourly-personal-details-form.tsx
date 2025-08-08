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
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SimplePhoneInput } from "@/components/ui/simple-phone-input";
import { cn } from "@/lib/utils";

// Updated schema for hourly bookings
const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  groupName: z.string().optional(),
  specialRequests: z.string().optional(),
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
      groupName?: string;
      specialRequests: string;
    },
    agree: boolean,
    e?: React.BaseSyntheticEvent
  ) => void;
  onFormValidityChange?: (isValid: boolean) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function PersonalDetailsForm({
  onSubmit,
  onFormValidityChange,
  isSubmitting = false,
  error,
}: PersonalDetailsFormProps) {
  const { user } = useAuth();

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      groupName: "",
      specialRequests: "",
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

    const { fullName, email, phone, groupName, specialRequests, termsAgreed } = data;

    // Explicitly check terms agreement
    if (!termsAgreed) {
      form.setError("termsAgreed", {
        type: "manual",
        message: "You must agree to the terms and conditions",
      });
      return;
    }

    // Prepare the submission data
    const submissionData = {
      fullName,
      email,
      phone,
      groupName: groupName || "",
      specialRequests: specialRequests || "",
    };

    onSubmit(submissionData, termsAgreed, e);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-5 duration-500 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-6 flex-1 flex flex-col justify-start">
          

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitForm)} className="space-y-6">
              {/* First row - Full Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="h-10"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          className="h-10"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Second row - Phone Number and Group Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <SimplePhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter your phone number"
                          disabled={isSubmitting}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Group Name (Optional) */}
                <FormField
                  control={form.control}
                  name="groupName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Group / Organisation Name (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter group or organisation name"
                          {...field}
                          className="h-10"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Special Requests */}
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Additional Notes / Special Requests
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements or additional notes..."
                        {...field}
                        className="min-h-[120px] resize-y bg-background border border-input"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms and Conditions */}
              <FormField
                control={form.control}
                name="termsAgreed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        I agree to the{" "}
                        <Link
                          href="/legal/terms-of-service"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/legal/privacy-policy"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Error Display */}
              {error && (
                <div className="p-3 border rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Booking...
                  </>
                ) : (
                  "Create Booking"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
