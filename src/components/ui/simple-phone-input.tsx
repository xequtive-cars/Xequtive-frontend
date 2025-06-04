"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import UKFlagIcon from "./icons/UKFlagIcon";

interface SimplePhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  onChange: (value: string) => void;
  value: string;
  error?: boolean;
}

export function SimplePhoneInput({
  className,
  onChange,
  value,
  error,
  ...props
}: SimplePhoneInputProps) {
  // Track if the input is focused or has been interacted with
  const [isFocused, setIsFocused] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Limit to 10 digits total (not counting the hidden +44 prefix)
    const limitedDigits = digits.slice(0, 10);

    // Format with spaces for UK mobile: 7911 123 456
    if (limitedDigits.length > 7) {
      return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(
        4,
        7
      )} ${limitedDigits.slice(7)}`;
    } else if (limitedDigits.length > 4) {
      return `${limitedDigits.slice(0, 4)} ${limitedDigits.slice(4)}`;
    }

    return limitedDigits;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);

    if (!isTouched) setIsTouched(true);

    // Always store with +44 prefix
    onChange(
      formattedValue.startsWith("+44") ? formattedValue : `+44${formattedValue}`
    );
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    props.onBlur?.(e);
  };

  // Prepare the formatted value to display (strip +44 prefix for display)
  const displayValue = value.startsWith("+44") ? value.substring(3) : value;

  // Normalize the phone number by removing spaces and non-digits
  const normalizedValue = displayValue.replace(/\s/g, "").replace(/\D/g, "");

  // A valid UK mobile number has exactly 10 digits starting with 7
  // e.g., 7911123456
  const isValid =
    normalizedValue.length === 10 && normalizedValue.startsWith("7");

  // Only show validation state if the field has been interacted with and is not empty
  const showValidation = isTouched && normalizedValue.length > 0;

  // Determine the ring color - special states when focused or has validation feedback
  const getRingStyles = () => {
    if (!showValidation && !error)
      return isFocused ? "ring-1 ring-primary" : "";
    if (error) return "border-destructive ring-2 ring-destructive/20";
    if (isValid) return "border-green-500 ring-1 ring-green-500/30";
    return "border-amber-500 ring-1 ring-amber-500/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex h-12 w-full rounded-lg border overflow-hidden transition-all",
        getRingStyles(),
        className
      )}
    >
      <div className="flex-shrink-0 w-24 flex items-center justify-center gap-2 bg-muted/80 px-2 font-medium border-r">
        <UKFlagIcon className="flex-shrink-0 h-6 w-6" />
        <span className="text-base font-medium">+44</span>
      </div>
      <div className="relative flex-1">
        <Input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 h-full w-full border-none rounded-none pl-4 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl font-medium tracking-wider"
          placeholder="7911 123456"
          maxLength={11} // "7911 123456" is 10 chars + 1 space
          inputMode="tel"
          autoComplete="tel-national"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-4 text-muted-foreground">
          {showValidation && (
            <>
              {isValid ? (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-6 w-6 text-green-500"
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
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="h-6 w-6 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </motion.svg>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default SimplePhoneInput;
