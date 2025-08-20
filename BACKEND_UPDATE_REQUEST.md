# Backend Update Request: Enhanced Return Booking System

## Overview
We have implemented a new enhanced return booking system in both the **Enhanced Booking (Taxi Booking)** and **Hourly Booking** systems that requires backend updates to support the new structure.

## New Feature: Return Type Selection

### What We Added
We've added a new UI component that allows users to choose between two return types:

1. **Wait and Return** - Driver waits at destination and returns to pickup location
2. **Later Date** - Driver returns on a different date/time

### Current Frontend Implementation
- New `returnType` state: `'wait-and-return' | 'later-date'`
- UI toggle/radio buttons for users to select return type
- Conditional fields based on selection:
  - **Wait and Return**: No additional date/time fields needed
  - **Later Date**: Shows return date and time picker fields

## Required Backend Changes

### 1. Enhanced Booking API (Taxi Booking)

#### Current Structure (needs update):
```json
{
  "returnDate": "2025-08-21",
  "returnTime": "18:00"
}
```

#### New Required Structure:
```json
{
  "returnType": "wait-and-return" | "later-date",
  "returnDetails": {
    "waitAndReturn": {
      "driverWaitTime": "unlimited" // or specific duration if needed
    }
    // OR
    "laterDate": {
      "returnDate": "2025-08-21",
      "returnTime": "18:00"
    }
  }
}
```

### 2. Hourly Booking API

#### Current Structure (needs update):
```json
{
  "returnDate": "2025-08-21",
  "returnTime": "18:00"
}
```

#### New Required Structure:
```json
{
  "returnType": "wait-and-return" | "later-date",
  "returnDetails": {
    "waitAndReturn": {
      "driverWaitTime": "unlimited" // or specific duration if needed
    }
    // OR
    "laterDate": {
      "returnDate": "2025-08-21",
      "returnTime": "18:00"
    }
  }
}
```

## API Endpoints That Need Updates

### Enhanced Booking (Taxi Booking):
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `POST /api/fare-estimate` - Calculate fare

### Hourly Booking:
- `POST /api/hourly-bookings` - Create hourly booking
- `PUT /api/hourly-bookings/{id}` - Update hourly booking
- `POST /api/hourly-fare-estimate` - Calculate hourly fare

## Business Logic Requirements

### Wait and Return:
- Driver waits at destination location
- No additional return date/time needed
- Pricing should reflect the waiting time and return journey
- May need to specify maximum wait time or make it unlimited

### Later Date:
- Driver returns on specified date/time
- Requires return date and time validation
- Pricing should reflect the separate outbound and return journeys
- May need to handle cases where return is days/weeks later

## Validation Rules

### Wait and Return:
- `returnType` must be "wait-and-return"
- No `returnDate` or `returnTime` required
- `returnDetails.waitAndReturn` object required

### Later Date:
- `returnType` must be "later-date"
- `returnDate` and `returnTime` are required
- `returnDetails.laterDate` object required
- Return date must be after pickup date
- Return time validation (24-hour format)

## Frontend State Management

We're currently managing this with:
```typescript
const [returnType, setReturnType] = useState<'wait-and-return' | 'later-date'>('wait-and-return');
const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
const [returnTime, setReturnTime] = useState<string>("");
```

## Testing Scenarios

1. **Wait and Return**: User selects wait-and-return, no return date/time needed
2. **Later Date**: User selects later-date, return date/time required
3. **Validation**: Ensure proper error messages for missing required fields
4. **Pricing**: Verify fare calculations work for both return types

## Timeline
- **Frontend**: ✅ Already implemented and ready
- **Backend**: Needs implementation to support new structure
- **Testing**: Can begin once backend is updated

## Questions for Backend Team

1. Should we add a `driverWaitTime` field for wait-and-return bookings?
2. How should pricing be calculated for wait-and-return vs later-date?
3. Are there any business rules around maximum wait times?
4. Should we add any additional fields for return journey planning?

## Contact
Please let us know when these backend changes are implemented so we can test the complete flow and ensure both return booking types work correctly.