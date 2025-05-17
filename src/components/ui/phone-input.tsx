"use client";

/**
 * Enhanced PhoneInput Component
 *
 * A UK phone input component with features like:
 * - UK country code display with flag
 * - Input validation and formatting
 * - Visual feedback for valid/invalid numbers
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import UKFlagIcon from "./icons/UKFlagIcon";

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  onChange: (value: string) => void;
  value: string;
  error?: boolean;
}

export function PhoneInput({
  className,
  onChange,
  value,
  error,
  ...props
}: PhoneInputProps) {
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Format with spaces for UK mobile: 07911 123456
    if (digits.length > 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }

    return digits;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    // Always store with +44 prefix
    onChange(
      formattedValue.startsWith("+44") ? formattedValue : `+44${formattedValue}`
    );
  };

  // Prepare the formatted value to display (strip +44 prefix for display)
  const displayValue = value.startsWith("+44") ? value.substring(3) : value;

  // Validate the number (a valid UK mobile starts with 07)
  const isValid = displayValue.replace(/\s/g, "").match(/^07\d{9}$/);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex h-14 w-full rounded-lg border overflow-hidden transition-all",
        error
          ? "border-destructive ring-2 ring-destructive/20"
          : isValid
          ? "border-green-500"
          : "border-input",
        className
      )}
    >
      <div className="flex-shrink-0 w-[5.5rem] flex items-center justify-center gap-1.5 bg-muted/80 px-3 font-medium border-r">
        <UKFlagIcon className="flex-shrink-0" />
        <span className="text-sm font-medium">+44</span>
      </div>
      <div className="relative flex-1">
        <Input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          className="flex-1 h-full w-full border-none rounded-none pl-3 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
          placeholder="7911 123456"
          maxLength={12} // "7911 123456" is 11 chars with space
          inputMode="tel"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3 text-muted-foreground">
          {isValid ? (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default PhoneInput;
