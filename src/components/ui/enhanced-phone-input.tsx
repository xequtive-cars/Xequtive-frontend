"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// International phone codes with country names and regex patterns
const PHONE_CODES = [
  {
    code: "+44",
    country: "United Kingdom",
    regex: /^(07\d{9}|447\d{9})$/,
    placeholder: "7911 123456",
  },
  {
    code: "+1",
    country: "United States",
    regex: /^(\d{10})$/,
    placeholder: "123 456 7890",
  },
  {
    code: "+91",
    country: "India",
    regex: /^[6-9]\d{9}$/,
    placeholder: "9876 543210",
  },
  {
    code: "+61",
    country: "Australia",
    regex: /^(04\d{8})$/,
    placeholder: "0412 345 678",
  },
  {
    code: "+86",
    country: "China",
    regex: /^1[3-9]\d{9}$/,
    placeholder: "138 1234 5678",
  },
];

interface EnhancedPhoneInputProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EnhancedPhoneInput({
  onChange,
  placeholder = "Enter phone number",
  className,
}: EnhancedPhoneInputProps) {
  const [selectedCode, setSelectedCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Find the current country code configuration
  const currentCodeConfig = PHONE_CODES.find(
    (code) => code.code === selectedCode
  );

  // Validate phone number based on selected country's regex
  useEffect(() => {
    if (currentCodeConfig) {
      const isNumberValid = currentCodeConfig.regex.test(
        phoneNumber.replace(/\s/g, "")
      );
      setIsValid(isNumberValid);
    }
  }, [phoneNumber, selectedCode, currentCodeConfig]);

  // Handle phone number input changes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    setPhoneNumber(inputValue);

    // Call onChange with full phone number including country code
    if (onChange) {
      onChange(`${selectedCode}${inputValue}`);
    }
  };

  // Handle country code selection
  const handleCodeSelect = (code: string) => {
    setSelectedCode(code);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "border border-r-0 rounded-l-lg px-3 py-2 text-sm font-medium bg-muted/40 hover:bg-muted/60 transition-colors",
              isDropdownOpen && "bg-muted/60"
            )}
          >
            {selectedCode}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-48 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {PHONE_CODES.map((country) => (
                <div
                  key={country.code}
                  onClick={() => handleCodeSelect(country.code)}
                  className="px-3 py-2 hover:bg-muted/40 cursor-pointer flex justify-between items-center text-sm"
                >
                  <span>{country.country}</span>
                  <span className="text-muted-foreground">{country.code}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={currentCodeConfig?.placeholder || placeholder}
          className={cn(
            "flex-1 h-10 rounded-l-none border-l-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            isValid ? "border-green-500" : "border-destructive",
            className
          )}
        />

        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {phoneNumber &&
            (isValid ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-destructive" />
            ))}
        </div>
      </div>

      {/* Validation Hint */}
      {!isValid && phoneNumber && (
        <p className="text-xs text-destructive mt-1">
          Please enter a valid {currentCodeConfig?.country} phone number
        </p>
      )}
    </div>
  );
}
