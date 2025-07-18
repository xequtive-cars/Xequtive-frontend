/*
 * MAPBOX IMPLEMENTATION - CONVERTED FROM GOOGLE MAPS
 *
 * This Map Component provides the following functionality:
 * - Displays user's current location with a blue dot
 * - Shows pickup and dropoff markers
 * - Displays additional stops
 * - Renders actual driving routes between locations using Mapbox Directions API
 * - Automatically fits all markers in the viewport
 *
 * Design and functionality remain identical to the Google Maps version
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useGeolocation } from "@/hooks/useGeolocation";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

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
  // Mapbox specific refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lastLocationHash, setLastLocationHash] = useState<string>('');

  // State for user coordinates
  const [lastUserCoords, setLastUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Memoize location validation for performance
  const hasValidPickup = pickupLocation && pickupLocation.latitude !== 0 && pickupLocation.longitude !== 0;
  const hasValidDropoff = dropoffLocation && dropoffLocation.latitude !== 0 && dropoffLocation.longitude !== 0;
  const validStops = stops.filter(stop => 
    stop.latitude !== 0 && 
    stop.longitude !== 0 && 
    stop.address && 
    stop.address.trim() !== ""
  );

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

  // Initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once

    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.1278, 51.5074], // London
      zoom: mapZoom,
      attributionControl: false,
      customAttribution: '© Mapbox',
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapZoom]);

  // Store last known user coordinates and notify parent component
  useEffect(() => {
    if (latitude && longitude) {
      const userCoords = { lat: latitude, lng: longitude };
      setLastUserCoords(userCoords);

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
    if (!map.current || !mapLoaded) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasLocations = false;

    // Create a hash of current locations to detect changes
    const locationHash = JSON.stringify({
      pickup: hasValidPickup ? { lat: pickupLocation.latitude, lng: pickupLocation.longitude } : null,
      dropoff: hasValidDropoff ? { lat: dropoffLocation.latitude, lng: dropoffLocation.longitude } : null,
      stops: validStops.map(stop => ({ lat: stop.latitude, lng: stop.longitude }))
    });

    // Add pickup location to bounds
    if (hasValidPickup) {
      bounds.extend([pickupLocation.longitude, pickupLocation.latitude]);
      hasLocations = true;
    }

    // Add dropoff location to bounds
    if (hasValidDropoff) {
      bounds.extend([dropoffLocation.longitude, dropoffLocation.latitude]);
      hasLocations = true;
    }

    // Add stops to bounds
    if (validStops.length > 0) {
      validStops.forEach(stop => {
        bounds.extend([stop.longitude, stop.latitude]);
        hasLocations = true;
      });
    }

    // Only fit bounds if locations have actually changed
    if (hasLocations && locationHash !== lastLocationHash) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        // Fit bounds to show all locations with generous padding
        map.current?.fitBounds(bounds, { 
          padding: 60,
          maxZoom: 16
        });
      });
      
      // Update the location hash
      setLastLocationHash(locationHash);
    } else if (!hasLocations && lastUserCoords && isWithinUKBounds(lastUserCoords.lat, lastUserCoords.lng)) {
      // If no booking locations but we have user location within UK, center on user
      if (lastLocationHash !== '') {
        requestAnimationFrame(() => {
          map.current?.setCenter([lastUserCoords.lng, lastUserCoords.lat]);
          map.current?.setZoom(mapZoom);
        });
        setLastLocationHash('');
      }
    } else if (!hasLocations && !lastUserCoords) {
      // No locations and no user location, center on London
      if (lastLocationHash !== '') {
        requestAnimationFrame(() => {
          map.current?.setCenter([-0.1278, 51.5074]);
          map.current?.setZoom(mapZoom);
        });
        setLastLocationHash('');
      }
    }
  }, [hasValidPickup, hasValidDropoff, validStops, pickupLocation, dropoffLocation, lastUserCoords, mapLoaded, mapZoom, lastLocationHash]);

  // Pass map interface to parent
  useEffect(() => {
    if (passMapRef && map.current) {
      const mapInterface: MapInterface = {
        updateLocations: (newPickup, newDropoff, newStops) => {
          // This will be handled by the parent component passing new props
          // The map will automatically update via the useEffect above
        }
      };
      passMapRef(mapInterface);
    }
  }, [passMapRef, mapLoaded]);

  // Calculate and display route using Mapbox Directions API
  useEffect(() => {
    if (!map.current || !hasValidPickup || !hasValidDropoff) return;

    const fetchAndDisplayRoute = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          console.error('Mapbox token not available');
          return;
        }

        // Build coordinates array for the route
        const coordinates = [
          [pickupLocation.longitude, pickupLocation.latitude],
          ...validStops.map(stop => [stop.longitude, stop.latitude]),
          [dropoffLocation.longitude, dropoffLocation.latitude]
        ];

        // Use Mapbox Directions API with shortest path routing
        const params = new URLSearchParams({
          access_token: token,
          geometries: 'geojson',
          overview: 'full',
          steps: 'true',
          annotations: 'distance,duration',
          continue_straight: 'true',
          // Use driving profile for shortest path (not fastest)
          profile: 'driving',
          // Exclude traffic to ensure shortest path calculation
          exclude: 'traffic'
        });

        const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?${params}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Directions API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Remove existing route layer if it exists
          if (map.current && map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          // Add the route to the map
          if (map.current) {
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            });

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8
              }
            });

            // Fit map to show the entire route
            const bounds = new mapboxgl.LngLatBounds();
            coordinates.forEach(coord => {
              bounds.extend(coord as [number, number]);
            });
            
            map.current.fitBounds(bounds, {
              padding: 50,
              maxZoom: 15
            });
          }

          console.log('Route calculated successfully:', {
            distance: route.distance,
            duration: route.duration,
            coordinates: coordinates.length
          });
        }
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    };

    fetchAndDisplayRoute();
  }, [pickupLocation, dropoffLocation, validStops, hasValidPickup, hasValidDropoff]);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add user location marker
    if (showCurrentLocation && lastUserCoords && map.current) {
      const userMarker = new mapboxgl.Marker({
        color: '#4285F4',
        scale: 1
      })
        .setLngLat([lastUserCoords.lng, lastUserCoords.lat])
        .addTo(map.current);
    }

    // Add pickup marker
    if (hasValidPickup && map.current) {
      const pickupMarker = new mapboxgl.Marker({
        color: '#22c55e',
        scale: 1.2
      })
        .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
        .addTo(map.current);
    }

    // Add dropoff marker
    if (hasValidDropoff && map.current) {
      const dropoffMarker = new mapboxgl.Marker({
        color: '#ef4444',
        scale: 1.2
      })
        .setLngLat([dropoffLocation.longitude, dropoffLocation.latitude])
        .addTo(map.current);
    }

    // Add stop markers
    validStops.forEach((stop, index) => {
      if (map.current) {
        const stopMarker = new mapboxgl.Marker({
          color: '#000000',
          scale: 1.2
        })
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(map.current);
      }
    });

  }, [hasValidPickup, hasValidDropoff, validStops, pickupLocation, dropoffLocation, lastUserCoords, showCurrentLocation, mapLoaded]);

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
  if (!mapboxgl.accessToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-destructive font-medium">Error loading Mapbox</p>
          <p className="text-sm text-muted-foreground">Please check your Mapbox configuration and try again.</p>
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
      
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;
