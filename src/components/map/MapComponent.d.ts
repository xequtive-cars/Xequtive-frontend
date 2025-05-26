import "mapbox-gl/dist/mapbox-gl.css";

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapInterface {
  updateLocations: (
    newPickup: Location | null,
    newDropoff: Location | null,
    newStops?: Location[]
  ) => void;
}

interface MapComponentProps {
  className?: string;
  mapZoom?: number;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
  stops?: Location[];
  showRoute?: boolean;
  previewLocation?:
    | (Location & {
        isPreview?: boolean;
        type?: string;
      })
    | null;
  showCurrentLocation?: boolean;
  onUserLocationChange?: (
    location: {
      latitude: number;
      longitude: number;
    } | null
  ) => void;
  passMapRef?: (mapInstance: MapInterface) => void;
  onLocationError?: (error: string | null) => void;
}

declare const MapComponent: React.FC<MapComponentProps>;

export default MapComponent;
export type { MapInterface, MapComponentProps };
