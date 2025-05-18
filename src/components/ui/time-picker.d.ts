/**
 * Premium TimePicker Component
 *
 * A luxury time picker with refined visual design:
 * - Elegant time categorization (morning, afternoon, evening, night)
 * - Beautiful visual indicators
 * - 5-minute increment options with smooth scrolling
 * - Premium aesthetic with subtle animations
 */
import * as React from "react";
export interface TimePickerProps {
    time: string;
    onTimeChange: (time: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}
export declare function TimePicker({ time, onTimeChange, label, placeholder, className, disabled, }: TimePickerProps): React.JSX.Element;
