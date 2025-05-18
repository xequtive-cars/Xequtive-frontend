declare module "@/components/booking" {
    interface FareResponse {
        distance_miles?: number;
        duration_minutes?: number;
    }
}
export default function NewBookingPage(): import("react").JSX.Element;
