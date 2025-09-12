# 🚨 Backend Issue: Missing Hourly Rate in Fare Estimation Response

## **Issue Summary**
The frontend is not receiving `hourlyRate` field in the vehicle options from the fare estimation API for hourly bookings, causing hourly rates to not display in the vehicle selection screen.

---

## **Expected Behavior**
For hourly bookings, each vehicle in the `vehicleOptions` array should include a `hourlyRate` field showing the base hourly rate for that vehicle.

## **Current API Response Structure**
```json
{
  "success": true,
  "data": {
    "fare": {
      "vehicleOptions": [
        {
          "id": "vehicle-1",
          "name": "Standard Saloon",
          "price": {
            "amount": 100
          },
          "capacity": 4,
          "description": "Comfortable 4-seater vehicle"
          // ❌ MISSING: "hourlyRate": 25
        }
      ]
    }
  }
}
```

## **Expected API Response Structure**
```json
{
  "success": true,
  "data": {
    "fare": {
      "vehicleOptions": [
        {
          "id": "vehicle-1",
          "name": "Standard Saloon",
          "price": {
            "amount": 100
          },
          "capacity": 4,
          "description": "Comfortable 4-seater vehicle",
          "hourlyRate": 25  // ✅ REQUIRED: Base hourly rate
        }
      ]
    }
  }
}
```

---

## **API Endpoint**
- **URL:** `POST /api/fare-estimate/enhanced`
- **Booking Type:** `"hourly"`
- **Required Field:** `hours` (3-12)

## **Sample Request Payload**
```json
{
  "locations": {
    "pickup": {
      "address": "London Heathrow Airport, Longford TW6, UK",
      "coordinates": {
        "lat": 51.4700,
        "lng": -0.4543
      }
    },
    "dropoff": {
      "address": "London City Centre, London, UK",
      "coordinates": {
        "lat": 51.5074,
        "lng": -0.1278
      }
    }
  },
  "passengers": {
    "count": 2,
    "checkedLuggage": 1,
    "mediumLuggage": 0,
    "handLuggage": 2,
    "babySeat": 0,
    "childSeat": 0,
    "boosterSeat": 0,
    "wheelchair": 0
  },
  "bookingType": "hourly",
  "hours": 4
}
```

---

## **Frontend Impact**
- **Vehicle Selection Screen:** Hourly rates not displayed next to total price
- **User Experience:** Users cannot see the base hourly rate for each vehicle
- **Current Workaround:** Frontend calculates fallback rate as `totalPrice ÷ hours`

## **Frontend Code Expecting This Field**
```typescript
// In VehicleOption interface
interface VehicleOption {
  id: string;
  name: string;
  price: { amount: number };
  capacity: number;
  description: string;
  hourlyRate?: number; // ✅ This field should be provided by backend
}

// In vehicle selection component
{vehicle.hourlyRate ? (
  <div className="text-xs text-foreground font-medium notranslate">
    £{vehicle.hourlyRate}/hour
  </div>
) : (
  <div className="text-xs text-muted-foreground notranslate">
    £{(vehicle.price.amount / hours).toFixed(0)}/hour
  </div>
)}
```

---

## **Backend Documentation Reference**
According to the backend documentation provided earlier:
> "Backend has added `hourlyRate` field to the fare calculation response for hourly bookings. Each vehicle option should now include the base hourly rate."

---

## **Testing Steps**
1. Make a POST request to `/api/fare-estimate/enhanced` with `bookingType: "hourly"`
2. Check if `vehicleOptions[].hourlyRate` is present in the response
3. Verify the `hourlyRate` value is correct (should be `totalPrice ÷ hours`)

---

## **Priority**
**HIGH** - This affects the user experience for hourly bookings where users need to see the base hourly rate for each vehicle option.

---

## **Questions for Backend Team**
1. Is the `hourlyRate` field being calculated and included in the response?
2. If not, what's the expected field name for the hourly rate?
3. Should this be calculated as `totalPrice ÷ hours` or is there a separate base rate?
4. Are there any authentication requirements for testing this endpoint?

---

**Created:** January 2024  
**Status:** ✅ RESOLVED - Backend now provides hourlyRate field  
**Frontend Impact:** Hourly rates now displaying correctly in vehicle selection
