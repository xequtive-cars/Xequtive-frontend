# Vehicle Selection UI Implementation Plan

## Overview

This document outlines the implementation plan for the vehicle selection UI that will be displayed after the user completes their booking details and clicks "Calculate Fare." The interface will show different vehicle options with their prices while maintaining context with a smaller map view.

## UI Layout Transition

### Current Layout

```
┌───────────────────┬───────────────────────┐
│                   │                       │
│ Location Form     │                       │
│ (33% width)       │ Map View              │
│                   │ (67% width)           │
│                   │                       │
└───────────────────┴───────────────────────┘
```

### Target Layout (After Fare Calculation)

```
┌───────────────────┬───────────────────────┐
│ Booking Summary   │                       │
├───────────────────┤                       │
│                   │                       │
│ Vehicle Selection │ Smaller Map View      │
│ (50% width)       │ (50% width)           │
│                   │                       │
└───────────────────┴───────────────────────┘
```

## Components to Create

### 1. VehicleSelectionContainer

The main container that will manage the vehicle selection state and layout.

```tsx
// src/components/vehicle-selection/VehicleSelectionContainer.tsx
interface VehicleSelectionContainerProps {
  bookingDetails: BookingDetails;
  fareData: FareData;
  onVehicleSelect: (vehicleId: string) => void;
  onBack: () => void;
}
```

### 2. BookingSummary

A compact summary of the booking details at the top of the vehicle selection panel.

```tsx
// src/components/vehicle-selection/BookingSummary.tsx
interface BookingSummaryProps {
  pickupLocation: Location;
  dropoffLocation: Location;
  additionalStops: Location[];
  date: Date;
  time: string;
  passengers: number;
  checkedLuggage: number;
  handLuggage: number;
}
```

### 3. VehicleCard

Individual card for each vehicle option.

```tsx
// src/components/vehicle-selection/VehicleCard.tsx
interface VehicleCardProps {
  vehicle: {
    id: string;
    name: string;
    description: string;
    capacity: {
      passengers: number;
      luggage: number;
    };
    price: {
      amount: number;
      currency: string;
    };
    eta: number;
    imageUrl: string;
    features?: string[];
  };
  isSelected: boolean;
  exceededCapacity: boolean;
  onSelect: () => void;
}
```

### 4. FareEstimatePanel

Shows route information and fare breakdown.

```tsx
// src/components/vehicle-selection/FareEstimatePanel.tsx
interface FareEstimatePanelProps {
  baseFare: number;
  totalDistance: number;
  estimatedTime: number;
  currency: string;
}
```

## State Management Updates

Add the following state to the booking page:

```tsx
// Add to src/app/dashboard/new-booking/page.tsx
const [fareData, setFareData] = useState<FareData | null>(null);
const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
const [isFetching, setIsFetching] = useState<boolean>(false);
const [fetchError, setFetchError] = useState<string | null>(null);
```

## API Call Implementation

```tsx
// Add to src/app/dashboard/new-booking/page.tsx
const calculateFare = async () => {
  if (!pickupLocation || !dropoffLocation || !selectedDate || !selectedTime) {
    return;
  }

  setIsFetching(true);
  setFetchError(null);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/fare-estimate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations: {
            pickup: {
              address: pickupLocation.address,
              coordinates: {
                latitude: pickupLocation.latitude,
                longitude: pickupLocation.longitude,
              },
            },
            dropoff: {
              address: dropoffLocation.address,
              coordinates: {
                latitude: dropoffLocation.latitude,
                longitude: dropoffLocation.longitude,
              },
            },
            additionalStops: additionalStops.map((stop) => ({
              address: stop.address,
              coordinates: {
                latitude: stop.latitude,
                longitude: stop.longitude,
              },
            })),
          },
          datetime: {
            date: format(selectedDate, "yyyy-MM-dd"),
            time: selectedTime,
          },
          passengers: {
            count: passengers,
            checkedLuggage: checkedLuggage,
            handLuggage: handLuggage,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      setFareData(data.data.fare);
      setCurrentStep("vehicle");
    } else {
      setFetchError(data.error.message);
    }
  } catch (error) {
    setFetchError("Failed to calculate fare. Please try again.");
    console.error("Fare calculation error:", error);
  } finally {
    setIsFetching(false);
  }
};
```

## CSS Animations

Use CSS transitions for smooth layout changes:

```css
.map-container {
  transition: width 0.3s ease-in-out;
}

.vehicle-selection {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## Implementation Steps

1. **Create Vehicle Selection Components**

   - Build the components outlined above
   - Style them according to the design system
   - Implement responsive layouts

2. **Add API Integration**

   - Implement the fare calculation API call
   - Add loading and error states
   - Test with mocked data initially

3. **Update Layout Logic**

   - Add state for tracking the current view
   - Implement the layout transition when fare data is received
   - Ensure the map resizes smoothly

4. **Add Capacity Validation**

   - Check if selected passenger/luggage counts exceed vehicle capacity
   - Add visual indicators for vehicles that cannot accommodate the booking

5. **Add Final Selection Logic**
   - Implement vehicle selection functionality
   - Add confirmation button
   - Prepare for transition to payment flow

## Testing Scenarios

1. Fare calculation with various locations
2. Different passenger/luggage combinations
3. Vehicle capacity limits
4. API error handling
5. Responsive layout testing
6. Layout transitions

## Design Notes

- Vehicle cards should have a premium, elegant aesthetic
- Use subtle animations for transitions
- Highlight selected vehicle with border and background change
- Ensure price is prominently displayed
- Make ETA and capacity information easily scannable
