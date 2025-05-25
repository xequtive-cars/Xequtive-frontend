import { Location } from "@/types/form";

export interface LocationSearchResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type:
    | "airport"
    | "terminal"
    | "station"
    | "postcode"
    | "street"
    | "building"
    | "area"
    | "landmark";
  metadata?: {
    airportCode?: string;
    terminalOptions?: string[];
    postcode?: string;
    city?: string;
    region?: string;
  };
}

// UK major airports with coordinates
const UK_AIRPORTS: LocationSearchResult[] = [
  {
    address: "Heathrow Airport, London",
    coordinates: { lat: 51.4700223, lng: -0.4542955 },
    type: "airport",
    metadata: {
      airportCode: "LHR",
      terminalOptions: ["Terminal 2", "Terminal 3", "Terminal 4", "Terminal 5"],
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Gatwick Airport, London",
    coordinates: { lat: 51.1537, lng: -0.1821 },
    type: "airport",
    metadata: {
      airportCode: "LGW",
      terminalOptions: ["North Terminal", "South Terminal"],
      city: "London",
      region: "West Sussex",
    },
  },
  {
    address: "Manchester Airport",
    coordinates: { lat: 53.3588, lng: -2.2727 },
    type: "airport",
    metadata: {
      airportCode: "MAN",
      terminalOptions: ["Terminal 1", "Terminal 2", "Terminal 3"],
      city: "Manchester",
      region: "Greater Manchester",
    },
  },
  {
    address: "Birmingham Airport",
    coordinates: { lat: 52.4539, lng: -1.7489 },
    type: "airport",
    metadata: {
      airportCode: "BHX",
      terminalOptions: ["Main Terminal"],
      city: "Birmingham",
      region: "West Midlands",
    },
  },
  {
    address: "Edinburgh Airport",
    coordinates: { lat: 55.95, lng: -3.3725 },
    type: "airport",
    metadata: {
      airportCode: "EDI",
      terminalOptions: ["Main Terminal"],
      city: "Edinburgh",
      region: "Scotland",
    },
  },
  {
    address: "Glasgow Airport",
    coordinates: { lat: 55.8652, lng: -4.4332 },
    type: "airport",
    metadata: {
      airportCode: "GLA",
      terminalOptions: ["Main Terminal"],
      city: "Glasgow",
      region: "Scotland",
    },
  },
  {
    address: "Bristol Airport",
    coordinates: { lat: 51.3827, lng: -2.7192 },
    type: "airport",
    metadata: {
      airportCode: "BRS",
      terminalOptions: ["Main Terminal"],
      city: "Bristol",
      region: "South West England",
    },
  },
  {
    address: "Newcastle Airport",
    coordinates: { lat: 55.0374, lng: -1.6912 },
    type: "airport",
    metadata: {
      airportCode: "NCL",
      terminalOptions: ["Main Terminal"],
      city: "Newcastle",
      region: "North East England",
    },
  },
  {
    address: "Liverpool John Lennon Airport",
    coordinates: { lat: 53.3375, lng: -2.8497 },
    type: "airport",
    metadata: {
      airportCode: "LPL",
      terminalOptions: ["Main Terminal"],
      city: "Liverpool",
      region: "North West England",
    },
  },
  {
    address: "London City Airport",
    coordinates: { lat: 51.5048, lng: 0.0495 },
    type: "airport",
    metadata: {
      airportCode: "LCY",
      terminalOptions: ["Main Terminal"],
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "London Stansted Airport",
    coordinates: { lat: 51.886, lng: 0.2389 },
    type: "airport",
    metadata: {
      airportCode: "STN",
      terminalOptions: ["Main Terminal"],
      city: "London",
      region: "Essex",
    },
  },
  {
    address: "London Luton Airport",
    coordinates: { lat: 51.8747, lng: -0.3683 },
    type: "airport",
    metadata: {
      airportCode: "LTN",
      terminalOptions: ["Main Terminal"],
      city: "London",
      region: "Bedfordshire",
    },
  },
];

// UK Major train stations
const UK_STATIONS: LocationSearchResult[] = [
  {
    address: "London King's Cross Station",
    coordinates: { lat: 51.532, lng: -0.1233 },
    type: "station",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "London Euston Station",
    coordinates: { lat: 51.5284, lng: -0.1331 },
    type: "station",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "London Paddington Station",
    coordinates: { lat: 51.5154, lng: -0.1755 },
    type: "station",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "London Liverpool Street Station",
    coordinates: { lat: 51.5179, lng: -0.0803 },
    type: "station",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Manchester Piccadilly Station",
    coordinates: { lat: 53.4774, lng: -2.2309 },
    type: "station",
    metadata: {
      city: "Manchester",
      region: "Greater Manchester",
    },
  },
  {
    address: "Birmingham New Street Station",
    coordinates: { lat: 52.4778, lng: -1.8981 },
    type: "station",
    metadata: {
      city: "Birmingham",
      region: "West Midlands",
    },
  },
];

// UK popular landmarks
const UK_LANDMARKS: LocationSearchResult[] = [
  {
    address: "Buckingham Palace, London",
    coordinates: { lat: 51.5014, lng: -0.1419 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Houses of Parliament, London",
    coordinates: { lat: 51.4995, lng: -0.1248 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "The Shard, London",
    coordinates: { lat: 51.5045, lng: -0.0865 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Old Trafford, Manchester",
    coordinates: { lat: 53.4631, lng: -2.2913 },
    type: "landmark",
    metadata: {
      city: "Manchester",
      region: "Greater Manchester",
    },
  },
];

// UK popular London locations
const LONDON_LANDMARKS: LocationSearchResult[] = [
  {
    address: "Buckingham Palace, London",
    coordinates: { lat: 51.5014, lng: -0.1419 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Houses of Parliament, London",
    coordinates: { lat: 51.4995, lng: -0.1248 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "The Shard, London",
    coordinates: { lat: 51.5045, lng: -0.0865 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Tower of London",
    coordinates: { lat: 51.5081, lng: -0.0759 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "British Museum, London",
    coordinates: { lat: 51.5194, lng: -0.1269 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "London Eye",
    coordinates: { lat: 51.5033, lng: -0.1195 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Natural History Museum, London",
    coordinates: { lat: 51.4967, lng: -0.1764 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Piccadilly Circus, London",
    coordinates: { lat: 51.5099, lng: -0.1349 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Trafalgar Square, London",
    coordinates: { lat: 51.508, lng: -0.128 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Wembley Stadium, London",
    coordinates: { lat: 51.556, lng: -0.2795 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "O2 Arena, London",
    coordinates: { lat: 51.503, lng: 0.0032 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "Canary Wharf, London",
    coordinates: { lat: 51.5054, lng: -0.0235 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
  {
    address: "ExCeL London",
    coordinates: { lat: 51.5082, lng: 0.0293 },
    type: "landmark",
    metadata: {
      city: "London",
      region: "Greater London",
    },
  },
];

// Create combined dataset
const combinedLocations = [
  ...UK_AIRPORTS,
  ...UK_STATIONS,
  ...UK_LANDMARKS,
  ...LONDON_LANDMARKS,
];

class LocationSearchService {
  // Search for locations based on query
  async searchLocations(
    query: string,
    type?: "pickup" | "dropoff" | "stop",
    userLocation?: { latitude: number; longitude: number } | null
  ): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length === 0) {
      // If no query, return suggested locations based on type
      return this.getSuggestedLocations(type, userLocation);
    }

    // Normalize the query for search
    const normalizedQuery = query.toLowerCase().trim();

    // Filter the locations based on the query
    const results = combinedLocations.filter((location) => {
      // Check if the query matches parts of the address
      return (
        location.address.toLowerCase().includes(normalizedQuery) ||
        location.metadata?.airportCode
          ?.toLowerCase()
          .includes(normalizedQuery) ||
        location.metadata?.city?.toLowerCase().includes(normalizedQuery) ||
        location.metadata?.region?.toLowerCase().includes(normalizedQuery)
      );
    });

    // Sort results - prioritize exact matches at the beginning
    results.sort((a, b) => {
      const aStartsWith = a.address.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.address.toLowerCase().startsWith(normalizedQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // If user location is provided, sort by proximity
      if (userLocation) {
        const aDistance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.coordinates.lat,
          a.coordinates.lng
        );

        const bDistance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.coordinates.lat,
          b.coordinates.lng
        );

        return aDistance - bDistance;
      }

      return 0;
    });

    // In the future, we would integrate with a real geocoding API like Google Places,
    // but for now we're using our predefined dataset

    return results;
  }

  // Get default suggested locations based on location type
  getSuggestedLocations(
    type?: "pickup" | "dropoff" | "stop",
    userLocation?: { latitude: number; longitude: number } | null
  ): LocationSearchResult[] {
    // If user location is available, create a current location suggestion
    const suggestions: LocationSearchResult[] = [];

    if (userLocation) {
      suggestions.push({
        address: "Current Location",
        coordinates: {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        },
        type: "landmark",
        metadata: {
          city: "Current Location",
        },
      });
    }

    // Sort locations by proximity if user location is available
    const sortedLocations = [...combinedLocations];
    if (userLocation) {
      sortedLocations.sort((a, b) => {
        const aDistance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.coordinates.lat,
          a.coordinates.lng
        );

        const bDistance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.coordinates.lat,
          b.coordinates.lng
        );

        return aDistance - bDistance;
      });
    }

    // Different suggestions for different location types
    const airportResults = sortedLocations
      .filter((loc) => loc.type === "airport")
      .slice(0, 8);
    const stationResults = sortedLocations
      .filter((loc) => loc.type === "station")
      .slice(0, 5);
    const landmarkResults = sortedLocations
      .filter((loc) => loc.type === "landmark")
      .slice(0, 7);

    switch (type) {
      case "pickup":
        // For pickup, prioritize airports and stations
        return [
          ...suggestions,
          ...airportResults,
          ...stationResults,
          ...landmarkResults,
        ];

      case "dropoff":
        // For dropoff, similar to pickup but may prioritize differently
        return [
          ...suggestions,
          ...airportResults,
          ...stationResults,
          ...landmarkResults,
        ];

      case "stop":
        // For stops, prioritize landmarks and general areas
        return [
          ...suggestions,
          ...landmarkResults,
          ...stationResults,
          ...airportResults.slice(0, 4),
        ];

      default:
        // Default suggestions
        return [...suggestions, ...sortedLocations.slice(0, 20)];
    }
  }

  // Calculate distance between two coordinates using the Haversine formula
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  // Convert degrees to radians
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get airport terminals for a specific airport
  getAirportTerminals(airportCode: string): string[] {
    const airport = UK_AIRPORTS.find(
      (a) => a.metadata?.airportCode === airportCode
    );
    return airport?.metadata?.terminalOptions || [];
  }

  // Format the location for display
  formatLocationForDisplay(result: LocationSearchResult): string {
    if (result.type === "airport" && result.metadata?.airportCode) {
      return `${result.address} (${result.metadata.airportCode})`;
    }
    return result.address;
  }

  // Convert a search result to a simpler Location object for the map
  toMapLocation(result: LocationSearchResult): Location {
    return {
      address: result.address,
      coordinates: {
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
      },
    };
  }
}

export const locationSearchService = new LocationSearchService();
