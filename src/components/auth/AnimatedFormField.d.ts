import React from "react";
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
export declare const AnimatedFormField: <T extends FieldValues>({ form, name, label, placeholder, type, className, rightIcon, autoComplete, required, description, }: AnimatedFormFieldProps<T>) => React.JSX.Element;
export default AnimatedFormField;
