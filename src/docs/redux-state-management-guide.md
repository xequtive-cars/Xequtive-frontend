# Redux State Management Guide

This guide explains the Redux state management implementation for the Xequtive booking system and provides instructions for testing.

## Overview

Our Redux implementation follows a modern approach using Redux Toolkit, which simplifies the Redux boilerplate and provides a more intuitive API. The state is divided into several slices, each responsible for a different aspect of the application:

1. **Booking Slice**: Manages all booking-related data (locations, dates, passengers, etc.)
2. **UI Slice**: Handles UI state (current step, visibility of components, etc.)
3. **API Slice**: Manages API interactions, loading states, and response data
4. **Validation Slice**: Handles form validation errors and form validity

## Store Configuration

The store is configured in `src/store/index.ts` and includes:

- Reducer composition from all slices
- Custom middleware for persistence and validation
- Serialization configuration to handle non-serializable values like Date objects
- Type definitions for TypeScript integration

## Slices

### Booking Slice

The booking slice (`src/store/slices/bookingSlice.ts`) manages all booking data:

- Location information (pickup, dropoff, stops)
- Date and time selection
- Passenger and luggage counts
- Selected vehicle

Key actions include:

- `setPickupLocation`/`setDropoffLocation`
- `setSelectedDate`/`setSelectedTime`
- `setPassengers`/`setCheckedLuggage`/`setHandLuggage`
- `setSelectedVehicle`

### UI Slice

The UI slice (`src/store/slices/uiSlice.ts`) manages the user interface state:

- Current booking step
- Visibility of different UI components (map, vehicle options, etc.)
- Success/error modals

Key actions include:

- `setCurrentStep`
- `goToLocationStep`/`goToLuggageStep`/`goToVehicleStep`/`goToDetailsStep`
- `handleBackToForm`/`handleBackToVehicleSelection`

### API Slice

The API slice (`src/store/slices/apiSlice.ts`) manages API interactions:

- Loading states
- Error handling
- API response data

Key thunks include:

- `calculateFare`: Fetches fare estimates based on booking data
- `submitBooking`: Submits the booking to the backend

### Validation Slice

The validation slice (`src/store/slices/validationSlice.ts`) manages form validation:

- Form validation errors
- Form validity state

Key actions include:

- `setErrors`
- `clearErrors`
- `validateField`

## Middleware

### Persistence Middleware

The persistence middleware (`src/store/middleware/persistenceMiddleware.ts`) handles:

- Saving booking state to `localStorage`
- Loading persisted state when the app initializes
- Clearing saved data after successful booking

### Validation Middleware

The validation middleware (`src/store/middleware/validationMiddleware.ts`) handles:

- Validating booking data before API requests
- Preventing invalid step transitions
- Setting validation errors

## Hooks

We provide type-safe hooks for interacting with the Redux store:

- `useAppDispatch`: Type-safe version of `useDispatch`
- `useAppSelector`: Type-safe version of `useSelector`

## Components Using Redux

### VehicleSelectionContainer

The `VehicleSelectionContainer` component (`src/components/vehicle-selection/VehicleSelectionContainer.tsx`) demonstrates how to integrate with Redux:

- Selects relevant state from the store
- Dispatches actions to update state
- Memoizes derived data to prevent unnecessary re-renders

### NewBookingPageRedux

The `NewBookingPageRedux` component (`src/app/dashboard/new-booking/page-redux.tsx`) shows how to fully integrate a page with Redux:

- Replaces all local state with Redux state
- Dispatches actions for all user interactions
- Responds to changes in Redux state

## Testing the Implementation

To test the Redux implementation, follow these steps:

### 1. Testing the New Booking Page

- Navigate to `/dashboard/new-booking-redux` (the Redux version of the page)
- Fill in the pickup and dropoff locations
- Select a date and time
- Click "Next: Passengers & Luggage"
- Adjust passenger and luggage counts
- Click "Calculate Fare & Select Vehicle"
- Select a vehicle from the options presented
- Click "Continue"
- Fill in the personal details form
- Submit the booking
- Verify the success dialog appears

### 2. Testing Persistence

- Start filling out the booking form
- Refresh the page
- Verify that your progress is restored

### 3. Testing Validation

- Try to proceed without entering required fields
- Verify that appropriate error messages are displayed

### 4. Testing Vehicle Capacity Validation

- Set a high number of passengers or luggage
- Calculate fare
- Verify that vehicles with insufficient capacity are marked accordingly

## Debugging Tips

1. **Redux DevTools**: Install the Redux DevTools browser extension to inspect state changes
2. **Console Logging**: We've added detailed console logs in the API thunks to help debug
3. **Local Storage**: Check browser developer tools -> Application -> Local Storage to see persisted data

## Known Limitations

1. **TypeScript Complexity**: Due to some typing challenges, we've had to use type assertions in a few places
2. **Mock API**: The current implementation uses mock API data

## Next Steps

1. **Integration with Backend**: Replace mock API with real backend calls
2. **Enhanced Validation**: Add more comprehensive validation rules
3. **Better Error Handling**: Improve error messaging and recovery

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
- [TypeScript Redux Documentation](https://redux.js.org/usage/usage-with-typescript)
