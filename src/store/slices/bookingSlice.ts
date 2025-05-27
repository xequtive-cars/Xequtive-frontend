import { VehicleOption } from "@/components/booking/common/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Location } from "@/components/map/MapComponent";

// Define the state structure for booking
interface BookingState {
  // Location information
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  additionalStops: Location[];
  pickupAddress: string;
  dropoffAddress: string;
  stopAddresses: string[];

  // Date and time
  selectedDate: Date | undefined;
  selectedTime: string;

  // Passenger and luggage information
  passengers: number;
  checkedLuggage: number;
  mediumLuggage: number;
  handLuggage: number;

  // Additional requests
  babySeat: number;
  childSeat: number;
  boosterSeat: number;
  wheelchair: number;

  // Vehicle selection
  selectedVehicle: VehicleOption | null;
}

// Define initial state matching the current implementation
const initialState: BookingState = {
  pickupLocation: null,
  dropoffLocation: null,
  additionalStops: [],
  pickupAddress: "",
  dropoffAddress: "",
  stopAddresses: [],

  selectedDate: undefined,
  selectedTime: "",

  passengers: 1,
  checkedLuggage: 0,
  mediumLuggage: 0,
  handLuggage: 0,

  babySeat: 0,
  childSeat: 0,
  boosterSeat: 0,
  wheelchair: 0,

  selectedVehicle: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Location actions
    setPickupLocation: (state, action: PayloadAction<Location | null>) => {
      state.pickupLocation = action.payload;
    },
    setDropoffLocation: (state, action: PayloadAction<Location | null>) => {
      state.dropoffLocation = action.payload;
    },
    setAdditionalStops: (state, action: PayloadAction<Location[]>) => {
      state.additionalStops = action.payload;
    },
    setPickupAddress: (state, action: PayloadAction<string>) => {
      state.pickupAddress = action.payload;
    },
    setDropoffAddress: (state, action: PayloadAction<string>) => {
      state.dropoffAddress = action.payload;
    },
    setStopAddresses: (state, action: PayloadAction<string[]>) => {
      state.stopAddresses = action.payload;
    },
    addStop: (state) => {
      state.stopAddresses.push("");
    },
    removeStop: (state, action: PayloadAction<number>) => {
      state.stopAddresses = state.stopAddresses.filter(
        (_, index) => index !== action.payload
      );
      state.additionalStops = state.additionalStops.filter(
        (_, index) => index !== action.payload
      );
    },
    updateStopAddress: (
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) => {
      const { index, value } = action.payload;
      state.stopAddresses[index] = value;
    },

    // Date and time actions
    setSelectedDate: (state, action: PayloadAction<Date | undefined>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string>) => {
      state.selectedTime = action.payload;
    },

    // Passenger and luggage actions
    setPassengers: (state, action: PayloadAction<number>) => {
      state.passengers = action.payload;
    },
    setCheckedLuggage: (state, action: PayloadAction<number>) => {
      state.checkedLuggage = action.payload;
    },
    setMediumLuggage: (state, action: PayloadAction<number>) => {
      state.mediumLuggage = action.payload;
    },
    setHandLuggage: (state, action: PayloadAction<number>) => {
      state.handLuggage = action.payload;
    },

    // Additional requests actions
    setBabySeat: (state, action: PayloadAction<number>) => {
      state.babySeat = action.payload;
    },
    setChildSeat: (state, action: PayloadAction<number>) => {
      state.childSeat = action.payload;
    },
    setBoosterSeat: (state, action: PayloadAction<number>) => {
      state.boosterSeat = action.payload;
    },
    setWheelchair: (state, action: PayloadAction<number>) => {
      state.wheelchair = action.payload;
    },

    // Vehicle selection actions
    setSelectedVehicle: (
      state,
      action: PayloadAction<VehicleOption | null>
    ) => {
      state.selectedVehicle = action.payload;
    },

    // Reset booking
    resetBooking: (state) => {
      Object.assign(state, initialState);
    },

    // Handle location select with address update
    handlePickupLocationSelect: (state, action: PayloadAction<Location>) => {
      state.pickupLocation = action.payload;
      state.pickupAddress = action.payload.address || "";
    },
    handleDropoffLocationSelect: (state, action: PayloadAction<Location>) => {
      state.dropoffLocation = action.payload;
      state.dropoffAddress = action.payload.address || "";
    },
    handleStopLocationSelect: (
      state,
      action: PayloadAction<{ index: number; location: Location }>
    ) => {
      const { index, location } = action.payload;
      if (index >= 0 && index < state.additionalStops.length) {
        state.additionalStops[index] = location;
      } else {
        state.additionalStops.push(location);
      }
      state.stopAddresses[index] = location.address || "";
    },
  },
});

// Export actions and reducer
export const {
  setPickupLocation,
  setDropoffLocation,
  setAdditionalStops,
  setPickupAddress,
  setDropoffAddress,
  setStopAddresses,
  addStop,
  removeStop,
  updateStopAddress,
  setSelectedDate,
  setSelectedTime,
  setPassengers,
  setCheckedLuggage,
  setMediumLuggage,
  setHandLuggage,
  setSelectedVehicle,
  resetBooking,
  handlePickupLocationSelect,
  handleDropoffLocationSelect,
  handleStopLocationSelect,
  setBabySeat,
  setChildSeat,
  setBoosterSeat,
  setWheelchair,
} = bookingSlice.actions;

export default bookingSlice.reducer;
