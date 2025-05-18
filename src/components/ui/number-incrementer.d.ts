import React from "react";
export interface NumberIncrementerProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
    disabled?: boolean;
}
export declare function NumberIncrementer({ value, onChange, min, max, label, disabled, }: NumberIncrementerProps): React.JSX.Element;
