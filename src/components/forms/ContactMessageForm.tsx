"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SimplePhoneInput } from "@/components/ui/simple-phone-input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { apiClient, ApiResponse } from "@/lib/api-client";

// Contact form schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms of service"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactMessageForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      agreeToTerms: false,
    },
  });

  // Auto-fill form with user data if available
  useEffect(() => {
    if (user) {
      const fullName = user.displayName || "";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      form.setValue("firstName", firstName);
      form.setValue("lastName", lastName);
      form.setValue("email", user.email || "");
      if (user.phoneNumber) {
        form.setValue("phone", user.phoneNumber);
      }
    }
  }, [user, form]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Use apiClient to call the backend endpoint
      const response = await apiClient.post("/api/contact/message", data) as ApiResponse<{ messageId: string }>;

      if (response.success) {
        setIsSuccess(true);
        form.reset();
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        throw new Error(response.error?.message || "Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-3">Send us message</h2>
        <p className="text-muted-foreground text-lg">
          Please fill in the form below to get in touch with us.
        </p>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 animate-in zoom-in-50 duration-300" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Message Sent Successfully!</h3>
              <p className="text-green-700 mt-1">
                Thank you for your message. We'll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 transition-all duration-300 ${isSubmitting ? 'opacity-75 pointer-events-none' : ''}`}>
        {/* First Name, Last Name, and Phone Number in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Input
              placeholder="First Name"
              {...form.register("firstName")}
              className="h-14 text-lg"
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Last Name"
              {...form.register("lastName")}
              className="h-14 text-lg"
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <SimplePhoneInput
              value={form.watch("phone")}
              onChange={(value) => {
                form.setValue('phone', value, { 
                  shouldValidate: true,
                  shouldDirty: true
                });
              }}
              error={!!form.formState.errors.phone}
              className="h-14 text-lg"
              placeholder="Phone Number"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email Address"
            {...form.register("email")}
            className="h-14 text-lg"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Textarea
            placeholder="Message"
            {...form.register("message")}
            className="min-h-[160px] resize-none text-lg"
            rows={6}
          />
          {form.formState.errors.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3">
          <div className="relative">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={form.watch("agreeToTerms")}
              onChange={(e) => form.setValue("agreeToTerms", e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="agreeToTerms"
              className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-muted-foreground/30 cursor-pointer transition-all duration-200 hover:border-[#8B0000] hover:shadow-lg hover:shadow-[#8B0000]/20 focus-within:ring-2 focus-within:ring-[#8B0000]/20 focus-within:ring-offset-2"
            >
              {form.watch("agreeToTerms") && (
                <div className="w-2 h-2 rounded-full bg-[#8B0000] animate-in zoom-in-50 duration-200" />
              )}
            </label>
          </div>
          <label
            htmlFor="agreeToTerms"
            className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
          >
            I've read and agree with{" "}
            <a
              href="/terms"
              className="text-[#8B0000] hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              terms of service
            </a>{" "}
            and{" "}
            <a
              href="/policy"
              className="text-[#8B0000] hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
            .
          </label>
        </div>
        {form.formState.errors.agreeToTerms && (
          <p className="text-sm text-destructive">
            {form.formState.errors.agreeToTerms.message}
          </p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full h-14 text-lg bg-[#8B0000] hover:bg-[#A00000] disabled:bg-[#8B0000]/70 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-[#8B0000]/30 group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin transition-all duration-300" />
              <span className="transition-all duration-300">Sending your message...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5 text-green-400 transition-all duration-300" />
              <span className="transition-all duration-300">Message Sent!</span>
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              <span className="transition-all duration-300">Send Message</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
