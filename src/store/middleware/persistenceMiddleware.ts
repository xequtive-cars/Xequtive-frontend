import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "..";

// Synchronize with localStorage middleware
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Only save actions that modify booking data
  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    ((action.type as string).includes("booking/") ||
      (action.type as string).includes("api/calculateFare") ||
      action.type === "api/submitBooking/fulfilled")
  ) {
    // Get current state after the action is processed
    const currentState = store.getState() as RootState;

    // Save booking data to localStorage for persistence
    try {
      localStorage.setItem(
        "booking-data",
        JSON.stringify(currentState.booking)
      );

      // Also save fare data if available
      if (currentState.api.fareData) {
        localStorage.setItem("fare-data", JSON.stringify(currentState.api));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Failed to save state to localStorage
    }
  }

  return result;
};

// Load state from localStorage during application startup
export const loadPersistedState = ():
  | Partial<{
      booking: unknown;
      api: unknown;
    }>
  | undefined => {
  try {
    // Only run in browser environment
    if (typeof window === "undefined") {
      return undefined;
    }

    // Load booking state
    const bookingDataString = localStorage.getItem("booking-data");
    let bookingData = undefined;

    if (bookingDataString) {
      try {
        const parsedData = JSON.parse(bookingDataString);

        // Handle date serialization/deserialization
        if (parsedData.selectedDate) {
          parsedData.selectedDate = new Date(parsedData.selectedDate);
        }

        bookingData = parsedData;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Error parsing booking data from localStorage
      }
    }

    // Load fare data
    const fareDataString = localStorage.getItem("fare-data");
    let fareData = undefined;

    if (fareDataString) {
      try {
        fareData = JSON.parse(fareDataString);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Error parsing fare data from localStorage
      }
    }

    return {
      booking: bookingData,
      api: fareData,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // Failed to load state from localStorage
    return undefined;
  }
};

export default persistenceMiddleware;
