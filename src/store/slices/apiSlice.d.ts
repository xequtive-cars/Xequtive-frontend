import { FareResponse } from "@/components/booking/common/types";
import { RootState } from "..";
interface ApiState {
    isFetching: boolean;
    isCreatingBooking: boolean;
    fetchError: string | null;
    bookingError: string | null;
    fareData: FareResponse | null;
}
export declare const calculateFare: import("@reduxjs/toolkit").AsyncThunk<FareResponse, void, {
    state: {
        booking: RootState["booking"];
    };
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const submitBooking: import("@reduxjs/toolkit").AsyncThunk<{
    bookingId: string;
}, {
    personalDetails: {
        fullName: string;
        email: string;
        phone: string;
        specialRequests: string;
    };
    agree: boolean;
}, {
    state: {
        booking: RootState["booking"];
    };
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearFetchError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"api/clearFetchError">, clearBookingError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"api/clearBookingError">, resetApiState: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"api/resetApiState">;
declare const _default: import("redux").Reducer<ApiState>;
export default _default;
