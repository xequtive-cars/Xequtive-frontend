export type GeolocationState = {
    loading: boolean;
    error: string | null;
    data: {
        latitude: number | null;
        longitude: number | null;
        accuracy: number | null;
    };
};
export declare function useGeolocation(options?: PositionOptions): {
    getCurrentPosition: () => void;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    loading: boolean;
    error: string | null;
    data: {
        latitude: number | null;
        longitude: number | null;
        accuracy: number | null;
    };
};
