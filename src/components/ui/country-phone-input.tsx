import React, { useState, useMemo, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { countries } from "country-codes-flags-phone-codes";
import { Search, X } from "lucide-react";

// Define types for country codes
interface CountryCode {
  country: string;
  code: string;
  flag: string;
  regex: RegExp;
  id: string;
}

// Transform the countries data into a more usable format
const COUNTRY_CODES: CountryCode[] = countries
  .filter((country) => country.dialCode) // Ensure we only include countries with dial codes
  .map((country) => ({
    country: country.name,
    code: country.dialCode,
    flag: country.flag,
    regex:
      country.dialCode === "+44"
        ? /^(7\d{8,9}|[1-9]\d{8,9})$/
        : country.dialCode === "+1"
        ? /^\d{10}$/
        : /^\d{9,10}$/, // Generic regex, can be customized
    id: country.code,
  }))
  .sort((a: CountryCode, b: CountryCode) => a.country.localeCompare(b.country)); // Sort alphabetically

interface CountryPhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  defaultCountryCode?: string;
  className?: string;
  disabled?: boolean;
}

export function CountryPhoneInput({
  value = "",
  onChange,
  defaultCountryCode = "+44",
  className,
  disabled = false,
}: CountryPhoneInputProps) {
  // Extract initial country code and phone number
  const extractedCountryCode =
    COUNTRY_CODES.find((c) => value.startsWith(c.code)) ||
    COUNTRY_CODES.find((c) => c.code === defaultCountryCode) ||
    COUNTRY_CODES[0];

  const [countryCode, setCountryCode] = useState(extractedCountryCode.code);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Remove country code and non-digit characters
    const cleanedValue = value
      .replace(extractedCountryCode.code, "")
      .replace(/\D/g, "");

    // Format phone number with spaces
    let formattedValue = cleanedValue;
    if (cleanedValue.length > 3) {
      formattedValue = `${cleanedValue.slice(0, 3)} ${cleanedValue.slice(3)}`;
    }
    if (cleanedValue.length > 6) {
      formattedValue = `${formattedValue.slice(0, 7)} ${formattedValue.slice(
        7
      )}`;
    }

    return formattedValue.trim();
  });

  // State for country search
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Memoized filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return COUNTRY_CODES;

    const normalizedSearch = searchTerm.toLowerCase().replace(/\+/g, "");
    return COUNTRY_CODES.filter(
      (country) =>
        country.country.toLowerCase().includes(normalizedSearch) ||
        country.code.toLowerCase().replace(/\+/g, "").includes(normalizedSearch)
    );
  }, [searchTerm]);

  // Validate phone number
  const isValidPhoneNumber = useMemo(() => {
    const currentCountry =
      COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
    if (!currentCountry.regex) return false;
    // Remove spaces and validate
    return currentCountry.regex.test(phoneNumber.replace(/\s/g, ""));
  }, [phoneNumber, countryCode]);

  // Handle phone number input
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const rawInput = input.value.replace(/\D/g, "");
      const prevRawValue = phoneNumber.replace(/\s/g, "");
      const cursorPosition = input.selectionStart || 0;

      // Intelligent character preservation logic
      let processedValue = rawInput;

      // If the new input is shorter than or equal to the previous value
      // and the cursor is at the beginning, preserve the first character
      if (rawInput.length <= prevRawValue.length && cursorPosition <= 1) {
        processedValue = prevRawValue.slice(0, rawInput.length);
      }

      // Limit to 10 digits
      const limitedValue = processedValue.slice(0, 10);

      // Format phone number
      let formattedValue = "";
      if (limitedValue.length > 0) {
        formattedValue += limitedValue.slice(0, 3);
        if (limitedValue.length > 3) {
          formattedValue += ` ${limitedValue.slice(3, 6)}`;
        }
        if (limitedValue.length > 6) {
          formattedValue += ` ${limitedValue.slice(6)}`;
        }
      }

      // Set the phone number
      setPhoneNumber(formattedValue);
      onChange(`${countryCode} ${formattedValue.replace(/\s/g, "")}`);

      // Restore cursor position after render
      setTimeout(() => {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    },
    [countryCode, onChange, phoneNumber]
  );

  // Handle country code change
  const handleCountryCodeChange = useCallback(
    (newCode: string) => {
      // Find the selected country
      const selectedCountry = COUNTRY_CODES.find((c) => c.code === newCode);

      if (selectedCountry) {
        setCountryCode(newCode);
        // Reset phone number when country code changes
        setPhoneNumber("");
        // Reset search term
        setSearchTerm("");
        // Trigger onChange with just the new country code
        onChange(newCode);
      }
    },
    [onChange]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    // Ensure dropdown stays open while typing
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }

    // Force focus back to search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
    setIsDropdownOpen(true);
  };

  // Prevent dropdown from closing when interacting with search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
    }

    // Reopen dropdown when deleting characters
    if (e.key === "Backspace" && searchTerm.length === 1) {
      setIsDropdownOpen(true);
    }

    // Force focus back to search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Select
        value={countryCode}
        onValueChange={handleCountryCodeChange}
        disabled={disabled}
        open={isDropdownOpen}
        onOpenChange={(open) => {
          // Always keep dropdown open when searching
          if (searchTerm || open) {
            setIsDropdownOpen(true);
          } else {
            setIsDropdownOpen(false);
          }
        }}
      >
        <SelectTrigger
          ref={selectTriggerRef}
          hideChevron
          className="w-24 h-11 focus:ring-0 px-0 py-0 bg-muted/20 border-r border-border rounded-r-none"
        >
          <SelectValue>
            <>
              <span className="mr-1">
                {COUNTRY_CODES.find((c) => c.code === countryCode)?.flag ||
                  "🌍"}{" "}
              </span>
              <span className="text-sm font-medium">{countryCode}</span>
            </>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          ref={(ref) => {
            // Ensure dropdown maintains its position and opens upwards
            if (ref) {
              ref.style.position = "absolute";
              ref.style.bottom = "100%";
              ref.style.left = "0";
              ref.style.width = selectTriggerRef.current?.offsetWidth + "px";
              ref.style.transformOrigin = "bottom";
            }
          }}
          className="border rounded-lg max-h-[300px] overflow-y-auto min-w-[350px] w-full"
          position="popper"
          sideOffset={5}
        >
          {/* Search input inside the dropdown */}
          <div className="sticky top-0 z-10 p-0 border-b bg-background rounded-t-lg">
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search country or code"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-3 pr-10 h-10 rounded-lg"
                onClick={(e) => {
                  // Prevent dropdown from closing and maintain focus
                  e.stopPropagation();
                  setIsDropdownOpen(true);
                  e.currentTarget.focus();
                }}
                onFocus={(e) => {
                  // Ensure input remains focused and dropdown stays open
                  e.target.select();
                  setIsDropdownOpen(true);
                }}
              />
              {searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Full country list, filtered by search term */}
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <SelectItem
                key={country.id}
                value={country.code}
                onSelect={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCountryCodeChange(country.code);
                  // Keep dropdown open and search input focused
                  setIsDropdownOpen(true);

                  // Use multiple methods to ensure focus
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                    searchInputRef.current?.select();
                  }, 0);
                }}
                onMouseDown={(e) => {
                  // Prevent losing focus
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="flex items-center">
                  <span className="mr-2">{country.flag}</span>
                  {country.code} - {country.country}
                </div>
              </SelectItem>
            ))
          ) : (
            <div
              className="p-4 text-center text-muted-foreground cursor-default"
              onMouseDown={(e) => {
                // Prevent losing focus
                e.preventDefault();
                e.stopPropagation();

                // Use multiple methods to ensure focus
                setTimeout(() => {
                  searchInputRef.current?.focus();
                  searchInputRef.current?.select();
                }, 0);
              }}
            >
              No countries found
            </div>
          )}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder="Enter phone number"
        disabled={disabled}
        className={cn(
          "flex-1 h-11 border-l-0 rounded-l-none pl-2 cursor-text",
          isValidPhoneNumber
            ? "focus-visible:ring-2 focus-visible:ring-green-500"
            : "focus-visible:ring-2 focus-visible:ring-destructive"
        )}
      />
    </div>
  );
}
