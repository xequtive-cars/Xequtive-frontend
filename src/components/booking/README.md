# Booking Components Architecture

This directory contains all the components related to the booking flow in the application. The components are organized to maintain a clear separation of concerns and to facilitate reusability.

## Component Structure

### Core Components

- **VehicleSelection**: Displays available vehicles with their details and allows selection
- **VehicleSelectionContainer**: Container component that orchestrates the vehicle selection process
- **BookingSummary**: Shows a summary of the booking details
- **BookingProgress**: Displays the progress through the booking flow steps
- **PassengerLuggageForm**: Form for selecting passenger count and luggage options
- **PersonalDetailsForm**: Form for entering customer information

### Data Flow

The booking flow follows these steps:

1. User enters location details (pickup, dropoff, stops)
2. User selects date and time
3. User specifies passenger count and luggage
4. System calculates fare based on inputs
5. User selects a vehicle from available options
6. User enters personal details
7. User confirms and submits booking

### Types

All shared types are centralized in the `common/types.ts` file:

- `VehicleOption`: Represents a vehicle with its details (capacity, price, etc.)
- `FareResponse`: The response from the fare calculation API
- `BookingDetails`: All details of a booking
- `PersonalDetails`: Customer information
- `BookingConfirmation`: Confirmation details after a successful booking

## Integration with Redux

The components can be used with both local React state and Redux:

- For simpler implementations, components manage their own state
- For more complex state management, these components integrate with the Redux store via the following slices:
  - `bookingSlice`: Manages booking details
  - `uiSlice`: Manages UI state like current step
  - `apiSlice`: Handles API calls for fare calculation and booking submission

## Usage

Import components from this directory using the centralized export from `index.ts`:

```tsx
import {
  VehicleSelection,
  BookingSummary,
  PassengerLuggageForm,
} from "@/components/booking";
```

For types:

```tsx
import type { VehicleOption, FareResponse } from "@/components/booking";
```
