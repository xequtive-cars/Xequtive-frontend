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
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

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

    // Check if Mapbox GL is loaded
    if (typeof mapboxgl === 'undefined') {
      console.error('Mapbox GL library not loaded');
      return;
    }

    // Ensure container has dimensions
    if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
      console.log('Container has no dimensions, retrying in 100ms...');
      const timer = setTimeout(() => {
        // Force a re-render to retry
        setMapLoaded(false);
      }, 100);
      return () => clearTimeout(timer);
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token is not configured');
      return;
    }

    // Set the access token
    mapboxgl.accessToken = accessToken;

    console.log('Creating map with container dimensions:', {
      width: mapContainer.current.offsetWidth,
      height: mapContainer.current.offsetHeight
    });

    try {
      // Create the map with minimal configuration
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-0.1278, 51.5074], // London
        zoom: mapZoom,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
        antialias: false,
        maxZoom: 18,
        minZoom: 0,
        pitch: 0,
        bearing: 0,
        interactive: true,
        trackResize: true,
      });

      console.log('Map created successfully');

      // Check if canvas is properly initialized
      setTimeout(() => {
        if (map.current) {
          const canvas = map.current.getCanvas();
          console.log('Canvas check:', {
            canvas: !!canvas,
            width: canvas?.width,
            height: canvas?.height,
            style: canvas?.style?.display
          });
          
          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.error('Canvas not properly initialized, recreating map...');
            map.current.remove();
            map.current = null;
            setMapLoaded(false);
          }
        }
      }, 1000);

      // Simple load event handler
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        
        // Add navigation control
        try {
          map.current?.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        } catch (error) {
          console.error('Error adding navigation control:', error);
        }
      });

      // Error handler
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

    } catch (error) {
      console.error('Error creating map:', error);
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapZoom, mapLoaded]); // Add mapLoaded to dependencies to trigger retries

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
    if (!map.current || !hasValidPickup || !hasValidDropoff) {
      console.log('Route calculation skipped:', {
        hasMap: !!map.current,
        hasValidPickup,
        hasValidDropoff
      });

      // Remove existing route if we don't have both pickup and dropoff
      if (map.current && (!hasValidPickup || !hasValidDropoff)) {
        try {
          if (map.current.getLayer('route')) {
            map.current.removeLayer('route');
          }
          if (map.current.getSource('route')) {
            map.current.removeSource('route');
          }
          console.log('Route removed - missing pickup or dropoff');
        } catch (error) {
          console.log('Error removing route:', error);
        }
      }
      
      return;
    }

    // Prevent multiple simultaneous route calculations
    let isCalculating = false;

    const fetchAndDisplayRoute = async () => {
      if (isCalculating) {
        console.log('Route calculation already in progress, skipping...');
        return;
      }

      isCalculating = true;

      try {
        console.log('Starting route calculation...');

        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
          console.error('Mapbox token not available');
          return;
        }

        // Build coordinates array for the route
        const coordinates = [
          [pickupLocation.longitude, pickupLocation.latitude],
          ...validStops.map(stop => [stop.longitude, stop.latitude]),
          [dropoffLocation.longitude, dropoffLocation.latitude]
        ];

        console.log('Calculating route for coordinates:', coordinates);

        // Create the URL for Mapbox Directions API
        const coordinatesString = coordinates
          .map(coord => `${coord[0]},${coord[1]}`)
          .join(';');
        
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?access_token=${accessToken}&geometries=geojson&overview=full&steps=true&continue_straight=true`;

        console.log('Directions API URL:', url);

        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Directions API error:', {
            status: response.status,
            error: errorText,
            url: url
          });
          return;
        }

        const data = await response.json();
        console.log('Directions API response:', data);
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Remove existing route layer and source if they exist
          if (map.current) {
            try {
              if (map.current.getLayer('route')) {
                map.current.removeLayer('route');
              }
              if (map.current.getSource('route')) {
                map.current.removeSource('route');
              }
            } catch (error) {
              console.log('Error removing existing route:', error);
            }
          }

          // Add the route to the map immediately
          const addRouteToMap = () => {
            if (!map.current) return;
                
            // Check if map style is loaded before adding sources/layers
            if (!map.current.isStyleLoaded()) {
              console.log('Map style not loaded yet, retrying in 100ms...');
              setTimeout(addRouteToMap, 100);
              return;
            }
            
            try {
              console.log('Adding route to map...');
              
              // Double-check that source doesn't exist before adding
              if (map.current.getSource('route')) {
                console.log('Route source already exists, removing first...');
                map.current.removeLayer('route');
                map.current.removeSource('route');
              }
              
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

              console.log('Route calculated successfully:', {
                distance: route.distance,
                duration: route.duration,
                coordinates: coordinates.length
              });
            } catch (error) {
              console.error('Error adding route to map:', error);
              // Don't retry on error to prevent infinite loops
            }
          };

          // Try to add route immediately
          addRouteToMap();
        } else {
          console.error('No routes returned from Directions API');
            }
      } catch (error) {
        console.error('Error calculating route:', error);
      } finally {
        isCalculating = false;
      }
    };

    // Execute immediately when dependencies change
    fetchAndDisplayRoute();
  }, [pickupLocation, dropoffLocation, validStops, hasValidPickup, hasValidDropoff]);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Check if map container is still valid
    if (!map.current.getContainer()) {
      console.error('Map container is no longer valid');
      return;
    }

    try {
      // Remove existing markers
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add user location marker (blue dot)
      if (showCurrentLocation && lastUserCoords && map.current) {
        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg';
        userMarkerEl.style.zIndex = '10';
        
        const userMarker = new mapboxgl.Marker({
          element: userMarkerEl,
          anchor: 'center'
        })
          .setLngLat([lastUserCoords.lng, lastUserCoords.lat])
          .addTo(map.current);
      }

      // Add pickup marker (green P)
      if (hasValidPickup && map.current) {
        const pickupMarkerEl = document.createElement('div');
        pickupMarkerEl.className = 'w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center';
        pickupMarkerEl.style.zIndex = '11';
        
        const pickupText = document.createElement('span');
        pickupText.className = 'text-white font-bold text-sm';
        pickupText.textContent = 'P';
        pickupMarkerEl.appendChild(pickupText);
        
        const pickupMarker = new mapboxgl.Marker({
          element: pickupMarkerEl,
          anchor: 'center'
        })
          .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
          .addTo(map.current);
      }

      // Add dropoff marker (red D)
      if (hasValidDropoff && map.current) {
        const dropoffMarkerEl = document.createElement('div');
        dropoffMarkerEl.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center';
        dropoffMarkerEl.style.zIndex = '11';
        
        const dropoffText = document.createElement('span');
        dropoffText.className = 'text-white font-bold text-sm';
        dropoffText.textContent = 'D';
        dropoffMarkerEl.appendChild(dropoffText);
        
        const dropoffMarker = new mapboxgl.Marker({
          element: dropoffMarkerEl,
          anchor: 'center'
        })
          .setLngLat([dropoffLocation.longitude, dropoffLocation.latitude])
          .addTo(map.current);
      }

      // Add stop markers (numbered black)
      validStops.forEach((stop, index) => {
        if (map.current) {
          const stopMarkerEl = document.createElement('div');
          stopMarkerEl.className = 'w-8 h-8 bg-black rounded-full border-2 border-white shadow-lg flex items-center justify-center';
          stopMarkerEl.style.zIndex = '11';
          
          const stopText = document.createElement('span');
          stopText.className = 'text-white font-bold text-sm';
          stopText.textContent = (index + 1).toString();
          stopMarkerEl.appendChild(stopText);
          
          const stopMarker = new mapboxgl.Marker({
            element: stopMarkerEl,
            anchor: 'center'
          })
            .setLngLat([stop.longitude, stop.latitude])
            .addTo(map.current);
        }
      });
    } catch (error) {
      console.error('Error adding markers to map:', error);
    }

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
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-destructive font-medium">Mapbox Configuration Error</p>
          <p className="text-sm text-muted-foreground">Please check your NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable.</p>
        </div>
      </div>
    );
  }

  // Check WebGL support
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);
  }, []);

  if (webglSupported === false) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-destructive font-medium">WebGL Not Supported</p>
          <p className="text-sm text-muted-foreground">Your browser does not support WebGL, which is required for the map to display.</p>
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
      
      {/* Map loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;
