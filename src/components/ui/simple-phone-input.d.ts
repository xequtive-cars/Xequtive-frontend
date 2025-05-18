import * as React from "react";
interface SimplePhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    onChange: (value: string) => void;
    value: string;
    error?: boolean;
}
export declare function SimplePhoneInput({ className, onChange, value, error, ...props }: SimplePhoneInputProps): React.JSX.Element;
export default SimplePhoneInput;
