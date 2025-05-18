/**
 * Enhanced PhoneInput Component
 *
 * A UK phone input component with features like:
 * - UK country code display with flag
 * - Input validation and formatting
 * - Visual feedback for valid/invalid numbers
 */
import * as React from "react";
interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    onChange: (value: string) => void;
    value: string;
    error?: boolean;
}
export declare function PhoneInput({ className, onChange, value, error, ...props }: PhoneInputProps): React.JSX.Element;
export default PhoneInput;
