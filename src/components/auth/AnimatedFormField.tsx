"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

interface AnimatedFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
  description?: string;
}

export const AnimatedFormField = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = "text",
  className,
  rightIcon,
  autoComplete,
  required = false,
  description,
}: AnimatedFormFieldProps<T>) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-lg font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  placeholder={placeholder}
                  type={type}
                  autoComplete={autoComplete}
                  className={cn(
                    "h-14 rounded-lg border-input bg-background px-4 py-2 text-base ring-offset-background",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    "placeholder:text-muted-foreground",
                    rightIcon ? "pr-10" : "",
                    className
                  )}
                />
                {rightIcon && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {rightIcon}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </motion.div>
  );
};

export default AnimatedFormField;
