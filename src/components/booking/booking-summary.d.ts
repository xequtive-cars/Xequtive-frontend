/**
 * Booking Summary Component
 *
 * A premium component to display booking details summary
 */
import * as React from "react";
import { Location } from "@/components/map/MapComponent";
interface BookingSummaryProps {
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    additionalStops: Location[];
    date: Date | undefined;
    time: string;
    passengers: number;
    checkedLuggage: number;
    handLuggage: number;
    className?: string;
}
export declare function BookingSummary({ pickupLocation, dropoffLocation, additionalStops, date, time, passengers, checkedLuggage, handLuggage, className, }: BookingSummaryProps): React.JSX.Element;
export {};
