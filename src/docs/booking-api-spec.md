# Xequtive Booking API Specification

## Overview

This document outlines the API requirements for the Xequtive booking system, specifically focusing on the fare calculation and vehicle selection flow. The frontend collects booking details (locations, date/time, passengers, luggage) and sends this data to the backend for fare calculation across different vehicle types.

## Complete Booking Flow

1. **User Enters Booking Details**:

   - Pickup location
   - Dropoff location
   - Optional additional stops
   - Pickup date and time
   - Number of passengers (1-8)
   - Checked luggage/large bags (0-8)
   - Hand luggage/small bags (0-8)

2. **User Clicks "Calculate Fare"**:

   - Frontend sends all booking details to backend
   - Backend calculates fares for ALL available vehicle types
   - Backend returns fare data for each vehicle type

3. **Vehicle Selection Display**:

   - Frontend adjusts layout (map becomes smaller)
   - Displays vehicle options with fares
   - User selects preferred vehicle

4. **User Finalizes Booking** (future implementation):
   - User enters personal details (name, email, etc.)
   - Additional notes/requirements
   - Creates final booking
   - Backend saves the complete booking data

## API Endpoints

### 1. Enhanced Fare Estimation Endpoint

- **URL**: `/api/fare-estimate/enhanced`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Returns fare estimates for ALL vehicle types based on the provided journey details

**Request Body**:

```json
{
  "locations": {
    "pickup": {
      "address": "123 Main St, London, UK",
      "coordinates": {
        "lat": 51.5074,
        "lng": -0.1278
      }
    },
    "dropoff": {
      "address": "456 Oxford St, London, UK",
      "coordinates": {
        "lat": 51.5152,
        "lng": -0.1418
      }
    },
    "additionalStops": [
      {
        "address": "789 Baker St, London, UK",
        "coordinates": {
          "lat": 51.5144,
          "lng": -0.1275
        }
      }
    ]
  },
  "datetime": {
    "date": "2023-07-25",
    "time": "14:30"
  },
  "passengers": {
    "count": 2,
    "checkedLuggage": 1,
    "handLuggage": 2
  }
}
```

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "fare": {
      "baseFare": 16.5,
      "totalDistance": 2.2,
      "estimatedTime": 11,
      "currency": "GBP",
      "vehicleOptions": [
        {
          "id": "standard-saloon",
          "name": "Standard Saloon",
          "description": "Comfortable ride for up to 4 passengers",
          "capacity": {
            "passengers": 4,
            "luggage": 2
          },
          "price": {
            "amount": 15,
            "currency": "GBP"
          },
          "eta": 5,
          "imageUrl": "/images/vehicles/standard-saloon.jpg"
        },
        {
          "id": "estate",
          "name": "Estate",
          "description": "Spacious vehicle with extra luggage space",
          "capacity": {
            "passengers": 4,
            "luggage": 4
          },
          "price": {
            "amount": 18,
            "currency": "GBP"
          },
          "eta": 6,
          "imageUrl": "/images/vehicles/estate.jpg"
        },
        {
          "id": "executive-saloon",
          "name": "Executive Saloon",
          "description": "Premium ride in a Mercedes E-Class or equivalent",
          "capacity": {
            "passengers": 3,
            "luggage": 2
          },
          "price": {
            "amount": 30,
            "currency": "GBP"
          },
          "eta": 7,
          "imageUrl": "/images/vehicles/executive-saloon.jpg",
          "features": ["WiFi", "Bottled Water", "Newspaper"]
        }
        // ... additional vehicle options
      ]
    }
  }
}
```

**Error Response (400, 401, 500)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Could not calculate route between provided locations",
    "details": "No routes found between the specified locations"
  }
}
```

**Error Codes**:

- `VALIDATION_ERROR`: Request data did not pass validation
- `INVALID_LOCATION`: Locations could not be routed (no valid route found)
- `FARE_CALCULATION_ERROR`: General error during fare calculation

### 2. Create Booking Endpoint (Future Implementation)

**Endpoint**: `/api/bookings/create`

**Method**: POST

**Request Body**:

```json
{
  "customer": {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+447700900123"
  },
  "booking": {
    "locations": {
      "pickup": {
        "address": "123 Main St, London, UK",
        "coordinates": {
          "lat": 51.5074,
          "lng": -0.1278
        }
      },
      "dropoff": {
        "address": "456 Oxford St, London, UK",
        "coordinates": {
          "lat": 51.5152,
          "lng": -0.1418
        }
      },
      "additionalStops": [
        {
          "address": "789 Baker St, London, UK",
          "coordinates": {
            "lat": 51.5225,
            "lng": -0.1563
          }
        }
      ]
    },
    "datetime": {
      "date": "2023-07-25",
      "time": "14:30"
    },
    "passengers": {
      "count": 2,
      "checkedLuggage": 1,
      "handLuggage": 2
    },
    "vehicle": {
      "id": "executive-saloon",
      "name": "Executive Saloon",
      "price": {
        "amount": 75.0,
        "currency": "GBP"
      }
    },
    "notes": "Please call when arriving. Need child seat."
  }
}
```

## Vehicle Types and Capacities

The system supports the following vehicle types that the backend should calculate fares for:

1. **Standard Saloon** - Toyota Prius, Ford Mondeo

   - Capacity: 4 passengers, 2 luggage items
   - Base Rate: £2.50/km
   - Minimum Fare: £15.00

2. **Estate** - Volkswagen Passat Estate, Skoda Octavia Estate

   - Capacity: 4 passengers, 4 luggage items
   - Base Rate: £3.00/km
   - Minimum Fare: £18.00

3. **Large MPV** - Ford Galaxy, Volkswagen Sharan

   - Capacity: 6 passengers, 4 luggage items
   - Base Rate: £3.50/km
   - Minimum Fare: £22.00

4. **Extra Large MPV** - Ford Tourneo, Volkswagen Transporter

   - Capacity: 8 passengers, 8 luggage items
   - Base Rate: £4.00/km
   - Minimum Fare: £25.00

5. **Executive Saloon** - Mercedes E-Class, BMW 5-Series

   - Capacity: 3 passengers, 2 luggage items
   - Base Rate: £4.50/km
   - Minimum Fare: £30.00
   - Features: WiFi, Bottled Water, Newspaper

6. **Executive Large MPV** - Mercedes Vito, Volkswagen Caravelle

   - Capacity: 7 passengers, 7 luggage items
   - Base Rate: £5.50/km
   - Minimum Fare: £40.00
   - Features: WiFi, Bottled Water, Extra Legroom

7. **VIP** - Mercedes S-Class, BMW 7-Series

   - Capacity: 3 passengers, 2 luggage items
   - Base Rate: £7.00/km
   - Minimum Fare: £50.00
   - Features: WiFi, Premium Drinks, Luxury Interior, Professional Chauffeur

8. **VIP MPV** - Mercedes V-Class

   - Capacity: 6 passengers, 6 luggage items
   - Base Rate: £8.50/km
   - Minimum Fare: £60.00
   - Features: WiFi, Premium Drinks, Luxury Interior, Professional Chauffeur

9. **Wheelchair Accessible Vehicle (WAV)** - Specially adapted vans
   - Capacity: 4 passengers + wheelchair, 2 luggage items
   - Base Rate: £3.50/km
   - Minimum Fare: £25.00
   - Features: Wheelchair Ramp, Secure Wheelchair Fastening

## Implementation Notes

### Front-End Integration Guidelines

- The enhanced fare endpoint is designed to be called when the user has entered all details and clicks "Calculate Fare"
- The response includes ALL vehicle types - the frontend should display all options but can highlight capacity warnings
- Vehicles are returned in ascending price order (cheapest first)
- The `baseFare` in the response is the average of standard vehicle fares and can be used for reference

### Time Multipliers

- The API automatically applies appropriate time multipliers based on the requested date/time
- Peak hours (7-10 AM, 4-7 PM weekdays): 1.5x rate
- Night hours (10 PM - 5 AM): 1.3x rate
- Weekend: 1.2x rate
- These multipliers are reflected in the returned prices

### Additional Stop Handling

- Each additional stop adds a fixed fee (£5.00)
- The route is calculated as pickup → all stops in order → final destination
- Total distance and time include all segments of the journey

## Frontend Implementation Plan

When implementing the vehicle selection UI after fare calculation:

1. The UI will transition from:

   ```
   | Location Form | Map |
   ```

   To:

   ```
   | Vehicle Selection | Smaller Map |
   ```

2. **Vehicle Selection Component**:

   - Display fare estimate overview
   - List vehicle options with:
     - Vehicle type/name
     - Capacity details (with warnings if requirements exceed capacity)
     - Price
     - ETA
     - Features
     - Selection button

3. **Layout Transition**:
   - Map will reduce in width (not height)
   - Vehicle selection options will appear on the left
   - Booking summary visible at the top
   - No page refresh or data loss
   - Smooth transition animation

## Design Considerations

- Vehicle selection cards should be visually appealing with images and clear price display
- Map remains visible to maintain context of the journey
- Selected vehicle should be highlighted
- Capacity indicators should show if the selected passenger/luggage count exceeds vehicle capacity
- Design should be responsive for mobile and desktop

## Data Flow Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌───────────────────┐
│ Location/Date   │      │ Passengers &    │      │ Fare Calculation  │
│ Selection Form  │─────▶│ Luggage Form    │─────▶│ API Request       │
└─────────────────┘      └─────────────────┘      └───────────────────┘
                                                            │
┌─────────────────┐      ┌─────────────────┐               │
│ Payment &       │      │ Vehicle         │               ▼
│ Confirmation    │◀─────│ Selection UI    │◀──────┌───────────────────┐
└─────────────────┘      └─────────────────┘       │ API Response with │
                                                   │ Vehicle Options   │
                                                   └───────────────────┘
```

## Implementation Timeline

1. Backend API development for fare calculation
2. Frontend vehicle selection UI implementation
3. Integration and state management
4. UI transitions and animations
5. Testing with different location and passenger configurations

## Notes for Backend Developers

- The fare calculation should consider:

  - Distance between locations
  - Time of day (peak vs. off-peak)
  - Number of passengers and luggage
  - Vehicle type and availability
  - Any special requirements

- Vehicle pricing should follow the established business rules for:

  - Base fare
  - Distance surcharge
  - Additional stop fees
  - Luggage fees (if applicable)
  - Time-based pricing variations

- Performance is critical - aim for response times under 1 second for fare calculations

- Even if some vehicles cannot accommodate the passenger/luggage requirements, return ALL vehicle types with their prices to allow the frontend to show appropriate warnings but still display all options
