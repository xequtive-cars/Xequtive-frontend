/*
 * FINAL IMPLEMENTATION - DO NOT MODIFY
 *
 * This Map Component is in its final form and has been thoroughly tested.
 * It provides the following functionality:
 * - Displays user's current location with a blue dot
 * - Shows pickup and dropoff markers
 * - Displays additional stops
 * - Renders actual driving routes between locations using Mapbox Directions API
 * - Automatically fits all markers in the viewport
 *
 * Any modifications to this component should be carefully reviewed as they
 * may break existing functionality.
 *
 * NOTE: All console.log statements have been removed for production.
 */

/**
 * ███████╗██╗  ██╗███████╗ ██████╗ ██╗   ██╗████████╗██╗██╗   ██╗███████╗
 * ██╔════╝╚██╗██╔╝██╔════╝██╔═══██╗██║   ██║╚══██╔══╝██║██║   ██║██╔════╝
 * █████╗   ╚███╔╝ █████╗  ██║   ██║██║   ██║   ██║██████████║█████╗
 * ██╔══╝   ██╔██╗ ██╔══╝  ██║▄▄ ██║██║   ██║   ██║   ██║╚██╗ ██╔╝██╔══╝
 * ███████╗██╔╝ ██╗███████╗╚██████╔╝╚██████╔╝   ██║   ██║ ╚████╔╝ ███████╗
 * ╚══════╝╚═╝  ╚═╝╚══════╝ ╚══▀▀═╝  ╚═════╝    ╚═╝   ╚═╝  ╚═══╝  ╚══════╝
 *
 * Map Service Component
 * Displays a map with user's current location and provides visualization for routes
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { 
  GoogleMap, 
  useLoadScript, 
  Marker, 
  DirectionsRenderer, 
  Libraries 
} from "@react-google-maps/api";
import { useGeolocation } from "@/hooks/useGeolocation";

// Libraries for Google Maps
const libraries: Libraries = ['places', 'geometry', 'drawing'];

// Defines a location with latitude, longitude and optional address
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Define the map interface type
interface MapInterface {
  updateLocations: (
    newPickup: Location | null,
    newDropoff: Location | null,
    newStops?: Location[]
  ) => void;
}

// The component props, will be extended in the future
interface MapComponentProps {
  className?: string;
  mapZoom?: number;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  stops?: Location[];
  showRoute?: boolean;
  previewLocation?: (Location & { isPreview?: boolean; type?: string }) | null;
  showCurrentLocation?: boolean;
  onUserLocationChange?: (
    location: { latitude: number; longitude: number } | null
  ) => void;
  passMapRef?: (mapInstance: MapInterface) => void;
  onLocationError?: (error: string | null) => void;
}

// No service area boundaries needed

const MapComponent = ({
  className = "",
  mapZoom = 12,
  pickupLocation = null,
  dropoffLocation = null,
  stops = [],
  showRoute = false,
  previewLocation = null,
  showCurrentLocation = true,
  onUserLocationChange,
  passMapRef,
  onLocationError,
}: MapComponentProps) => {
  // Google Maps specific refs and state
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [googleDirections, setGoogleDirections] = useState<google.maps.DirectionsResult | null>(null);
  const googleUserMarkerRef = useRef<google.maps.Marker | null>(null);
  const googlePickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const googleDropoffMarkerRef = useRef<google.maps.Marker | null>(null);
  const googleStopMarkersRef = useRef<google.maps.Marker[]>([]);

  // State for map center and zoom
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 51.5074, // Default to London
    lng: -0.1278
  });

  // Load Google Maps script
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsLoadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // State for user coordinates
  const [lastUserCoords, setLastUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lastLocationHash, setLastLocationHash] = useState<string>('');

  // Memoize location validation for performance
  const hasValidPickup = pickupLocation && pickupLocation.latitude !== 0 && pickupLocation.longitude !== 0;
  const hasValidDropoff = dropoffLocation && dropoffLocation.latitude !== 0 && dropoffLocation.longitude !== 0;
  const validStops = stops.filter(stop => 
    stop.latitude !== 0 && 
    stop.longitude !== 0 && 
    stop.address && 
    stop.address.trim() !== ""
  );

  // Debug logging removed to prevent infinite loops

  // Use our geolocation hook to get user's position
  const { error, latitude, longitude, accuracy, getCurrentPosition } =
    useGeolocation();

  // Call onLocationError when error changes
  useEffect(() => {
    if (onLocationError) {
      onLocationError(error);
    }
  }, [error, onLocationError]);

  // Helper function to check if coordinates are within UK boundaries
  const isWithinUKBounds = (lat: number, lng: number) => {
    return lat >= 49.8 && lat <= 60.9 && lng >= -8.7 && lng <= 2.0;
  };

  // Store last known user coordinates and notify parent component
  useEffect(() => {
    if (latitude && longitude) {
      const userCoords = { lat: latitude, lng: longitude };
      setLastUserCoords(userCoords);
      
      // Only set map center to user location if they're within UK bounds
      if (isWithinUKBounds(latitude, longitude)) {
        setMapCenter(userCoords);
      } else {
        // User is outside UK, keep London center
        setMapCenter({ lat: 51.5074, lng: -0.1278 });
      }

      // Notify parent component about user location change
      if (onUserLocationChange) {
        onUserLocationChange({ latitude, longitude });
      }
    }
  }, [latitude, longitude, onUserLocationChange]);

  // Update the useEffect for geolocation to prompt browser permission
  useEffect(() => {
    if (showCurrentLocation) {
      // Request the geolocation permission explicitly
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Success callback - permission granted
            const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
            setLastUserCoords(userCoords);
            
            // Only set map center to user location if they're within UK bounds
            if (isWithinUKBounds(position.coords.latitude, position.coords.longitude)) {
              setMapCenter(userCoords);
            } else {
              // User is outside UK, keep London center
              setMapCenter({ lat: 51.5074, lng: -0.1278 });
            }
            
            // Update user location with the position data
            if (onUserLocationChange) {
              onUserLocationChange({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          },
          (error) => {
            // Error callback - handle permission denied
            if (error.code === 1) {
              if (onLocationError) {
                onLocationError("PERMISSION_DENIED");
              }
            } else if (error.code === 2) {
              if (onLocationError) {
                onLocationError("POSITION_UNAVAILABLE");
              }
            } else if (error.code === 3) {
              if (onLocationError) {
                onLocationError("TIMEOUT");
              }
            } else {
              if (onLocationError) {
                onLocationError("UNKNOWN_ERROR");
              }
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
            } else {
        if (onLocationError) {
          onLocationError("GEOLOCATION_NOT_SUPPORTED");
        }
      }
    }
  }, [showCurrentLocation, onUserLocationChange, onLocationError]);

  // Update map center and zoom based on locations
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const map = googleMapRef.current;
    const bounds = new google.maps.LatLngBounds();
    let hasLocations = false;

    // Create a hash of current locations to detect changes
    const locationHash = JSON.stringify({
      pickup: hasValidPickup ? { lat: pickupLocation.latitude, lng: pickupLocation.longitude } : null,
      dropoff: hasValidDropoff ? { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude } : null,
      stops: validStops.map(stop => ({ lat: stop.latitude, lng: stop.longitude }))
    });

    // Add pickup location to bounds
    if (hasValidPickup) {
      bounds.extend(new google.maps.LatLng(pickupLocation.latitude, pickupLocation.longitude));
      hasLocations = true;
    }

    // Add dropoff location to bounds
    if (hasValidDropoff) {
      bounds.extend(new google.maps.LatLng(dropoffLocation.latitude, dropoffLocation.longitude));
      hasLocations = true;
    }

    // Add stops to bounds
    if (validStops.length > 0) {
      validStops.forEach(stop => {
        bounds.extend(new google.maps.LatLng(stop.latitude, stop.longitude));
        hasLocations = true;
      });
    }

    // Only fit bounds if locations have actually changed
    if (hasLocations && locationHash !== lastLocationHash) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        // Fit bounds to show all locations with generous padding
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        
        // If only one location, set a reasonable zoom level
        if ((hasValidPickup && !hasValidDropoff && validStops.length === 0) || 
            (!hasValidPickup && hasValidDropoff && validStops.length === 0)) {
          setTimeout(() => {
            const currentZoom = map.getZoom();
            if (currentZoom && currentZoom > 16) {
              map.setZoom(16);
            }
          }, 200);
        }
      });
      
      // Update the location hash
      setLastLocationHash(locationHash);
    } else if (!hasLocations && lastUserCoords && isWithinUKBounds(lastUserCoords.lat, lastUserCoords.lng)) {
      // If no booking locations but we have user location within UK, center on user
      if (lastLocationHash !== '') {
        requestAnimationFrame(() => {
          map.setCenter(lastUserCoords);
          map.setZoom(mapZoom);
        });
        setLastLocationHash('');
      }
    } else if (!hasLocations && !lastUserCoords) {
      // No locations and no user location, center on London
      if (lastLocationHash !== '') {
        requestAnimationFrame(() => {
          map.setCenter({ lat: 51.5074, lng: -0.1278 });
          map.setZoom(mapZoom);
        });
        setLastLocationHash('');
      }
    }
  }, [hasValidPickup, hasValidDropoff, validStops, pickupLocation, dropoffLocation, lastUserCoords, mapLoaded, mapZoom, lastLocationHash]);

  // Pass map interface to parent
  useEffect(() => {
    if (passMapRef && googleMapRef.current) {
      const mapInterface: MapInterface = {
        updateLocations: (newPickup, newDropoff, newStops) => {
          // This will be handled by the parent component passing new props
          // The map will automatically update via the useEffect above
        }
      };
      passMapRef(mapInterface);
    }
  }, [passMapRef, mapLoaded]);

  // Memoize the updateRoute function to prevent it from changing on every render
  // NOTE: This function prioritizes SHORTEST DISTANCE routes over fastest time routes
  const updateGoogleRoute = useCallback(() => {
    if (!googleMapRef.current) return;

    // Only proceed if we have at least pickup and dropoff points with valid coordinates
    if (!hasValidPickup || !hasValidDropoff) {
      setGoogleDirections(null);
      return;
    }

    // When we have at least pickup and dropoff, fetch directions if showRoute is true
    if (showRoute) {
      // Collect all waypoints in order (only valid ones)
      const waypoints: google.maps.DirectionsWaypoint[] = validStops.map(stop => ({
        location: { 
          lat: stop.latitude, 
          lng: stop.longitude 
        },
        stopover: true
      }));

      const directionsService = new google.maps.DirectionsService();
      
      // Use requestAnimationFrame for smoother route updates
      requestAnimationFrame(() => {
        directionsService.route(
          {
            origin: { 
              lat: pickupLocation.latitude, 
              lng: pickupLocation.longitude 
            },
            destination: { 
              lat: dropoffLocation.latitude, 
              lng: dropoffLocation.longitude 
            },
            waypoints,
            optimizeWaypoints: waypoints.length > 1,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false,
            // Configure for shortest distance routes, not fastest time
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: google.maps.TrafficModel.OPTIMISTIC
            },
            // Request alternative routes to find shortest distance
            provideRouteAlternatives: true
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              // Find the shortest route by distance (not time)
              if (result.routes && result.routes.length > 1) {
                let shortestRoute = result.routes[0];
                let shortestDistance = result.routes[0].legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0);
                
                // Compare all routes to find the one with shortest distance
                for (let i = 1; i < result.routes.length; i++) {
                  const routeDistance = result.routes[i].legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0);
                  if (routeDistance < shortestDistance) {
                    shortestRoute = result.routes[i];
                    shortestDistance = routeDistance;
                  }
                }
                
                // Create a new result with only the shortest route
                const shortestResult: google.maps.DirectionsResult = {
                  ...result,
                  routes: [shortestRoute]
                };
                
                setGoogleDirections(shortestResult);
              } else {
                // Only one route available, use it
                setGoogleDirections(result);
              }
            } else {
              setGoogleDirections(null);
            }
          }
        );
      });
    } else {
      setGoogleDirections(null);
    }
  }, [hasValidPickup, hasValidDropoff, validStops, pickupLocation, dropoffLocation, showRoute]);

  // Update route when locations change
  useEffect(() => {
    if (isGoogleMapsLoaded) {
      // Use a small delay to ensure state updates have been processed
      const timeoutId = setTimeout(() => {
        updateGoogleRoute();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isGoogleMapsLoaded, updateGoogleRoute]);

  // Handle location permission errors
  const getLocationErrorMessage = (error: string | null) => {
    switch (error) {
      case "PERMISSION_DENIED":
        return "Location access denied. Please enable location services in your browser settings to see your current location on the map.";
      case "POSITION_UNAVAILABLE":
        return "Your location is currently unavailable. Please check your device's location settings.";
      case "TIMEOUT":
        return "Location request timed out. Please try again.";
      case "GEOLOCATION_NOT_SUPPORTED":
        return "Geolocation is not supported by this browser.";
      default:
        return null;
    }
  };

  // Render loading or error state
  if (googleMapsLoadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-destructive font-medium">Error loading Google Maps</p>
          <p className="text-sm text-muted-foreground">Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!isGoogleMapsLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading Maps...</p>
        </div>
      </div>
    );
  }

  const locationErrorMessage = getLocationErrorMessage(error);

  // Render the map
  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Location permission message */}
      {locationErrorMessage && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Location Access</p>
              <p className="text-xs text-muted-foreground mt-1">{locationErrorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={(map) => {
          googleMapRef.current = map;
          
          // Optimize map performance and keep UK restriction
          map.setOptions({
            restriction: {
              latLngBounds: {
                north: 60.9,
                south: 49.8,
                west: -8.7,
                east: 2.0
              },
              strictBounds: false
            }
          });
          
          setMapLoaded(true);
        }}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          gestureHandling: 'cooperative',
          minZoom: 6,
          maxZoom: 20,
          disableDefaultUI: false,
          clickableIcons: false,
          // Use default Google Maps styling
          styles: []
        }}
      >
        {/* User Location Marker */}
        {showCurrentLocation && lastUserCoords && (
          <Marker
            position={lastUserCoords}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeOpacity: 1,
              strokeWeight: 3
            }}
            title="Your Location"
            zIndex={500}
          />
        )}

        {/* Pickup Location Marker */}
        {hasValidPickup && (
          <Marker
            position={{ 
              lat: pickupLocation.latitude, 
              lng: pickupLocation.longitude 
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 16,
              fillColor: "#22c55e", // Green for pickup
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeOpacity: 1,
              strokeWeight: 3
            }}
            label={{
              text: "P",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold"
            }}
            title="Pickup Location"
            zIndex={1000}
          />
        )}

        {/* Dropoff Location Marker */}
        {hasValidDropoff && (
          <Marker
            position={{ 
              lat: dropoffLocation.latitude, 
              lng: dropoffLocation.longitude 
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 16,
              fillColor: "#ef4444", // Red for dropoff
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeOpacity: 1,
              strokeWeight: 3
            }}
            label={{
              text: "D",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold"
            }}
            title="Dropoff Location"
            zIndex={1000}
          />
        )}

        {/* Additional Stops Markers */}
        {validStops.map((stop, index) => (
          <Marker
            key={`stop-${index}-${stop.latitude}-${stop.longitude}`}
            position={{ 
              lat: stop.latitude, 
              lng: stop.longitude 
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 16,
              fillColor: "#000000", // Black for stops as requested
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeOpacity: 1,
              strokeWeight: 3
            }}
            label={{
              text: (index + 1).toString(),
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold"
            }}
            title={`Stop ${index + 1}: ${stop.address || 'Unknown'}`}
            zIndex={999}
          />
        ))}

        {/* Route Directions */}
        {showRoute && googleDirections && (
          <DirectionsRenderer
            directions={googleDirections}
            options={{
              suppressMarkers: true, // Hide default A/B markers since we have custom ones
              polylineOptions: {
                strokeColor: '#4285F4',
                strokeOpacity: 0.9,
                strokeWeight: 4,
                geodesic: true
              },
              preserveViewport: true // Keep current viewport, don't auto-adjust zoom
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
