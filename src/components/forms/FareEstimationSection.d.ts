interface FareEstimationSectionProps {
    fareEstimate: number | null;
    estimatedDistance: number | null;
    estimatedDuration: number | null;
    showFareEstimate: boolean;
    isEstimating: boolean;
    handleEstimateFareClick: () => void;
    handleBookRideClick: () => void;
    isBooking: boolean;
    pickupLocation: boolean;
    dropoffLocation: boolean;
}
export default function FareEstimationSection({ fareEstimate, estimatedDistance, estimatedDuration, showFareEstimate, isEstimating, handleEstimateFareClick, handleBookRideClick, isBooking, pickupLocation, dropoffLocation, }: FareEstimationSectionProps): import("react").JSX.Element;
export {};
