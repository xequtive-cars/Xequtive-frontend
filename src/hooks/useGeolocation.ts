import { useState, useEffect, useCallback } from "react";

export type GeolocationState = {
  loading: boolean;
  error: string | null;
  data: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  };
};

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    data: {
      latitude: null,
      longitude: null,
      accuracy: null,
    },
  });

  // Function to get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by this browser.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      // Success handler
      (position) => {
        setState({
          loading: false,
          error: null,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      // Error handler
      (error) => {
        let errorMessage: string;

        switch (error.code) {
          case 1:
            errorMessage = "PERMISSION_DENIED";
            break;
          case 2:
            errorMessage = "POSITION_UNAVAILABLE";
            break;
          case 3:
            errorMessage = "TIMEOUT";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      // Options with high accuracy and short timeout
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  }, [options]);

  // Request position immediately on mount
  useEffect(() => {
    getCurrentPosition();

    // Set up a watch position for continuous updates
    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            loading: false,
            error: null,
            data: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
          });
        },
        (error) => {
          // Only update error state if we don't already have a position
          setState((prev) => {
            if (prev.data.latitude === null) {
              let errorMessage: string;

              switch (error.code) {
                case 1:
                  errorMessage = "PERMISSION_DENIED";
                  break;
                case 2:
                  errorMessage = "POSITION_UNAVAILABLE";
                  break;
                case 3:
                  errorMessage = "TIMEOUT";
                  break;
                default:
                  errorMessage = "An unknown error occurred.";
              }

              return {
                ...prev,
                loading: false,
                error: errorMessage,
              };
            }
            return prev;
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
      );
    }

    // Clean up
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [getCurrentPosition, options]);

  return {
    ...state,
    getCurrentPosition,
    // Direct access to data properties
    latitude: state.data.latitude,
    longitude: state.data.longitude,
    accuracy: state.data.accuracy,
  };
}
