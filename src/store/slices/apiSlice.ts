import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFareEstimate } from "@/utils/services/fare-api";
import { bookingService } from "@/utils/services/booking-service";
import { FareResponse } from "@/components/booking/common/types";
import { RootState } from "..";

// Disable eslint rules for this specific file due to typing complexities

// Define the API state structure
interface ApiState {
  // Loading states
  isFetching: boolean;
  isCreatingBooking: boolean;

  // Error states
  fetchError: string | null;
  bookingError: string | null;

  // API response data
  fareData: FareResponse | null;
}

// Define initial state matching the current implementation
const initialState: ApiState = {
  isFetching: false,
  isCreatingBooking: false,
  fetchError: null,
  bookingError: null,
  fareData: null,
};

// Define async thunks for API calls
export const calculateFare = createAsyncThunk<
  FareResponse,
  void,
  {
    state: { booking: RootState["booking"] };
    rejectValue: string;
  }
>("api/calculateFare", async (_, { getState, rejectWithValue }) => {
  const { booking } = getState();

  // Destructure booking state
  const {
    pickupLocation,
    dropoffLocation,
    additionalStops,
    selectedDate,
    selectedTime,
    passengers,
    checkedLuggage,
    handLuggage,
  } = booking;

  // Validate required fields
  if (!pickupLocation || !dropoffLocation) {
    return rejectWithValue("Please specify pickup and dropoff locations");
  }

  if (!selectedDate || !selectedTime) {
    return rejectWithValue("Please specify pickup date and time");
  }

  try {
    // Log data being sent for debugging
    console.log(
      "%c 🚀 CALCULATE FARE BUTTON CLICKED 🚀",
      "background: #4CAF50; color: white; font-size: 20px; font-weight: bold; padding: 10px;"
    );
    console.log("Data being sent to getFareEstimate:");
    console.log("Pickup:", pickupLocation);
    console.log("Dropoff:", dropoffLocation);
    console.log("Stops:", additionalStops);
    console.log("Date:", selectedDate);
    console.log("Time:", selectedTime);
    console.log("Passengers:", passengers);
    console.log("Checked Luggage:", checkedLuggage);
    console.log("Hand Luggage:", handLuggage);

    const fareResponse = await getFareEstimate(
      pickupLocation,
      dropoffLocation,
      additionalStops,
      selectedDate,
      selectedTime,
      passengers,
      checkedLuggage,
      handLuggage
    );

    // Log the fare data received
    console.log("✅ getFareEstimate returned with data:", {
      responseReceived: !!fareResponse,
      responseType: typeof fareResponse,
      isObject: fareResponse && typeof fareResponse === "object",
      hasVehicleOptions: fareResponse && "vehicleOptions" in fareResponse,
      vehicleOptionsCount: fareResponse?.vehicleOptions?.length || 0,
      vehicleOptionsSample: fareResponse?.vehicleOptions?.[0]
        ? {
            id: fareResponse.vehicleOptions[0].id,
            name: fareResponse.vehicleOptions[0].name,
            price: fareResponse.vehicleOptions[0].price,
          }
        : null,
      fullResponse: fareResponse,
    });

    // Make sure we have valid data before proceeding
    if (
      !fareResponse ||
      !fareResponse.vehicleOptions ||
      fareResponse.vehicleOptions.length === 0
    ) {
      return rejectWithValue(
        "Received invalid fare data from server. Please try again."
      );
    }

    // Return the successful response
    return fareResponse;
  } catch (error: unknown) {
    console.error("❌ Error fetching fare estimates:", error);

    // Handle axios error with response data
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: {
          data?: {
            error?: {
              code?: string;
              message?: string;
            };
          };
        };
      };

      if (axiosError.response?.data?.error) {
        const apiError = axiosError.response.data.error;

        // Handle specific error codes from the API
        switch (apiError.code) {
          case "VALIDATION_ERROR":
            return rejectWithValue(
              `Validation Error: ${apiError.message || "Invalid data provided"}`
            );
          case "INVALID_LOCATION":
            return rejectWithValue(
              `Location Error: ${apiError.message || "Invalid locations"}`
            );
          case "FARE_CALCULATION_ERROR":
            return rejectWithValue(
              `Calculation Error: ${
                apiError.message || "Could not calculate fare"
              }`
            );
          default:
            return rejectWithValue(
              apiError.message || "Failed to retrieve fare estimates"
            );
        }
      }
    } else if (error && typeof error === "object" && "message" in error) {
      // Handle error objects with message property
      return rejectWithValue((error as { message: string }).message);
    }

    // Default error message
    return rejectWithValue(
      "Failed to retrieve fare estimates. Please try again."
    );
  }
});

// Create thunk for submitting booking
export const submitBooking = createAsyncThunk<
  { bookingId: string },
  {
    personalDetails: {
      fullName: string;
      email: string;
      phone: string;
      specialRequests: string;
    };
    agree: boolean;
  },
  {
    state: { booking: RootState["booking"] };
    rejectValue: string;
  }
>(
  "api/submitBooking",
  async ({ personalDetails, agree }, { getState, rejectWithValue }) => {
    const { booking } = getState();

    // Destructure booking state
    const {
      pickupLocation,
      dropoffLocation,
      additionalStops,
      selectedDate,
      selectedTime,
      passengers,
      checkedLuggage,
      handLuggage,
      selectedVehicle,
    } = booking;

    if (!agree) {
      return rejectWithValue(
        "You must agree to the terms and conditions to proceed."
      );
    }

    // Check if we have all required booking information
    if (
      !pickupLocation ||
      !dropoffLocation ||
      !selectedDate ||
      !selectedTime ||
      !selectedVehicle
    ) {
      return rejectWithValue("Missing required booking information");
    }

    try {
      console.log("Submitting booking...");

      // Step 1: Submit booking for verification
      const verificationDetails = await bookingService.createBooking(
        personalDetails,
        {
          pickupLocation,
          dropoffLocation,
          additionalStops,
          selectedDate,
          selectedTime,
          passengers,
          checkedLuggage,
          handLuggage,
          selectedVehicle,
        }
      );

      console.log("Booking verification received:", verificationDetails);

      // Step 2: Auto-confirm booking with verification token
      const confirmationResponse = await bookingService.confirmBooking(
        verificationDetails
      );

      console.log("Booking confirmed:", confirmationResponse);

      // Check if confirmation was successful
      if (confirmationResponse.success && confirmationResponse.data) {
        return {
          bookingId: confirmationResponse.data.bookingId,
        };
      } else {
        return rejectWithValue("Booking confirmation failed");
      }
    } catch (error) {
      console.error("Error creating booking:", error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue("An unexpected error occurred. Please try again.");
    }
  }
);

const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    // Clear errors
    clearFetchError: (state) => {
      state.fetchError = null;
    },
    clearBookingError: (state) => {
      state.bookingError = null;
    },

    // Reset API state
    resetApiState: (state) => {
      state.fareData = null;
      state.fetchError = null;
      state.bookingError = null;
      state.isFetching = false;
      state.isCreatingBooking = false;
    },
  },
  extraReducers: (builder) => {
    // Handle calculateFare thunk
    builder
      .addCase(calculateFare.pending, (state) => {
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(calculateFare.fulfilled, (state, action) => {
        state.isFetching = false;
        state.fareData = action.payload;
      })
      .addCase(calculateFare.rejected, (state, action) => {
        state.isFetching = false;
        state.fetchError =
          (action.payload as string) || "Failed to calculate fare";
      });

    // Handle submitBooking thunk
    builder
      .addCase(submitBooking.pending, (state) => {
        state.isCreatingBooking = true;
        state.bookingError = null;
      })
      .addCase(submitBooking.fulfilled, (state) => {
        state.isCreatingBooking = false;
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.isCreatingBooking = false;
        state.bookingError =
          (action.payload as string) || "Failed to create booking";
      });
  },
});

// Export actions and reducer
export const { clearFetchError, clearBookingError, resetApiState } =
  apiSlice.actions;

export default apiSlice.reducer;
