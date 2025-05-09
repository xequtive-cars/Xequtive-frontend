import { Middleware } from "@reduxjs/toolkit";

// Disable eslint rule for this specific file due to typing complexities
/* eslint-disable @typescript-eslint/no-explicit-any */

// Interface for validation errors
interface ValidationErrors {
  [key: string]: string;
}

// Middleware for form validation
const validationMiddleware: Middleware = (store) => (next) => (action) => {
  // Process specific actions that need validation
  if (typeof action === "object" && action !== null && "type" in action) {
    const actionType = action.type as string;

    if (actionType === "booking/handlePickupLocationSelect") {
      // No validation needed for setting pickup
      return next(action);
    }

    if (actionType === "booking/handleDropoffLocationSelect") {
      // No validation needed for setting dropoff
      return next(action);
    }

    if (actionType === "api/calculateFare/pending") {
      const state = store.getState() as any;
      const booking = state.booking;

      // Validate required fields
      const errors: ValidationErrors = {};

      if (!booking?.pickupLocation) {
        errors.pickupLocation = "Pickup location is required";
      }

      if (!booking?.dropoffLocation) {
        errors.dropoffLocation = "Dropoff location is required";
      }

      if (!booking?.selectedDate) {
        errors.selectedDate = "Pickup date is required";
      }

      if (!booking?.selectedTime) {
        errors.selectedTime = "Pickup time is required";
      }

      // If we have errors, dispatch an action to show them
      if (Object.keys(errors).length > 0) {
        store.dispatch({
          type: "validation/setErrors",
          payload: errors,
        });

        // Return a rejected action
        return store.dispatch({
          type: "api/calculateFare/rejected",
          payload: "Please fill in all required fields",
          meta: { requestId: "", rejectedWithValue: true },
        });
      }
    }

    if (actionType === "ui/goToVehicleStep") {
      const state = store.getState() as any;
      const api = state.api;

      // Can't go to vehicle step if we don't have fare data
      if (!api?.fareData) {
        return store.dispatch({
          type: "api/calculateFare/rejected",
          payload: "Please calculate fare first",
          meta: { requestId: "", rejectedWithValue: true },
        });
      }
    }

    if (actionType === "ui/goToDetailsStep") {
      const state = store.getState() as any;
      const booking = state.booking;

      // Can't go to details step if no vehicle is selected
      if (!booking?.selectedVehicle) {
        return store.dispatch({
          type: "validation/setErrors",
          payload: { selectedVehicle: "Please select a vehicle first" },
        });
      }
    }
  }

  // Pass all other actions through
  return next(action);
};

export default validationMiddleware;
