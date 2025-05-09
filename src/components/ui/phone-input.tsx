"use client";

/**
 * Enhanced PhoneInput Component
 *
 * An international phone input component with features like:
 * - Country code selection with flags
 * - Input validation and formatting
 * - Support for different phone number formats
 * - Visual feedback for valid/invalid numbers
 */

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// We need to create a command component for country selection
// These will be imported from shadcn UI components
// For now, let's use a simpler dropdown approach
const CommandInput = ({ placeholder }: { placeholder: string }) => (
  <Input
    className="h-9 border-none focus-visible:ring-0"
    placeholder={placeholder}
  />
);

const CommandEmpty = ({ children }: { children: React.ReactNode }) => (
  <div className="py-6 text-center text-sm">{children}</div>
);

const CommandGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="max-h-[300px] overflow-y-auto">{children}</div>
);

const CommandList = ({ children }: { children: React.ReactNode }) => (
  <div className="p-1">{children}</div>
);

const CommandItem = ({
  className,
  onSelect,
  children,
  ...props
}: {
  className?: string;
  onSelect: () => void;
  children: React.ReactNode;
  [key: string]: unknown;
}) => (
  <div
    onClick={onSelect}
    className={cn(
      "px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const Command = ({ children }: { children: React.ReactNode }) => (
  <div className="border-none bg-transparent p-0">{children}</div>
);

// Later we can create proper components files for these

// Most common country codes with flags
const countryCodes = [
  { code: "1", country: "US", label: "United States (+1)", flag: "🇺🇸" },
  { code: "44", country: "GB", label: "United Kingdom (+44)", flag: "🇬🇧" },
  { code: "49", country: "DE", label: "Germany (+49)", flag: "🇩🇪" },
  { code: "33", country: "FR", label: "France (+33)", flag: "🇫🇷" },
  { code: "34", country: "ES", label: "Spain (+34)", flag: "🇪🇸" },
  { code: "39", country: "IT", label: "Italy (+39)", flag: "🇮🇹" },
  { code: "61", country: "AU", label: "Australia (+61)", flag: "🇦🇺" },
  { code: "1", country: "CA", label: "Canada (+1)", flag: "🇨🇦" },
  { code: "86", country: "CN", label: "China (+86)", flag: "🇨🇳" },
  { code: "91", country: "IN", label: "India (+91)", flag: "🇮🇳" },
  { code: "81", country: "JP", label: "Japan (+81)", flag: "🇯🇵" },
  { code: "82", country: "KR", label: "South Korea (+82)", flag: "🇰🇷" },
  { code: "55", country: "BR", label: "Brazil (+55)", flag: "🇧🇷" },
  { code: "52", country: "MX", label: "Mexico (+52)", flag: "🇲🇽" },
  { code: "971", country: "AE", label: "UAE (+971)", flag: "🇦🇪" },
  { code: "966", country: "SA", label: "Saudi Arabia (+966)", flag: "🇸🇦" },
  { code: "65", country: "SG", label: "Singapore (+65)", flag: "🇸🇬" },
  { code: "64", country: "NZ", label: "New Zealand (+64)", flag: "🇳🇿" },
  { code: "27", country: "ZA", label: "South Africa (+27)", flag: "🇿🇦" },
];

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function PhoneInput({
  className,
  value,
  onChange,
  error = false,
  disabled = false,
  ...props
}: PhoneInputProps) {
  // Parse the value to get countryCode and phoneNumber separately
  const parsePhoneValue = (val: string): [string, string] => {
    // Remove any non-numeric, non-plus characters
    const cleaned = val.replace(/[^\d+]/g, "");

    // Check if the value starts with a plus
    if (cleaned.startsWith("+")) {
      // Find the country code
      for (const country of countryCodes) {
        if (cleaned.startsWith(`+${country.code}`)) {
          return [
            country.code,
            cleaned.substring(country.code.length + 1), // +1 for the plus sign
          ];
        }
      }

      // If no matching country code, default to first digit after the plus
      const firstPart = cleaned.substring(1, 2);
      const secondPart = cleaned.substring(2);
      return [firstPart || "1", secondPart];
    }

    // If no plus, default to US/CA
    return ["1", cleaned];
  };

  const [countryCode, phoneNumber] = parsePhoneValue(value);

  // Find the selected country
  const selectedCountry = React.useMemo(() => {
    return countryCodes.find((c) => c.code === countryCode) || countryCodes[0];
  }, [countryCode]);

  // Update the phone value when countryCode or phoneNumber changes
  const updatePhoneValue = React.useCallback(
    (newCountryCode: string, newPhoneNumber: string) => {
      onChange(`+${newCountryCode}${newPhoneNumber}`);
    },
    [onChange]
  );

  // Handle country selection
  const handleSelectCountry = (country: (typeof countryCodes)[0]) => {
    updatePhoneValue(country.code, phoneNumber);
  };

  // Handle phone number input
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract only digits
    const digits = e.target.value.replace(/\D/g, "");
    updatePhoneValue(countryCode, digits);
  };

  // Format phone number for display (optional)
  const formattedPhoneNumber = React.useMemo(() => {
    // Very basic formatting - in a real app you'd use a library like libphonenumber-js
    // This just groups digits for readability
    if (!phoneNumber) return "";

    // Different formatting based on country
    if (countryCode === "1") {
      // US/Canada
      // Format as: XXX-XXX-XXXX
      const groups = [];
      if (phoneNumber.length > 0)
        groups.push(phoneNumber.substring(0, Math.min(3, phoneNumber.length)));
      if (phoneNumber.length > 3)
        groups.push(phoneNumber.substring(3, Math.min(6, phoneNumber.length)));
      if (phoneNumber.length > 6)
        groups.push(phoneNumber.substring(6, phoneNumber.length));
      return groups.join("-");
    }

    // Default grouping for other countries (groups of 3)
    let formatted = "";
    for (let i = 0; i < phoneNumber.length; i++) {
      if (i > 0 && i % 3 === 0) formatted += " ";
      formatted += phoneNumber[i];
    }
    return formatted;
  }, [phoneNumber, countryCode]);

  return (
    <div className={cn("flex", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex h-10 items-center gap-1 pr-1 pl-3 rounded-r-none border-r-0",
              error && "border-red-500 focus-visible:ring-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <span className="text-base">{selectedCountry.flag}</span>
            <span className="text-xs">+{countryCode}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[220px]" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryCodes.map((country) => (
                  <CommandItem
                    key={`${country.country}-${country.code}`}
                    value={`${country.country} ${country.label}`}
                    onSelect={() => handleSelectCountry(country)}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-base mr-1">{country.flag}</span>
                    {country.label}
                    {country.code === countryCode && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="relative flex-1">
        <Input
          type="tel"
          inputMode="tel"
          value={formattedPhoneNumber}
          onChange={handlePhoneInput}
          disabled={disabled}
          className={cn(
            "rounded-l-none pl-2",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          {...props}
        />
      </div>
    </div>
  );
}
