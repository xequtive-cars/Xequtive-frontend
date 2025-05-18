export type PermissionState = "granted" | "denied" | "prompt" | "unavailable";
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    timestamp: number;
}
export interface LocationError {
    code: number;
    message: string;
    timestamp: number;
}
export interface LocationServiceState {
    data: LocationData | null;
    error: LocationError | null;
    loading: boolean;
    permissionStatus: PermissionState;
}
declare class LocationService {
    private static instance;
    private constructor();
    static getInstance(): LocationService;
    getCurrentState(): LocationServiceState;
    getLastLocation(): LocationData | null;
    getPermissionStatus(): PermissionState;
    onPermissionChange(_callback: (status: PermissionState) => void): void;
    removePermissionChangeListener(_callback: (status: PermissionState) => void): void;
}
export default LocationService;
