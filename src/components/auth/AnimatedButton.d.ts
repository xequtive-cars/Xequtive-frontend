import React from "react";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    children: React.ReactNode;
}
export declare const AnimatedButton: ({ variant, size, className, isLoading, children, ...props }: AnimatedButtonProps) => React.JSX.Element;
export default AnimatedButton;
