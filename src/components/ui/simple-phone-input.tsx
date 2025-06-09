"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { ChevronDown, Search, X } from "lucide-react";
import { CountryCode, countryCodeService } from "@/lib/country-code-service";
import UKFlagIcon from "./icons/UKFlagIcon";

interface SimplePhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  onChange: (value: string) => void;
  value: string;
  error?: boolean;
  onCountryCodeChange?: (countryCode: CountryCode) => void;
}

// Country-specific phone number formatting configurations
const COUNTRY_PHONE_FORMATS: Record<string, { 
  format: string; 
  placeholder: string; 
  maxLength: number;
}> = {
  // United Kingdom
  GB: {
    format: "#### ### ###",
    placeholder: "7911 234 567",
    maxLength: 12
  },
  // United States
  US: {
    format: "(###) ### ####",
    placeholder: "(555) 123 4567",
    maxLength: 14
  },
  // India
  IN: {
    format: "## #### ####",
    placeholder: "98 1234 5678",
    maxLength: 12
  },
  // Default fallback
  DEFAULT: {
    format: "############",
    placeholder: "Enter phone number",
    maxLength: 12
  }
};

export function SimplePhoneInput({
  className,
  onChange,
  value,
  error,
  onCountryCodeChange,
  ...props
}: SimplePhoneInputProps) {
  // Track if the input is focused or has been interacted with
  const [isFocused, setIsFocused] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(
    countryCodeService.getDefaultCountryCode()
  );

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Get country-specific formatting
  const countryFormat = COUNTRY_PHONE_FORMATS[selectedCountry.code] || COUNTRY_PHONE_FORMATS.DEFAULT;

  // Format phone number based on country-specific rules
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Limit to max length
    const limitedDigits = digits.slice(0, countryFormat.maxLength);

    // If no specific formatting, return as-is
    if (countryFormat.format === "############") {
      return limitedDigits;
    }

    // Apply formatting
    let formatted = '';
    let digitIndex = 0;
    
    for (let i = 0; i < countryFormat.format.length; i++) {
      if (digitIndex >= limitedDigits.length) break;

      if (countryFormat.format[i] === '#') {
        formatted += limitedDigits[digitIndex];
        digitIndex++;
      } else {
        formatted += countryFormat.format[i];
      }
    }

    return formatted;
  };

  // Handle country selection
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery("");

    // Update phone number prefix if needed
    const currentValue = value.replace(/^\+\d+/, '');
    onChange(`${country.dialCode}${currentValue}`);

    // Notify parent of country code change
    onCountryCodeChange?.(country);
  };

  // Memoize filtered countries
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery) return countryCodeService.getAllCountryCodes();
    return countryCodeService.searchCountryCodes(searchQuery);
  }, [searchQuery]);

  // Prepare the formatted value to display (strip dial code prefix for display)
  const displayValue = value.startsWith(selectedCountry.dialCode)
    ? value.substring(selectedCountry.dialCode.length)
    : value;

  // Normalize the phone number by removing spaces and non-digits
  const normalizedValue = displayValue.replace(/\s/g, "").replace(/\D/g, "");

  // A valid mobile number check based on country
  const isValid = normalizedValue.length === countryFormat.maxLength - 2;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex h-12 w-full rounded-lg border overflow-hidden transition-all relative",
        isFocused ? "ring-1 ring-primary" : "",
        error ? "border-destructive ring-2 ring-destructive/20" : "",
        className
      )}
    >
      <div 
        className="flex-shrink-0 w-24 flex items-center justify-center gap-2 bg-muted/80 px-2 font-medium border-r cursor-pointer relative"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDropdownOpen(prev => !prev);
        }}
      >
        <span className="text-xl pointer-events-none">{selectedCountry.flag}</span>
        <span className="text-xs pointer-events-none">{selectedCountry.dialCode}</span>
        <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground pointer-events-none" />

        {/* Dropdown with theme-aware background and fixed positioning */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ 
                position: 'fixed', 
                width: containerRef.current?.offsetWidth, 
                left: containerRef.current?.getBoundingClientRect().left,
                top: (containerRef.current?.getBoundingClientRect().bottom ?? 0) + window.scrollY
              }}
              className={cn(
                "z-[9999] max-h-64 overflow-y-auto",
                "bg-background border rounded-b-lg shadow-lg",
                "dark:bg-background dark:border-muted"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background p-2 border-b flex items-center">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                  type="text" 
                  placeholder="Search countries" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none text-xs bg-transparent"
                />
                {searchQuery && (
                  <X 
                    className="h-4 w-4 text-muted-foreground cursor-pointer" 
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </div>
              <ul>
                {filteredCountries.map((country) => (
                  <li 
                    key={country.code}
                    className="px-2 py-1 hover:bg-accent cursor-pointer flex items-center text-xs"
                    onClick={() => handleCountrySelect(country)}
                  >
                    <span className="text-xl mr-2">{country.flag}</span>
                    <span className="flex-1 text-xs">{country.name}</span>
                    <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative flex-1">
        <Input
          type="tel"
          value={displayValue}
          onChange={(e) => {
            const formattedValue = formatPhoneNumber(e.target.value);

            // Always store with selected country's dial code prefix
            onChange(
              formattedValue.startsWith(selectedCountry.dialCode)
                ? formattedValue
                : `${selectedCountry.dialCode}${formattedValue}`
            );
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "flex-1 h-full w-full border-none rounded-none pl-4 pr-12",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "text-xs md:text-base lg:text-xl font-medium tracking-wider"
          )}
          placeholder={countryFormat.placeholder}
          maxLength={countryFormat.maxLength}
          inputMode="tel"
          autoComplete="tel-national"
          {...props}
        />
      </div>
    </motion.div>
  );
}

export default SimplePhoneInput;
