export interface HourlyBookingDateTime {
  date: string;
  time: string;
}

export interface HourlyBookingPassengers {
  count: number;
  luggage: number;
}

export interface HourlyBookingLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface HourlyBookingStop {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// One-Way specific details
export interface OneWayDetails {
  pickupLocation: {
    lat: number;
    lng: number;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
  };
  additionalStops?: Array<{
    lat: number;
    lng: number;
  }>;
}

// Hourly specific details
export interface HourlyDetails {
  hours: number;
  pickupLocation: {
    lat: number;
    lng: number;
  };
  dropoffLocation?: {
    lat: number;
    lng: number;
  };
  additionalStops?: Array<{
    lat: number;
    lng: number;
  }>;
}

// Return specific details
export interface ReturnDetails {
  outboundPickup: {
    lat: number;
    lng: number;
  };
  outboundDropoff: {
    lat: number;
    lng: number;
  };
  outboundDateTime: HourlyBookingDateTime;
  outboundStops?: Array<{
    lat: number;
    lng: number;
  }>;
  returnType: 'wait-and-return' | 'later-date';
  waitDuration?: number; // for wait-and-return
  returnPickup?: {
    lat: number;
    lng: number;
  }; // for later-date
  returnDropoff?: {
    lat: number;
    lng: number;
  }; // for later-date
  returnDateTime?: HourlyBookingDateTime; // for later-date
  returnStops?: Array<{
    lat: number;
    lng: number;
  }>; // for later-date
}

// Updated fare request structure
export interface HourlyFareRequest {
  bookingType: 'one-way' | 'hourly' | 'return';
  datetime: HourlyBookingDateTime;
  passengers: HourlyBookingPassengers;
  numVehicles: number;
  oneWayDetails?: OneWayDetails;
  hourlyDetails?: HourlyDetails;
  returnDetails?: ReturnDetails;
}

// Updated fare response structure
export interface HourlyFareResponse {
  fare: {
    vehicleOptions: HourlyVehicleOption[];
    bookingType: 'one-way' | 'hourly' | 'return';
    notifications: string[];
    pricingMessages: string[];
    branding: {
      name: string;
      description: string;
      type: string;
      category: string;
    };
  };
}

export interface HourlyVehicleOption {
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
    messages: string[];
    breakdown: {
      baseFare: number;
      distanceCharge: number;
      equipmentFees: number;
      timeSurcharge: number;
    };
  };
  imageUrl: string;
}

// Customer information
export interface HourlyBookingCustomer {
  fullName: string;
  email: string;
  phoneNumber: string;
  groupName?: string;
}

// Updated booking request structure
export interface HourlyBookingRequest {
  customer: HourlyBookingCustomer;
  bookingType: 'one-way' | 'hourly' | 'return';
  datetime: HourlyBookingDateTime;
  passengers: HourlyBookingPassengers;
  vehicle: {
    id: string;
    name: string;
  };
  numVehicles: number;
  specialRequests?: string;
  oneWayDetails?: {
    pickupLocation: HourlyBookingLocation;
    dropoffLocation: HourlyBookingLocation;
    additionalStops?: HourlyBookingStop[];
  };
  hourlyDetails?: {
    hours: number;
    pickupLocation: HourlyBookingLocation;
    dropoffLocation?: HourlyBookingLocation;
    additionalStops?: HourlyBookingStop[];
  };
  returnDetails?: {
    outboundPickup: HourlyBookingLocation;
    outboundDropoff: HourlyBookingLocation;
    outboundDateTime: HourlyBookingDateTime;
    outboundStops?: HourlyBookingStop[];
    returnType: 'wait-and-return' | 'later-date';
    waitDuration?: number;
    returnPickup?: HourlyBookingLocation;
    returnDropoff?: HourlyBookingLocation;
    returnDateTime?: HourlyBookingDateTime;
    returnStops?: HourlyBookingStop[];
  };
}

// Booking response
export interface HourlyBookingResponse {
  success: boolean;
  data: {
    bookingId: string;
    message: string;
    details: {
      customerName: string;
      bookingType: 'one-way' | 'hourly' | 'return';
      pickupDate: string;
      pickupTime: string;
      pickupLocation: string;
      vehicle: string;
      price: {
        amount: number;
        currency: string;
      };
      status: string;
      branding: {
        name: string;
        description: string;
        type: string;
        category: string;
      };
      dropoffLocation?: string;
      hours?: number;
      returnDetails?: {
        returnType: 'wait-and-return' | 'later-date';
        returnDateTime?: string;
        waitDuration?: number;
      };
    };
  };
}

export interface HourlyBookingListItem {
  id: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: {
    address: string;
  };
  vehicleType: string;
  price: number;
  hours: number;
  status: string;
  createdAt: string;
}

export interface HourlyBookingCancelRequest {
  cancellationReason: string;
}

export interface HourlyBookingCancelResponse {
  message: string;
  id: string;
  status: string;
} 