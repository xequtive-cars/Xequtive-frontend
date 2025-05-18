export type BookingStep = "location" | "luggage" | "vehicle" | "details";
interface UiState {
    currentStep: BookingStep;
    showMap: boolean;
    showRoute: boolean;
    showVehicleOptions: boolean;
    showDetailsForm: boolean;
    bookingSuccess: {
        show: boolean;
        bookingId: string;
    };
}
export declare const setCurrentStep: import("@reduxjs/toolkit").ActionCreatorWithPayload<BookingStep, "ui/setCurrentStep">, setShowMap: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setShowMap">, setShowRoute: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setShowRoute">, setShowVehicleOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setShowVehicleOptions">, setShowDetailsForm: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setShowDetailsForm">, setBookingSuccess: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    show: boolean;
    bookingId: string;
}, "ui/setBookingSuccess">, goToLocationStep: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/goToLocationStep">, goToLuggageStep: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/goToLuggageStep">, goToVehicleStep: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/goToVehicleStep">, goToDetailsStep: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/goToDetailsStep">, handleBackToForm: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/handleBackToForm">, handleBackToVehicleSelection: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/handleBackToVehicleSelection">, resetUiState: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/resetUiState">, handleCloseSuccessDialog: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/handleCloseSuccessDialog">;
declare const _default: import("redux").Reducer<UiState>;
export default _default;
