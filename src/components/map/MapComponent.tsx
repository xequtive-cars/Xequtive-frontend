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
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useGeolocation } from "@/hooks/useGeolocation";

// Set Mapbox access token from environment variable
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  // Mapbox token is not defined
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

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

// Service area boundaries for UK
const UK_SERVICE_BOUNDARIES = {
  southwest: { lat: 49.9, lng: -8.65 },
  northeast: { lat: 58.7, lng: 1.76 },
};

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
  // Refs for managing the map and markers
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userLocationRadiusRef = useRef<mapboxgl.Marker | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const stopMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const mapInitializedRef = useRef(false);
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);

  // State for user coordinates
  const [lastUserCoords, setLastUserCoords] = useState<[number, number] | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);

  // Use our geolocation hook to get user's position
  const { error, latitude, longitude, accuracy, getCurrentPosition } =
    useGeolocation();

  // Call onLocationError when error changes
  useEffect(() => {
    if (onLocationError) {
      onLocationError(error);
    }
  }, [error, onLocationError]);

  // Store last known user coordinates and notify parent component
  useEffect(() => {
    if (latitude && longitude) {
      setLastUserCoords([longitude, latitude]);

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
      }
    }
  }, [showCurrentLocation, onLocationError, onUserLocationChange]);

  // Attempt to get user location as soon as component mounts
  useEffect(() => {
    if (showCurrentLocation) {
      getCurrentPosition();
    }
  }, [getCurrentPosition, showCurrentLocation]);

  // Memoize the updateRoute function to prevent it from changing on every render
  const updateRoute = useCallback(() => {
    if (!map.current) {
      return;
    }

    // Only proceed if we have at least pickup and dropoff points
    if (!pickupLocation || !dropoffLocation) {
      return;
    }

    // If style is not yet loaded, wait for it to load before continuing
    if (!map.current.isStyleLoaded()) {
      map.current.once("style.load", () => {
        updateRoute();
      });
      return;
    }

    // When we have at least pickup and dropoff, fetch directions if showRoute is true
    if (showRoute) {
      // Collect all waypoints in order
      const waypoints: [number, number][] = [];

      // Start with pickup
      waypoints.push([pickupLocation.longitude, pickupLocation.latitude]);

      // Add stops in order if any
      if (stops && stops.length > 0) {
        stops.forEach((stop) => {
          waypoints.push([stop.longitude, stop.latitude]);
        });
      }

      // End with dropoff
      waypoints.push([dropoffLocation.longitude, dropoffLocation.latitude]);

      // Only proceed if we have at least 2 points (pickup and dropoff)
      if (waypoints.length >= 2) {
        // Build the waypoints string for the Directions API
        // Format: lon1,lat1;lon2,lat2;...
        const waypointStr = waypoints
          .map((point) => `${point[0]},${point[1]}`)
          .join(";");

        // Build the Mapbox Directions API URL
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointStr}?geometries=geojson&access_token=${mapboxgl.accessToken}&overview=full`;

        // Fetch the directions data
        fetch(directionsUrl)
          .then((response) => response.json())
          .then((data) => {
            if (!map.current) {
              return;
            }

            if (data.routes && data.routes.length > 0) {
              // Get the route geometry (array of coordinates)
              const route = data.routes[0];
              const routeGeometry = route.geometry;

              // Remove any existing route layers and source
              try {
                // Remove dependent layers first
                if (map.current.getLayer("route-outline")) {
                  map.current.removeLayer("route-outline");
                }

                if (map.current.getLayer("route-line")) {
                  map.current.removeLayer("route-line");
                }

                // Then remove the source
                if (map.current.getSource("route")) {
                  map.current.removeSource("route");
                }
              } catch (error) {
                console.error("Error removing existing route layers:", error);
              }

              // Add new source and layers
              try {
                // Create route source
                map.current.addSource("route", {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: routeGeometry,
                  },
                });

                // Add outline layer for better visibility
                map.current.addLayer({
                  id: "route-outline",
                  type: "line",
                  source: "route",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": "#000",
                    "line-opacity": 0.8,
                    "line-width": 7,
                  },
                });

                // Add the route line
                map.current.addLayer({
                  id: "route-line",
                  type: "line",
                  source: "route",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": "#3B82F6", // Blue color
                    "line-width": 5,
                    "line-opacity": 1,
                    "line-dasharray": [0.5, 0], // Solid line for real routes
                  },
                });
              } catch (error) {
                console.error("Error adding route layers:", error);
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching directions:", error);
          });
      }
    }

    // Create bounds to fit all points including user location
    const bounds = new mapboxgl.LngLatBounds();

    // Add pickup point to bounds
    bounds.extend([pickupLocation.longitude, pickupLocation.latitude]);

    // Add stop points to bounds
    stops.forEach((stop) => {
      bounds.extend([stop.longitude, stop.latitude]);
    });

    // Add dropoff point to bounds
    bounds.extend([dropoffLocation.longitude, dropoffLocation.latitude]);

    // Add user location to bounds if available
    if (latitude && longitude && showCurrentLocation) {
      bounds.extend([longitude, latitude]);
    }

    // Only fit bounds if we have points
    if (!bounds.isEmpty() && map.current) {
      map.current.fitBounds(bounds, {
        padding: 80, // Add more padding to ensure all markers are visible
        duration: 1000,
      });
    }
  }, [
    pickupLocation,
    dropoffLocation,
    stops,
    showRoute,
    latitude,
    longitude,
    showCurrentLocation,
  ]);

  // Initialize map when container is available (once only)
  useEffect(() => {
    if (!mapContainer.current || map.current || mapInitializedRef.current)
      return;

    mapInitializedRef.current = true;

    // London coordinates as default
    const defaultCenter: [number, number] = [-0.127758, 51.507351];

    // Use user coordinates if available already, or last known coordinates
    const initialCenter: [number, number] =
      lastUserCoords ||
      (latitude && longitude ? [longitude, latitude] : defaultCenter);

    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: latitude && longitude ? 15 : mapZoom,
      preserveDrawingBuffer: true,
    });

    // Add navigation controls
    const nav = new mapboxgl.NavigationControl();
    map.current.addControl(nav, "top-right");

    // Add geolocate control (keep this for additional functionality)
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    geolocateControlRef.current = geolocate;
    map.current.addControl(geolocate);

    // Prevent automatic triggering of the geolocate control to avoid refreshing
    geolocate.on("geolocate", () => {
      // Was logging: User manually triggered geolocate
    });

    // Handle map load event
    map.current.on("load", () => {
      // Was logging: Map load event triggered

      // Setup route source and layer for future use
      if (map.current) {
        try {
          setMapLoaded(true);
          // Was logging: Map loaded, ready for markers and routes

          // If we already have coordinates, immediately add the marker for user location
          if (latitude && longitude && showCurrentLocation) {
            // Was logging: Adding user location marker after map load
            addUserLocationMarker(longitude, latitude, accuracy);
          }

          // Check if we have pickup and dropoff locations - draw route immediately if available
          if (pickupLocation && dropoffLocation && showRoute) {
            // Was logging: Attempting to draw initial route after map load

            // Try drawing route immediately if style is loaded
            if (map.current.isStyleLoaded()) {
              // Was logging: Map style already loaded, drawing route now
              updateRoute();
            } else {
              // If style isn't loaded yet, wait for it
              // Was logging: Waiting for style to load before drawing initial route
              map.current.once("style.load", () => {
                // Was logging: Style loaded after map load, now drawing route
                updateRoute();
              });

              // Also set a timeout as backup
              setTimeout(() => {
                if (map.current && pickupLocation && dropoffLocation) {
                  // Was logging: Timeout backup for initial route drawing
                  updateRoute();
                }
              }, 1000);
            }
          }

          // Only trigger geolocate if specifically requested and no coordinates yet
          if (
            showCurrentLocation &&
            geolocateControlRef.current &&
            !latitude &&
            !longitude
          ) {
            // Small delay to let the map fully initialize
            setTimeout(() => {
              // Was logging: Triggering geolocate control
              geolocateControlRef.current?.trigger();
            }, 500);
          }
        } catch (error) {
          console.error("Error in map load handler:", error);
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        mapInitializedRef.current = false;
        setMapLoaded(false);
      }
    };
  }, [
    mapZoom,
    lastUserCoords,
    latitude,
    longitude,
    showCurrentLocation,
    accuracy,
    pickupLocation,
    dropoffLocation,
    showRoute,
    updateRoute,
  ]);

  // Helper function to add user location marker to the map
  const addUserLocationMarker = (
    longitude: number,
    latitude: number,
    accuracy?: number | null
  ) => {
    if (!map.current) return;

    // Remove existing user location markers
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
    }
    if (userLocationRadiusRef.current) {
      userLocationRadiusRef.current.remove();
    }

    // Create a div element for the user location marker (blue dot)
    const el = document.createElement("div");
    el.className = "user-location-marker";
    el.style.backgroundColor = "#4285F4";
    el.style.border = "2px solid #fff";
    el.style.borderRadius = "50%";
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

    // Create the user location marker
    userLocationMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add accuracy radius if available
    if (accuracy && accuracy > 0) {
      // Create accuracy radius element
      const radiusEl = document.createElement("div");
      radiusEl.className = "user-location-radius";
      radiusEl.style.backgroundColor = "rgba(66, 133, 244, 0.2)";
      radiusEl.style.border = "1px solid rgba(66, 133, 244, 0.4)";
      radiusEl.style.borderRadius = "50%";

      // Scale the div based on accuracy (roughly)
      // This is an approximation, as mapbox uses mercator projection
      const size = Math.min(accuracy / 5, 100); // Limit size for very large accuracy values
      radiusEl.style.width = `${size}px`;
      radiusEl.style.height = `${size}px`;

      userLocationRadiusRef.current = new mapboxgl.Marker(radiusEl)
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    }
  };

  // Update user location marker when coordinates change
  useEffect(() => {
    if (!map.current || !latitude || !longitude || !showCurrentLocation) return;

    // Center map on user's location if we just got it for the first time
    const shouldCenter = !userLocationMarkerRef.current;

    // Add the user location marker
    addUserLocationMarker(longitude, latitude, accuracy);

    // Center map on user location if this is the first time we got it
    if (shouldCenter && mapLoaded) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        essential: true,
      });
    }
  }, [latitude, longitude, accuracy, showCurrentLocation, mapLoaded]);

  // Update pickup marker when pickup location changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing pickup marker
    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    // Add new pickup marker if location is provided
    if (pickupLocation) {
      const markerEl = document.createElement("div");
      markerEl.className = "pickup-marker";
      markerEl.style.backgroundColor = "#10B981"; // Green color
      markerEl.style.border = "2px solid #fff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.width = "24px";
      markerEl.style.height = "24px";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      // Add a "P" in the center
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "#ffffff";
      markerEl.style.fontSize = "12px";
      markerEl.style.fontWeight = "bold";
      markerEl.innerText = "P";

      pickupMarkerRef.current = new mapboxgl.Marker(markerEl)
        .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
        .addTo(map.current);

      // Add popup if address is available
      if (pickupLocation.address) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          `Pickup: ${pickupLocation.address}`
        );
        pickupMarkerRef.current.setPopup(popup);
      }

      // Ensure user location marker is still visible
      if (showCurrentLocation && latitude && longitude) {
        addUserLocationMarker(longitude, latitude, accuracy);
      }
    }

    // Update route
    updateRoute();
  }, [
    pickupLocation,
    mapLoaded,
    showCurrentLocation,
    latitude,
    longitude,
    accuracy,
    updateRoute,
  ]);

  // Update dropoff marker when dropoff location changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing dropoff marker
    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    // Add new dropoff marker if location is provided
    if (dropoffLocation) {
      const markerEl = document.createElement("div");
      markerEl.className = "dropoff-marker";
      markerEl.style.backgroundColor = "#EF4444"; // Red color
      markerEl.style.border = "2px solid #fff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.width = "24px";
      markerEl.style.height = "24px";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      // Add a "D" in the center
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "#ffffff";
      markerEl.style.fontSize = "12px";
      markerEl.style.fontWeight = "bold";
      markerEl.innerText = "D";

      dropoffMarkerRef.current = new mapboxgl.Marker(markerEl)
        .setLngLat([dropoffLocation.longitude, dropoffLocation.latitude])
        .addTo(map.current);

      // Add popup if address is available
      if (dropoffLocation.address) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          `Dropoff: ${dropoffLocation.address}`
        );
        dropoffMarkerRef.current.setPopup(popup);
      }
    }

    // Update route
    updateRoute();
  }, [dropoffLocation, mapLoaded, updateRoute]);

  // Update stop markers when stops change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing stop markers
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current = [];

    // Add new stop markers
    stops.forEach((stop, index) => {
      const markerEl = document.createElement("div");
      markerEl.className = "stop-marker";
      markerEl.style.backgroundColor = "#000000"; // Black color for stops
      markerEl.style.border = "2px solid #fff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.width = "20px";
      markerEl.style.height = "20px";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      // Add stop number in the center
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "#ffffff";
      markerEl.style.fontSize = "12px";
      markerEl.style.fontWeight = "bold";
      markerEl.innerText = (index + 1).toString();

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([stop.longitude, stop.latitude])
        .addTo(map.current!);

      // Add popup if address is available
      if (stop.address) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          `Stop ${index + 1}: ${stop.address}`
        );
        marker.setPopup(popup);
      }

      stopMarkersRef.current.push(marker);
    });

    // Update route
    updateRoute();
  }, [stops, mapLoaded, updateRoute]);

  // Update route when showRoute changes
  useEffect(() => {
    if (mapLoaded) {
      updateRoute();
    }
  }, [showRoute, mapLoaded, updateRoute]);

  // Update the handleRetry function
  const handleRetry = () => {
    // Clear any previous errors
    if (onLocationError) {
      onLocationError(null);
    }

    // Request permission again with the browser's native dialog
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Success - location permission granted
          getCurrentPosition();
        },
        (error) => {
          // Error handling - check if permission is denied
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
    }
  };

  // Add new effect for handling preview location
  const previewMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Handle preview location changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing preview marker
    if (previewMarkerRef.current) {
      previewMarkerRef.current.remove();
      previewMarkerRef.current = null;
    }

    // Add new preview marker if location is provided
    if (previewLocation && previewLocation.isPreview) {
      // Create marker element with styling based on location type
      const markerEl = document.createElement("div");
      markerEl.className = "preview-marker";

      // Set marker style based on type
      let markerColor = "#6B7280"; // Default gray
      let markerText = "?";

      if (previewLocation.type === "pickup") {
        markerColor = "#10B981"; // Green
        markerText = "P";
      } else if (previewLocation.type === "dropoff") {
        markerColor = "#EF4444"; // Red
        markerText = "D";
      } else if (previewLocation.type === "stop") {
        markerColor = "#000000"; // Black
        markerText = "S";
      }

      markerEl.style.backgroundColor = markerColor;
      markerEl.style.border = "2px solid #fff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.width = "24px";
      markerEl.style.height = "24px";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";
      markerEl.style.opacity = "0.7"; // Semi-transparent to indicate preview state
      markerEl.style.cursor = "pointer";

      // Add letter in the center
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "#ffffff";
      markerEl.style.fontSize = "12px";
      markerEl.style.fontWeight = "bold";
      markerEl.innerText = markerText;

      // Create and add the marker
      previewMarkerRef.current = new mapboxgl.Marker(markerEl)
        .setLngLat([previewLocation.longitude, previewLocation.latitude])
        .addTo(map.current);

      // Add popup for the location address
      if (previewLocation.address) {
        const popupText = `${
          previewLocation.type === "pickup"
            ? "Pickup"
            : previewLocation.type === "dropoff"
            ? "Dropoff"
            : "Stop"
        }: ${previewLocation.address}`;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setText(popupText);

        previewMarkerRef.current.setPopup(popup);
        popup.addTo(map.current);
      }

      // Fly to the preview location
      map.current.flyTo({
        center: [previewLocation.longitude, previewLocation.latitude],
        zoom: 15,
        essential: true,
      });
    }
  }, [previewLocation, mapLoaded]);

  // Helper function to update pickup marker
  const updatePickupMarker = useCallback(
    (longitude: number, latitude: number) => {
      if (!map.current || !mapLoaded) return;

      // Remove existing pickup marker
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }

      // Create new pickup marker
      const markerEl = document.createElement("div");
      markerEl.className = "pickup-marker";
      markerEl.style.backgroundColor = "#10B981"; // Green color
      markerEl.style.border = "2px solid #fff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.width = "24px";
      markerEl.style.height = "24px";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      // Add a "P" in the center
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "#ffffff";
      markerEl.style.fontSize = "12px";
      markerEl.style.fontWeight = "bold";
      markerEl.innerText = "P";

      pickupMarkerRef.current = new mapboxgl.Marker(markerEl)
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    },
    [mapLoaded]
  );

  // Helper function to update dropoff marker
  const updateDropoffMarker = useCallback(
    (longitude: number, latitude: number) => {
      if (!map.current || !mapLoaded) return;

      // Remove existing dropoff marker
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.remove();
        dropoffMarkerRef.current = null;
      }

      // Create new dropoff marker
      const markerEl = document.createElement("div");
      markerEl.className = "dropoff-marker";
      markerEl.style.backgroundColor = "#EF4444"; // Red color
      markerEl.style.border = "2px solid #fff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.width = "24px";
      markerEl.style.height = "24px";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

      // Add a "D" in the center
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.color = "#ffffff";
      markerEl.style.fontSize = "12px";
      markerEl.style.fontWeight = "bold";
      markerEl.innerText = "D";

      dropoffMarkerRef.current = new mapboxgl.Marker(markerEl)
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    },
    [mapLoaded]
  );

  // Helper function to update stop markers
  const updateStopMarkers = useCallback(
    (newStops: Location[]) => {
      if (!map.current || !mapLoaded) return;

      // Remove existing stop markers
      stopMarkersRef.current.forEach((marker) => marker.remove());
      stopMarkersRef.current = [];

      // Add new stop markers
      newStops.forEach((stop, index) => {
        const markerEl = document.createElement("div");
        markerEl.className = "stop-marker";
        markerEl.style.backgroundColor = "#000000"; // Black color for stops
        markerEl.style.border = "2px solid #fff";
        markerEl.style.borderRadius = "50%";
        markerEl.style.width = "20px";
        markerEl.style.height = "20px";
        markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.1)";

        // Add stop number in the center
        markerEl.style.display = "flex";
        markerEl.style.alignItems = "center";
        markerEl.style.justifyContent = "center";
        markerEl.style.color = "#ffffff";
        markerEl.style.fontSize = "12px";
        markerEl.style.fontWeight = "bold";
        markerEl.innerText = (index + 1).toString();

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(map.current!);

        stopMarkersRef.current.push(marker);
      });
    },
    [mapLoaded]
  );

  // Helper function to fit the map to all markers
  const fitMapToMarkers = useCallback(
    (
      pickup: Location | null,
      dropoff: Location | null,
      additionalStops: Location[] = [],
      userLocation: Location | null = null
    ) => {
      if (!map.current || !mapLoaded) return;

      const locations: Location[] = [];

      if (pickup) locations.push(pickup);
      if (dropoff) locations.push(dropoff);
      locations.push(...additionalStops);
      if (userLocation) locations.push(userLocation);

      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach((loc) => {
          bounds.extend([loc.longitude, loc.latitude]);
        });

        // Add padding and fit bounds
        map.current.fitBounds(bounds, {
          padding: 60,
          maxZoom: 15,
          duration: 1000,
        });
      }
    },
    [mapLoaded]
  );

  // Helper function to check and create route source if needed
  function checkAndCreateRouteSource() {
    if (!map.current) return;

    try {
      // Check if source already exists
      if (!map.current.getSource("route")) {
        // Was logging: MapInterface: Route source does not exist, creating it

        // Create route source if it doesn't exist yet
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        // Create route layer if it doesn't exist
        map.current.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3B82F6", // Blue color
            "line-width": 5,
            "line-opacity": 0.9,
            "line-dasharray": [0.5, 0], // Solid line for real routes
          },
        });

        // Was logging: Route source and layer created successfully
      } else {
        // Was logging: MapInterface: Route source already exists
      }
    } catch (error) {
      console.error("Error in checkAndCreateRouteSource:", error);
    }
  }

  // Expose map methods to parent components
  useEffect(() => {
    if (map.current && mapLoaded && passMapRef) {
      // Create an interface for external components to update the map
      const mapInterface = {
        updateLocations: (
          newPickup: Location | null,
          newDropoff: Location | null,
          newStops: Location[] = []
        ) => {
          // Was logging: MapInterface.updateLocations called with:
          // Was logging: Pickup:
          // Was logging: Dropoff:
          // Was logging: Stops:
          try {
            // Process update IMMEDIATELY without waiting for next render cycle
            // Update markers without re-initializing the map

            // Update markers without re-initializing the map
            if (newPickup) {
              updatePickupMarker(newPickup.longitude, newPickup.latitude);
            } else if (pickupMarkerRef.current) {
              pickupMarkerRef.current.remove();
              pickupMarkerRef.current = null;
            }

            if (newDropoff) {
              updateDropoffMarker(newDropoff.longitude, newDropoff.latitude);
            } else if (dropoffMarkerRef.current) {
              dropoffMarkerRef.current.remove();
              dropoffMarkerRef.current = null;
            }

            // Update stop markers
            updateStopMarkers(newStops);

            // If we're missing pickup or dropoff, clear the route
            if (!newPickup || !newDropoff) {
              clearRoute();
              // Was logging: MapInterface: Cleared route - missing pickup or dropoff

              // Fit bounds to remaining markers
              fitMapToMarkers(
                newPickup,
                newDropoff,
                newStops,
                showCurrentLocation && lastUserCoords
                  ? {
                      longitude: lastUserCoords[0],
                      latitude: lastUserCoords[1],
                    }
                  : null
              );
              return;
            }

            // IMPROVED: Draw route immediately if we have pickup and dropoff
            if (newPickup && newDropoff && map.current) {
              // Was logging: MapInterface: Starting IMMEDIATE route draw process

              // Don't wait for style to load - try immediately with retry logic
              const tryDrawRoute = (attempt = 0) => {
                if (!map.current) return;

                // Check if style is loaded before proceeding
                if (map.current.isStyleLoaded()) {
                  try {
                    // Was logging: MapInterface: Style is loaded, updating route immediately

                    // Start fetching directions right away while preparing the map
                    fetchAndDrawRoute(newPickup, newDropoff, newStops);
                  } catch (error) {
                    console.error("Error updating route:", error);

                    // Retry on error with shorter delay
                    if (attempt < 3) {
                      setTimeout(() => tryDrawRoute(attempt + 1), 100);
                    }
                  }
                } else {
                  // Was logging: MapInterface: Style not loaded, attempt #${attempt + 1}

                  // First attempt: Listen for style.load event AND set a timer
                  if (attempt === 0) {
                    map.current.once("style.load", () => {
                      // Was logging: MapInterface: Style load event triggered, drawing route
                      fetchAndDrawRoute(newPickup, newDropoff, newStops);
                    });
                  }

                  // Also set a timer as a backup with shorter delays
                  if (attempt < 3) {
                    // Was logging: MapInterface: Scheduling retry #${attempt + 1} in ${100 * (attempt + 1)}ms
                    setTimeout(
                      () => tryDrawRoute(attempt + 1),
                      100 * (attempt + 1)
                    );
                  }
                }
              };

              // Start the route drawing process immediately
              tryDrawRoute();
            } else {
              // Was logging: MapInterface: Not drawing route - missing pickup or dropoff
            }

            // Fit bounds to markers
            fitMapToMarkers(
              newPickup,
              newDropoff,
              newStops,
              showCurrentLocation && lastUserCoords
                ? { longitude: lastUserCoords[0], latitude: lastUserCoords[1] }
                : null
            );
          } catch (error) {
            console.error("Error in updateLocations:", error);
          }
        },
      };

      // Helper function to fetch and draw a route more efficiently
      function fetchAndDrawRoute(
        pickup: Location,
        dropoff: Location,
        stops: Location[] = []
      ) {
        if (!map.current) return;

        try {
          // Ensure route source exists
          checkAndCreateRouteSource();

          // Create waypoints array with explicit typing
          const waypoints: [number, number][] = [
            [pickup.longitude, pickup.latitude] as [number, number],
            ...stops.map(
              (stop) => [stop.longitude, stop.latitude] as [number, number]
            ),
            [dropoff.longitude, dropoff.latitude] as [number, number],
          ];

          // Build directions URL
          const waypointStr = waypoints
            .map((point) => `${point[0]},${point[1]}`)
            .join(";");
          const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointStr}?geometries=geojson&access_token=${mapboxgl.accessToken}&overview=full`;

          // Was logging: MapInterface: Fetching directions API

          // Fetch directions data
          fetch(directionsUrl)
            .then((response) => response.json())
            .then((data) => {
              if (!map.current) return;

              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];

                try {
                  // Get route source
                  const routeSource = map.current.getSource(
                    "route"
                  ) as mapboxgl.GeoJSONSource;

                  // Update source data
                  routeSource.setData({
                    type: "Feature",
                    properties: {},
                    geometry: route.geometry,
                  });

                  // Was logging: MapInterface: Route updated successfully
                } catch (error) {
                  console.error("Error updating route source:", error);

                  // If updating failed, try removing and recreating
                  clearRoute();

                  // Add source and layers again
                  if (map.current.isStyleLoaded()) {
                    try {
                      map.current.addSource("route", {
                        type: "geojson",
                        data: {
                          type: "Feature",
                          properties: {},
                          geometry: route.geometry,
                        },
                      });

                      // Add outline
                      map.current.addLayer({
                        id: "route-outline",
                        type: "line",
                        source: "route",
                        layout: {
                          "line-join": "round",
                          "line-cap": "round",
                        },
                        paint: {
                          "line-color": "#000",
                          "line-opacity": 0.8,
                          "line-width": 7,
                        },
                      });

                      // Add line
                      map.current.addLayer({
                        id: "route-line",
                        type: "line",
                        source: "route",
                        layout: {
                          "line-join": "round",
                          "line-cap": "round",
                        },
                        paint: {
                          "line-color": "#3B82F6",
                          "line-width": 5,
                          "line-opacity": 1,
                          "line-dasharray": [0.5, 0],
                        },
                      });

                      // Was logging: MapInterface: Route recreated successfully
                    } catch (e) {
                      console.error("Failed to recreate route:", e);
                    }
                  }
                }
              }
            })
            .catch((error) => {
              console.error("Error fetching directions:", error);
            });
        } catch (error) {
          console.error("Error in fetchAndDrawRoute:", error);
        }
      }

      // Helper function to clear the route from the map
      function clearRoute() {
        if (!map.current) return;

        try {
          // Remove dependent layers first
          if (map.current.getLayer("route-line")) {
            map.current.removeLayer("route-line");
          }

          if (map.current.getLayer("route-outline")) {
            map.current.removeLayer("route-outline");
          }

          // Then remove the source
          if (map.current.getSource("route")) {
            map.current.removeSource("route");
          }

          // Was logging: MapInterface: Route layers and source removed
        } catch (error) {
          console.error("Error removing route:", error);
        }
      }

      // Pass the interface to the parent
      passMapRef(mapInterface);
    }
  }, [
    mapLoaded,
    passMapRef,
    updateRoute,
    updatePickupMarker,
    updateDropoffMarker,
    updateStopMarkers,
    fitMapToMarkers,
    showCurrentLocation,
    lastUserCoords,
  ]);

  // Cleanup function to remove all markers and popups
  const cleanupMap = useCallback(() => {
    // Remove all markers
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current = [];

    // Remove user location marker if it exists
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }

    // Remove all popups
    popupsRef.current.forEach((popup) => popup.remove());
    popupsRef.current = [];
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapboxgl.supported()) {
      onLocationError?.("Your browser does not support Mapbox GL");
      return;
    }

    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-0.118092, 51.509865], // Starting position [lng, lat] - London
        zoom: 11,
      });

      const loadedMap = map.current;

      loadedMap.on("load", () => {
        // Add route source and layer when map loads
        loadedMap.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        });

        loadedMap.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        // Get route source for later updates
        routeRef.current = loadedMap.getSource(
          "route"
        ) as mapboxgl.GeoJSONSource;

        // Add UK service area boundaries
        loadedMap.addSource("uk-service-area", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [
                    UK_SERVICE_BOUNDARIES.southwest.lng,
                    UK_SERVICE_BOUNDARIES.southwest.lat,
                  ],
                  [
                    UK_SERVICE_BOUNDARIES.northeast.lng,
                    UK_SERVICE_BOUNDARIES.southwest.lat,
                  ],
                  [
                    UK_SERVICE_BOUNDARIES.northeast.lng,
                    UK_SERVICE_BOUNDARIES.northeast.lat,
                  ],
                  [
                    UK_SERVICE_BOUNDARIES.southwest.lng,
                    UK_SERVICE_BOUNDARIES.northeast.lat,
                  ],
                  [
                    UK_SERVICE_BOUNDARIES.southwest.lng,
                    UK_SERVICE_BOUNDARIES.southwest.lat,
                  ],
                ],
              ],
            },
          },
        });

        // Add a border for the service area
        loadedMap.addLayer({
          id: "uk-service-area-border",
          type: "line",
          source: "uk-service-area",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        // Add a fill for the service area with low opacity
        loadedMap.addLayer({
          id: "uk-service-area-fill",
          type: "fill",
          source: "uk-service-area",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.05,
          },
        });

        // Add excluded areas (simplified for example)
        loadedMap.addSource("excluded-areas", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              // Northern Scottish Highlands (simplified)
              {
                type: "Feature",
                properties: { name: "Northern Scottish Highlands" },
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [-5.5, 57.5],
                      [-3.0, 57.5],
                      [-3.0, 58.7],
                      [-5.5, 58.7],
                      [-5.5, 57.5],
                    ],
                  ],
                },
              },
              // Outer Hebrides (simplified)
              {
                type: "Feature",
                properties: { name: "Outer Hebrides" },
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [-7.5, 57.5],
                      [-6.5, 57.5],
                      [-6.5, 58.5],
                      [-7.5, 58.5],
                      [-7.5, 57.5],
                    ],
                  ],
                },
              },
            ],
          },
        });

        // Add excluded areas with striped pattern
        loadedMap.addLayer({
          id: "excluded-areas",
          type: "fill",
          source: "excluded-areas",
          paint: {
            "fill-color": "#ef4444",
            "fill-opacity": 0.2,
            "fill-pattern": "hatch",
          },
        });

        // Add labels for excluded areas
        loadedMap.addLayer({
          id: "excluded-area-labels",
          type: "symbol",
          source: "excluded-areas",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-font": ["Open Sans Regular"],
            "text-max-width": 10,
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#ef4444",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1,
          },
        });

        // Add service area info popup
        const serviceAreaInfoPopup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          className: "service-area-info-popup",
        })
          .setLngLat([-4.5, 54.5])
          .setHTML(
            `
            <div class="p-2">
              <h3 class="font-bold text-sm mb-1">Service Area Information</h3>
              <p class="text-xs mb-1">We service the UK mainland, Isle of Wight, and Anglesey.</p>
              <p class="text-xs mb-1">Maximum journey: 300 miles</p>
              <p class="text-xs text-red-500">Red areas are not serviced</p>
            </div>
          `
          )
          .addTo(loadedMap);

        popupsRef.current.push(serviceAreaInfoPopup);

        setTimeout(() => {
          serviceAreaInfoPopup.remove();
        }, 8000);
      });

      // Handle user location if enabled
      if (showCurrentLocation) {
        // Add the control to the map
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        });

        // Add geolocate control to top-right corner of map
        loadedMap.addControl(geolocateControl, "top-right");

        loadedMap.on("load", () => {
          // Try to get location immediately if requested
          geolocateControl.trigger();
        });

        // Add geolocate event handling
        loadedMap.on("geolocate", (e: mapboxgl.MapboxEvent) => {
          // Create a properly typed interface for the geolocate event data
          interface GeolocateData {
            detail: {
              data: {
                coords: {
                  latitude: number;
                  longitude: number;
                };
              };
            };
          }

          const geolocateEvent = e as unknown as GeolocateData;
          const position = geolocateEvent.detail.data;
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          onUserLocationChange?.(userLocation);
        });

        // Add error handling for geolocation
        loadedMap.on("error", (e: mapboxgl.ErrorEvent) => {
          // Create a properly typed interface for the location error
          interface LocationErrorEvent {
            error: {
              code: string;
            };
          }

          const locationError = e as unknown as LocationErrorEvent;
          if (
            locationError.error &&
            locationError.error.code === "LOCATION_PERMISSION_DENIED"
          ) {
            onLocationError?.("PERMISSION_DENIED");
          }
        });
      }

      // Pass map reference to parent component if requested
      if (passMapRef) {
        passMapRef({
          updateLocations: (
            newPickup: Location | null,
            newDropoff: Location | null,
            newStops?: Location[]
          ) => {
            // This function will be called by the parent to update markers and route
            updateMapElements(
              newPickup,
              newDropoff,
              newStops || [],
              showRoute,
              loadedMap
            );
          },
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        cleanupMap();
        map.current.remove();
        map.current = null;
      }
    };
  }, [
    showCurrentLocation,
    cleanupMap,
    passMapRef,
    onUserLocationChange,
    onLocationError,
    showRoute,
  ]);

  // Update map elements when locations change
  const updateMapElements = useCallback(
    (
      pickup: Location | null,
      dropoff: Location | null,
      stopsList: Location[],
      showRouteLines: boolean,
      mapInstance: mapboxgl.Map
    ) => {
      // First, clean up existing markers
      cleanupMap();

      // Define all points to fit bounds
      const points: [number, number][] = [];

      // Add pickup marker if available
      if (pickup && pickup.latitude && pickup.longitude) {
        const pickupMarker = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([pickup.longitude, pickup.latitude])
          .addTo(mapInstance);

        // Add popup with address
        if (pickup.address) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>Pickup:</strong> ${pickup.address}`
          );
          pickupMarker.setPopup(popup);
          popupsRef.current.push(popup);
        }

        points.push([pickup.longitude, pickup.latitude]);
      }

      // Add markers for each stop
      stopsList.forEach((stop, index) => {
        if (stop && stop.latitude && stop.longitude) {
          const stopMarker = new mapboxgl.Marker({ color: "#f59e0b" })
            .setLngLat([stop.longitude, stop.latitude])
            .addTo(mapInstance);

          // Create stop element with number
          const el = document.createElement("div");
          el.className = "stop-marker";
          el.innerHTML = `<div class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">${
            index + 1
          }</div>`;

          // Add popup with address
          if (stop.address) {
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>Stop ${index + 1}:</strong> ${stop.address}`
            );
            stopMarker.setPopup(popup);
            popupsRef.current.push(popup);
          }

          points.push([stop.longitude, stop.latitude]);
        }
      });

      // Add dropoff marker if available
      if (dropoff && dropoff.latitude && dropoff.longitude) {
        const dropoffMarker = new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat([dropoff.longitude, dropoff.latitude])
          .addTo(mapInstance);

        // Add popup with address
        if (dropoff.address) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>Dropoff:</strong> ${dropoff.address}`
          );
          dropoffMarker.setPopup(popup);
          popupsRef.current.push(popup);
        }

        points.push([dropoff.longitude, dropoff.latitude]);
      }

      // Fit map to bounds of all points if there are points
      if (points.length > 0) {
        const bounds = points.reduce(
          (bound, coord) => bound.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(points[0], points[0])
        );

        mapInstance.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        });
      }

      // Get route if there are at least pickup and dropoff
      if (
        showRouteLines &&
        routeRef.current &&
        pickup &&
        pickup.latitude &&
        pickup.longitude &&
        dropoff &&
        dropoff.latitude &&
        dropoff.longitude
      ) {
        // Build waypoints including pickup, all stops, and dropoff
        const waypoints = [
          [pickup.longitude, pickup.latitude],
          ...stopsList.map((stop) => [stop.longitude, stop.latitude]),
          [dropoff.longitude, dropoff.latitude],
        ];

        // Fetch route from Mapbox Directions API with all waypoints
        const getDirections = async () => {
          try {
            const waypointsString = waypoints
              .map((wp) => wp.join(","))
              .join(";");

            const response = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`
            );

            const data = await response.json();

            if (data.routes && data.routes.length > 0 && routeRef.current) {
              // Update route on map
              routeRef.current.setData({
                type: "Feature",
                properties: {},
                geometry: data.routes[0].geometry,
              });
            }
          } catch {
            // Silent fail for route fetching
          }
        };

        getDirections();
      }
    },
    [cleanupMap]
  );

  // Update map when locations change
  useEffect(() => {
    if (map.current) {
      updateMapElements(
        pickupLocation,
        dropoffLocation,
        stops,
        showRoute,
        map.current
      );
    }
  }, [pickupLocation, dropoffLocation, stops, showRoute, updateMapElements]);

  return (
    <div className={`map-container relative ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
      />
      {error && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-md shadow-md max-w-sm">
          <p className="text-red-500 font-semibold mb-2">Location error</p>
          <p className="text-sm mb-2">
            {error === "PERMISSION_DENIED"
              ? "Please enable location access in your browser settings."
              : error === "POSITION_UNAVAILABLE"
              ? "Unable to determine your position. Please try again."
              : error === "TIMEOUT"
              ? "Location request timed out. Please try again."
              : "An error occurred while getting your location."}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
