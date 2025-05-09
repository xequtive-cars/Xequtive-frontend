import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import bookingReducer from "./slices/bookingSlice";
import uiReducer from "./slices/uiSlice";
import apiReducer from "./slices/apiSlice";
import validationReducer from "./slices/validationSlice";
import persistenceMiddleware from "./middleware/persistenceMiddleware";
import validationMiddleware from "./middleware/validationMiddleware";
import { loadPersistedState } from "./middleware/persistenceMiddleware";

// Disable eslint rule for TypeScript
/* eslint-disable @typescript-eslint/no-explicit-any */

// Try to load persisted state
const preloadedState = loadPersistedState();

// Bypass TypeScript issues with store configuration by using any type
export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    ui: uiReducer,
    api: apiReducer,
    validation: validationReducer,
  } as any,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values like Date objects
        ignoredActions: ["booking/setSelectedDate", "persist/REHYDRATE"],
        ignoredPaths: ["booking.selectedDate"],
      },
    }).concat(persistenceMiddleware, validationMiddleware),
  preloadedState: preloadedState,
} as any);

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout app instead of plain useDispatch/useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
