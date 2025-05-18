import React from "react";
interface Journey {
    distance_miles: number;
    duration_minutes: number;
}
interface BookingDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
        journey: Journey;
        createdAt: string;
    } | null;
}
declare const BookingDetailsModal: React.FC<BookingDetailsModalProps>;
export default BookingDetailsModal;
