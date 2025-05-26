interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface BookingData {
  fullName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  additionalStops?: Location[];
  passengers: number;
  checkedLuggage?: number;
  handLuggage?: number;
  preferredVehicle: string;
  specialRequests?: string;
  fareEstimate: number;
}

interface BookingUpdateData {
  status?: string;
  pickupTime?: string;
  specialRequests?: string;
  fareEstimate?: number;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

interface FareEstimateResponse {
  fare: number;
  distance: number;
  duration: number;
  currency: string;
}

interface BookingResponse {
  id: string;
  status: string;
  details: BookingData;
}

declare const api: import("axios").AxiosInstance;

export declare const apiService: {
  auth: {
    register: (data: {
      fullName: string;
      email: string;
      password: string;
    }) => Promise<import("axios").AxiosResponse<AuthResponse>>;
    signin: (
      email: string,
      password: string
    ) => Promise<import("axios").AxiosResponse<AuthResponse>>;
  };
  fareEstimate: (data: {
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
    vehicleType: string;
  }) => Promise<import("axios").AxiosResponse<FareEstimateResponse>>;
  enhancedFareEstimate: (data: {
    locations: {
      pickup: {
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      };
      dropoff: {
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      };
      additionalStops?: Array<{
        address: string;
        coordinates: {
          lat: number;
          lng: number;
        };
      }>;
    };
    datetime: {
      date: string;
      time: string;
    };
    passengers: {
      count: number;
      checkedLuggage: number;
      handLuggage: number;
    };
  }) => Promise<import("axios").AxiosResponse<FareEstimateResponse>>;
  bookings: {
    create: (
      bookingData: BookingData
    ) => Promise<import("axios").AxiosResponse<BookingResponse>>;
    getAll: () => Promise<import("axios").AxiosResponse<BookingResponse[]>>;
    getById: (
      id: string
    ) => Promise<import("axios").AxiosResponse<BookingResponse>>;
    update: (
      id: string,
      data: BookingUpdateData
    ) => Promise<import("axios").AxiosResponse<BookingResponse>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<void>>;
  };
};

export default api;
