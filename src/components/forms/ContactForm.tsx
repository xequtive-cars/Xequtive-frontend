import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimplePhoneInput } from "@/components/ui/simple-phone-input";
import { useAuth } from "@/contexts/AuthContext";
import { FormData } from "@/types/form";

export default function ContactForm() {
  const { user } = useAuth();
  const form = useFormContext<FormData>();

  // Auto-update form when user data becomes available
  useEffect(() => {
    if (user) {
      form.setValue("fullName", user.displayName || "");
      form.setValue("email", user.email || "");
      if (user.phoneNumber) {
        form.setValue("phone", user.phoneNumber);
      }
    }
  }, [user, form]);

  return (
    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
      <h3 className="text-base font-medium">Contact Information</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your full name"
                  className="h-9 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="h-9 text-sm"
                  {...field}
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
            <FormItem className="space-y-2">
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
                  className="h-9 text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
