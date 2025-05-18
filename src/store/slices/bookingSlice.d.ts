import { VehicleOption } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
interface BookingState {
    pickupLocation: Location | null;
    dropoffLocation: Location | null;
    additionalStops: Location[];
    pickupAddress: string;
    dropoffAddress: string;
    stopAddresses: string[];
    selectedDate: Date | undefined;
    selectedTime: string;
    passengers: number;
    checkedLuggage: number;
    handLuggage: number;
    selectedVehicle: VehicleOption | null;
}
export declare const setPickupLocation: import("@reduxjs/toolkit").ActionCreatorWithPayload<Location | null, "booking/setPickupLocation">, setDropoffLocation: import("@reduxjs/toolkit").ActionCreatorWithPayload<Location | null, "booking/setDropoffLocation">, setAdditionalStops: import("@reduxjs/toolkit").ActionCreatorWithPayload<Location[], "booking/setAdditionalStops">, setPickupAddress: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "booking/setPickupAddress">, setDropoffAddress: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "booking/setDropoffAddress">, setStopAddresses: import("@reduxjs/toolkit").ActionCreatorWithPayload<string[], "booking/setStopAddresses">, addStop: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"booking/addStop">, removeStop: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "booking/removeStop">, updateStopAddress: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    index: number;
    value: string;
}, "booking/updateStopAddress">, setSelectedDate: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Date | undefined, "booking/setSelectedDate">, setSelectedTime: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "booking/setSelectedTime">, setPassengers: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "booking/setPassengers">, setCheckedLuggage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "booking/setCheckedLuggage">, setHandLuggage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "booking/setHandLuggage">, setSelectedVehicle: import("@reduxjs/toolkit").ActionCreatorWithPayload<VehicleOption | null, "booking/setSelectedVehicle">, resetBooking: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"booking/resetBooking">, handlePickupLocationSelect: import("@reduxjs/toolkit").ActionCreatorWithPayload<Location, "booking/handlePickupLocationSelect">, handleDropoffLocationSelect: import("@reduxjs/toolkit").ActionCreatorWithPayload<Location, "booking/handleDropoffLocationSelect">, handleStopLocationSelect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    index: number;
    location: Location;
}, "booking/handleStopLocationSelect">;
declare const _default: import("redux").Reducer<BookingState>;
export default _default;
