import { Middleware } from "@reduxjs/toolkit";

// Disable eslint rule for this specific file due to typing complexities
/* eslint-disable @typescript-eslint/no-explicit-any */

const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // Process the action first
  const result = next(action);

  // Check if action is an object with a type property
  if (typeof action === "object" && action !== null && "type" in action) {
    const actionType = action.type as string;
    const state = store.getState() as any;

    // Only persist specific actions
    if (
      actionType.startsWith("booking/") ||
      (actionType.startsWith("api/") && actionType.includes("fulfilled"))
    ) {
      try {
        // Don't save on booking submission success - user is done with this booking
        if (actionType === "api/submitBooking/fulfilled") {
          localStorage.removeItem("bookingData");
          localStorage.removeItem("fareData");
          return result;
        }

        // Serialize and save booking data
        const bookingData = state.booking;

        if (bookingData) {
          // Handle Date objects
          const serializedBookingData = {
            ...bookingData,
            selectedDate: bookingData.selectedDate
              ? bookingData.selectedDate.toISOString()
              : null,
          };

          localStorage.setItem(
            "bookingData",
            JSON.stringify(serializedBookingData)
          );
        }

        // Save fare data if it exists
        if (state.api && state.api.fareData) {
          localStorage.setItem("fareData", JSON.stringify(state.api.fareData));
        }
      } catch (err) {
        console.error("Failed to save state to localStorage:", err);
      }
    }
  }

  return result;
};

// Load persisted state from localStorage
export const loadPersistedState = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    // Load booking data
    const bookingDataString = localStorage.getItem("bookingData");
    let bookingData = null;

    if (bookingDataString) {
      try {
        const parsedData = JSON.parse(bookingDataString);

        // Convert ISO date strings back to Date objects
        if (parsedData.selectedDate) {
          parsedData.selectedDate = new Date(parsedData.selectedDate);
        }

        bookingData = parsedData;
      } catch (error) {
        console.error("Error parsing booking data from localStorage:", error);
      }
    }

    // Load fare data
    const fareDataString = localStorage.getItem("fareData");
    let fareData = null;

    if (fareDataString) {
      try {
        fareData = JSON.parse(fareDataString);
      } catch (error) {
        console.error("Error parsing fare data from localStorage:", error);
      }
    }

    // Return combined state
    return {
      booking: bookingData ? bookingData : undefined,
      api: {
        fareData: fareData || null,
        isFetching: false,
        error: null,
        bookingId: null,
        success: false,
      },
      validation: {
        errors: {},
        isValid: true,
      },
    };
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return undefined;
  }
};

export default persistenceMiddleware;
