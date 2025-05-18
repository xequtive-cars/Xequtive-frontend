import React from "react";
interface BookingCardProps {
    booking: {
        id: string;
        pickupDate: string;
        pickupTime: string;
        pickupLocation: {
            address: string;
        };
        dropoffLocation: {
            address: string;
        };
        vehicleType: string;
        price: number;
        status: string;
        journey: {
            distance_miles: number;
            duration_minutes: number;
        };
        createdAt: string;
    };
    onCancel?: (id: string) => void;
    showCancelButton?: boolean;
    onViewDetails?: (booking: BookingCardProps["booking"]) => void;
}
declare const BookingCard: React.FC<BookingCardProps>;
export default BookingCard;
