import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addStop,
  removeStop,
  setSelectedDate,
  setSelectedTime,
  setPassengers,
  setCheckedLuggage,
  setHandLuggage,
  setSelectedVehicle,
  resetBooking,
  handlePickupLocationSelect,
  handleDropoffLocationSelect,
  handleStopLocationSelect,
} from "@/store/slices/bookingSlice";
import {
  setCurrentStep,
  setShowVehicleOptions,
  setShowDetailsForm,
  setBookingSuccess,
  goToLocationStep,
  goToLuggageStep,
  goToVehicleStep,
  goToDetailsStep,
  BookingStep,
} from "@/store/slices/uiSlice";
import { calculateFare, submitBooking } from "@/store/slices/apiSlice";
import type { Location } from "@/components/map/MapComponent";
import type { VehicleOption } from "@/components/booking/common/types";

// Define the passenger details type based on what's needed for booking
interface PassengerDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

/**
 * Custom hook for booking-related state and actions
 * Provides a simplified interface to work with the booking flow
 */
export const useBooking = () => {
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => state.booking);
  const ui = useAppSelector((state) => state.ui);
  const api = useAppSelector((state) => state.api);
  const validation = useAppSelector((state) => state.validation);

  // Location actions
  const setPickup = useCallback(
    (location: Location) => {
      dispatch(handlePickupLocationSelect(location));
    },
    [dispatch]
  );

  const setDropoff = useCallback(
    (location: Location) => {
      dispatch(handleDropoffLocationSelect(location));
    },
    [dispatch]
  );

  const addAdditionalStop = useCallback(() => {
    dispatch(addStop());
  }, [dispatch]);

  const removeAdditionalStop = useCallback(
    (index: number) => {
      dispatch(removeStop(index));
    },
    [dispatch]
  );

  const updateStop = useCallback(
    (index: number, location: Location) => {
      dispatch(handleStopLocationSelect({ index, location }));
    },
    [dispatch]
  );

  // Date and time actions
  const selectDate = useCallback(
    (date: Date | undefined) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  const selectTime = useCallback(
    (time: string) => {
      dispatch(setSelectedTime(time));
    },
    [dispatch]
  );

  // Passenger and luggage actions
  const updatePassengers = useCallback(
    (count: number) => {
      dispatch(setPassengers(count));
    },
    [dispatch]
  );

  const updateCheckedLuggage = useCallback(
    (count: number) => {
      dispatch(setCheckedLuggage(count));
    },
    [dispatch]
  );

  const updateHandLuggage = useCallback(
    (count: number) => {
      dispatch(setHandLuggage(count));
    },
    [dispatch]
  );

  // Vehicle selection
  const selectVehicle = useCallback(
    (vehicle: VehicleOption) => {
      dispatch(setSelectedVehicle(vehicle));
    },
    [dispatch]
  );

  // Navigation actions
  const goToStep = useCallback(
    (step: BookingStep) => {
      dispatch(setCurrentStep(step));
    },
    [dispatch]
  );

  const goToLocationSelection = useCallback(() => {
    dispatch(goToLocationStep());
  }, [dispatch]);

  const goToPassengerSelection = useCallback(() => {
    dispatch(goToLuggageStep());
  }, [dispatch]);

  const goToVehicleSelection = useCallback(() => {
    dispatch(goToVehicleStep());
    dispatch(calculateFare());
  }, [dispatch]);

  const goToPersonalDetails = useCallback(() => {
    dispatch(goToDetailsStep());
  }, [dispatch]);

  const showVehicleOptions = useCallback(
    (show: boolean) => {
      dispatch(setShowVehicleOptions(show));
    },
    [dispatch]
  );

  const showDetailsForm = useCallback(
    (show: boolean) => {
      dispatch(setShowDetailsForm(show));
    },
    [dispatch]
  );

  const showBookingSuccess = useCallback(
    (show: boolean, bookingId: string = "") => {
      dispatch(setBookingSuccess({ show, bookingId }));
    },
    [dispatch]
  );

  // API actions
  const getFareEstimate = useCallback(() => {
    dispatch(calculateFare());
  }, [dispatch]);

  const createBooking = useCallback(
    (details: PassengerDetails, agreeToTerms: boolean) => {
      if (!agreeToTerms) {
        return;
      }

      dispatch(
        submitBooking({ personalDetails: details, agree: agreeToTerms })
      );
    },
    [dispatch]
  );

  // Reset booking state
  const resetBookingState = useCallback(() => {
    dispatch(resetBooking());
  }, [dispatch]);

  // Check if form is valid for the current step
  const isCurrentStepValid = useCallback(() => {
    switch (ui.currentStep) {
      case "location":
        return !!booking.pickupLocation && !!booking.dropoffLocation;
      case "luggage":
        return booking.passengers > 0;
      case "vehicle":
        return !!booking.selectedVehicle;
      case "details":
        return validation.isValid;
      default:
        return false;
    }
  }, [ui.currentStep, booking, validation?.isValid]);

  return {
    // State
    booking,
    ui,
    api,
    validation,

    // Location actions
    setPickupLocation: setPickup,
    setDropoffLocation: setDropoff,
    addAdditionalStop,
    removeAdditionalStop,
    updateStop,

    // Date and time actions
    selectDate,
    selectTime,

    // Passenger and luggage actions
    updatePassengers,
    updateCheckedLuggage,
    updateHandLuggage,

    // Vehicle selection
    selectVehicle,

    // Navigation actions
    goToStep,
    goToLocationSelection,
    goToPassengerSelection,
    goToVehicleSelection,
    goToPersonalDetails,
    showVehicleOptions,
    showDetailsForm,
    showBookingSuccess,

    // API actions
    getFareEstimate,
    createBooking,

    // Reset action
    resetBookingState,

    // Validation
    isCurrentStepValid,
  };
};
