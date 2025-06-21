import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFareEstimate,
  locationToLocationData,
} from "@/utils/services/fare-api";
import { bookingService } from "@/utils/services/booking-service";
import { FareResponse } from "@/components/booking/common/types";
import { Location } from "@/components/map/MapComponent";
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
    // Make sure we have valid locations before proceeding
    if (!pickupLocation.address || !dropoffLocation.address) {
      return rejectWithValue(
        "Valid pickup and dropoff locations with addresses are required"
      );
    }

    // Format locations for the new API structure using the helper function
    const formattedRequest = {
      locations: {
        pickup: locationToLocationData(pickupLocation),
        dropoff: locationToLocationData(dropoffLocation),
        additionalStops:
          additionalStops && additionalStops.length > 0
            ? additionalStops.map((stop: Location) =>
                locationToLocationData(stop)
              )
            : [],
      },
      datetime: {
        date:
          selectedDate instanceof Date ? selectedDate : new Date(selectedDate), // Ensure we have a Date object
        time: selectedTime,
      },
      passengers: {
        count: passengers || 1,
        checkedLuggage: checkedLuggage || 0,
        mediumLuggage: 0,
        handLuggage: handLuggage || 0,
        babySeat: 0,
        childSeat: 0,
        boosterSeat: 0,
        wheelchair: 0,
      },
    };

    // Call the fare estimation API
    const response = await getFareEstimate(formattedRequest);

    // Ensure the API responded with a success status
    if (!response.success) {
      const errorMessage = response.error?.message || "Failed to estimate fare";
      return rejectWithValue(errorMessage);
    }

    // Return the fare data
    if (!response.data?.fare) {
      return rejectWithValue("No fare data received from server");
    }
    return response.data.fare;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("An error occurred while estimating fare");
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
      flightInformation?: {
        airline?: string;
        flightNumber?: string;
        scheduledDeparture?: string;
        status?: "on-time" | "delayed" | "cancelled";
      };
      trainInformation?: {
        trainOperator?: string;
        trainNumber?: string;
        scheduledDeparture?: string;
        status?: "on-time" | "delayed" | "cancelled";
      };
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
      // Call enhanced booking endpoint that handles verification and creation in one step
      const bookingResponse = await bookingService.createBooking(
        personalDetails,
        {
          pickupLocation,
          dropoffLocation,
          additionalStops,
          selectedDate,
          selectedTime,
          passengers,
          checkedLuggage,
          mediumLuggage: 0,
          handLuggage,
          babySeat: 0,
          childSeat: 0,
          boosterSeat: 0,
          wheelchair: 0,
          selectedVehicle,
        }
      );

      return {
        bookingId: bookingResponse.bookingId,
      };
    } catch (error) {
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
