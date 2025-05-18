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
declare const api: import("axios").AxiosInstance;
export declare const apiService: {
    auth: {
        register: (data: {
            fullName: string;
            email: string;
            password: string;
        }) => Promise<import("axios").AxiosResponse<any, any>>;
        signin: (email: string, password: string) => Promise<import("axios").AxiosResponse<any, any>>;
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
    }) => Promise<import("axios").AxiosResponse<any, any>>;
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
    }) => Promise<import("axios").AxiosResponse<any, any>>;
    bookings: {
        create: (bookingData: BookingData) => Promise<import("axios").AxiosResponse<any, any>>;
        getAll: () => Promise<import("axios").AxiosResponse<any, any>>;
        getById: (id: string) => Promise<import("axios").AxiosResponse<any, any>>;
        update: (id: string, data: BookingUpdateData) => Promise<import("axios").AxiosResponse<any, any>>;
        delete: (id: string) => Promise<import("axios").AxiosResponse<any, any>>;
    };
};
export default api;
