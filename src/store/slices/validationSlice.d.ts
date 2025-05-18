interface ValidationState {
    errors: {
        [key: string]: string;
    };
    formValid: boolean;
}
export declare const setErrors: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    [key: string]: string;
}, "validation/setErrors">, clearErrors: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"validation/clearErrors">, clearError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "validation/clearError">, validateField: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    field: string;
    value: unknown;
    rule: (value: unknown) => string | null;
}, "validation/validateField">;
declare const _default: import("redux").Reducer<ValidationState>;
export default _default;
