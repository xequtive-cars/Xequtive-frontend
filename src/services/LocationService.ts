// Minimal type definitions for compatibility with existing code

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

// This is a simplified version that just provides type compatibility
// Real functionality is in the useGeolocation hook
class LocationService {
  private static instance: LocationService | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public getCurrentState(): LocationServiceState {
    return {
      data: null,
      error: null,
      loading: false,
      permissionStatus: "prompt",
    };
  }

  public getLastLocation(): LocationData | null {
    return null;
  }

  public getPermissionStatus(): PermissionState {
    return "prompt";
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public onPermissionChange(
    _callback: (status: PermissionState) => void
  ): void {}

  public removePermissionChangeListener(
    _callback: (status: PermissionState) => void
  ): void {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export default LocationService;
