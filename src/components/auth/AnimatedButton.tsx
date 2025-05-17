"use client";

import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton = ({
  variant,
  size,
  className,
  isLoading = false,
  children,
  ...props
}: AnimatedButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AnimatedButton;
