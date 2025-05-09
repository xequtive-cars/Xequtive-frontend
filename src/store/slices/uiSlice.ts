import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define step types for strong typing
export type BookingStep = "location" | "luggage" | "vehicle" | "details";

// Define the UI state structure
interface UiState {
  // Current form step
  currentStep: BookingStep;

  // Visibility states
  showMap: boolean;
  showRoute: boolean;
  showVehicleOptions: boolean;
  showDetailsForm: boolean;

  // Success/error modals
  bookingSuccess: {
    show: boolean;
    bookingId: string;
  };
}

// Define initial state matching the current implementation
const initialState: UiState = {
  currentStep: "location",

  showMap: false,
  showRoute: true,
  showVehicleOptions: false,
  showDetailsForm: false,

  bookingSuccess: {
    show: false,
    bookingId: "",
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Step navigation
    setCurrentStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },

    // Visibility toggles
    setShowMap: (state, action: PayloadAction<boolean>) => {
      state.showMap = action.payload;
    },
    setShowRoute: (state, action: PayloadAction<boolean>) => {
      state.showRoute = action.payload;
    },
    setShowVehicleOptions: (state, action: PayloadAction<boolean>) => {
      state.showVehicleOptions = action.payload;
    },
    setShowDetailsForm: (state, action: PayloadAction<boolean>) => {
      state.showDetailsForm = action.payload;
    },

    // Booking success actions
    setBookingSuccess: (
      state,
      action: PayloadAction<{ show: boolean; bookingId: string }>
    ) => {
      state.bookingSuccess = action.payload;
    },

    // Navigation helpers
    goToLocationStep: (state) => {
      state.currentStep = "location";
    },
    goToLuggageStep: (state) => {
      state.currentStep = "luggage";
    },
    goToVehicleStep: (state) => {
      state.currentStep = "vehicle";
      state.showVehicleOptions = true;
    },
    goToDetailsStep: (state) => {
      state.showDetailsForm = true;
    },

    // Back navigation handlers
    handleBackToForm: (state) => {
      state.showVehicleOptions = false;
      state.showDetailsForm = false;
      state.currentStep = "location";
    },
    handleBackToVehicleSelection: (state) => {
      state.showDetailsForm = false;
    },

    // Reset UI state
    resetUiState: () => {
      return initialState;
    },

    // Close success dialog
    handleCloseSuccessDialog: (state) => {
      state.bookingSuccess = { show: false, bookingId: "" };
      state.showVehicleOptions = false;
      state.showDetailsForm = false;
      state.currentStep = "location";
    },
  },
});

// Export actions and reducer
export const {
  setCurrentStep,
  setShowMap,
  setShowRoute,
  setShowVehicleOptions,
  setShowDetailsForm,
  setBookingSuccess,
  goToLocationStep,
  goToLuggageStep,
  goToVehicleStep,
  goToDetailsStep,
  handleBackToForm,
  handleBackToVehicleSelection,
  resetUiState,
  handleCloseSuccessDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
