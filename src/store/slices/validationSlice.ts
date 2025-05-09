import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interface for validation errors
interface ValidationState {
  errors: {
    [key: string]: string;
  };
  formValid: boolean;
}

// Define initial state
const initialState: ValidationState = {
  errors: {},
  formValid: true,
};

const validationSlice = createSlice({
  name: "validation",
  initialState,
  reducers: {
    // Set validation errors
    setErrors: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.errors = action.payload;
      state.formValid = Object.keys(action.payload).length === 0;
    },

    // Clear all errors
    clearErrors: (state) => {
      state.errors = {};
      state.formValid = true;
    },

    // Clear specific error
    clearError: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: removed, ...rest } = state.errors;
      state.errors = rest;
      state.formValid = Object.keys(rest).length === 0;
    },

    // Validate specific field
    validateField: (
      state,
      action: PayloadAction<{
        field: string;
        value: unknown;
        rule: (value: unknown) => string | null;
      }>
    ) => {
      const { field, value, rule } = action.payload;
      const errorMessage = rule(value);

      if (errorMessage) {
        state.errors[field] = errorMessage;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: removed, ...rest } = state.errors;
        state.errors = rest;
      }

      state.formValid = Object.keys(state.errors).length === 0;
    },
  },
});

// Export actions and reducer
export const { setErrors, clearErrors, clearError, validateField } =
  validationSlice.actions;
export default validationSlice.reducer;
