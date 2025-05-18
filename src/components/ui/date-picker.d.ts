/**
 * Premium DatePicker Component
 *
 * A luxury date picker with refined visual design:
 * - High-contrast, accessible navigation
 * - Premium visual aesthetics
 * - Thoughtful spacing and layout
 * - Elegant transitions and animations
 */
import * as React from "react";
export interface DatePickerProps {
    date?: Date;
    onDateChange: (date: Date | undefined) => void;
    label?: string;
    className?: string;
    selectedTime?: string;
    placeholder?: string;
    disabled?: boolean;
}
export declare function DatePicker({ date, onDateChange, label, className, selectedTime, placeholder, disabled, }: DatePickerProps): React.JSX.Element;
