// Vehicle Types
export enum VehicleType {
  STANDARD = "standard",
  EXECUTIVE = "executive",
  MPV = "mpv",
  ESTATE = "estate",
  VIP = "vip",
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface ExtendedLocation extends Location {
  id?: string;
}

// Vehicle Types
export interface VehicleCapacity {
  passengers: number;
  luggage: number;
}

export interface PriceBreakdown {
  base: number;
  distance: number;
  time: number;
  extras?: number;
  tax?: number;
}

export interface Price {
  amount: number;
  currency: string;
  breakdown?: PriceBreakdown;
}

export interface VehicleOption {
  id: string;
  name: string;
  description: string;
  capacity: VehicleCapacity;
  imageUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: string;
    code?: string;
  };
}

export interface FareResponse {
  vehicles: VehicleOption[];
  distance_miles?: number;
  duration_minutes?: number;
  error?: string;
}

// Booking Types
export interface BookingDetails {
  id: string;
  userId: string;
  status: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  stops?: Location[];
  datetime: {
    date: string;
    time: string;
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    handLuggage: number;
  };
  vehicle: VehicleType;
  price: Price;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingData {
  personalDetails: PersonalDetails;
  pickupLocation: Location;
  dropoffLocation: Location;
  stops?: Location[];
  datetime: {
    date: string;
    time: string;
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    handLuggage: number;
  };
  vehicle: VehicleType;
  price: Price;
}

export interface BookingResponse {
  success: boolean;
  data?: BookingDetails;
  error?: {
    message: string;
    details?: string;
  };
}

export interface BookingUpdateData {
  status?: string;
  pickupLocation?: Location;
  dropoffLocation?: Location;
  stops?: Location[];
  datetime?: {
    date: string;
    time: string;
  };
  passengers?: {
    count: number;
    checkedLuggage: number;
    handLuggage: number;
  };
  vehicle?: VehicleType;
  price?: Price;
}

export interface BookingConfirmation {
  bookingId: string;
  status: "confirmed" | "pending" | "failed";
  estimatedPickupTime: string;
  driverDetails?: {
    name: string;
    phone: string;
    vehicleModel: string;
    vehiclePlate: string;
  };
}

// Form Types
export interface VerifiedFare {
  vehicleId: string;
  vehicleName: string;
  price: {
    amount: number;
    currency: string;
  };
  distance_miles: number;
  duration_minutes: number;
}

export interface BookingVerification {
  bookingId: string;
  verificationToken: string;
  verifiedFare: VerifiedFare;
  expiresIn?: number;
}

// API Request Types
export interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface FareRequest {
  locations: {
    pickup: LocationData;
    dropoff: LocationData;
    additionalStops?: LocationData[];
  };
  datetime: {
    date: Date | string;
    time: string;
  };
  passengers: {
    count: number;
    checkedLuggage: number;
    handLuggage: number;
  };
}

// State Types
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ApiState {
  isFetching: boolean;
  isCreatingBooking: boolean;
  fetchError: string | null;
  bookingError: string | null;
  fareData: FareResponse | null;
}
