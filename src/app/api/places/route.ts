import { NextResponse } from 'next/server';

// Utility function to log only in development
const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Interface for Google Places API response
interface GooglePlace {
  id: string;
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  types?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface GooglePlacesResponse {
  places?: GooglePlace[];
}

// Function to fetch places from Google Places API with UK restrictions
async function fetchPlacesFromGoogle(
  query: string,
  apiKey: string,
  placeType?: string
): Promise<GooglePlace[]> {
  try {
    const requestBody: any = {
      textQuery: query,
      languageCode: 'en',
      regionCode: 'GB', // UK region code
      maxResultCount: 20,
      locationRestriction: {
        rectangle: {
          low: { latitude: 49.9, longitude: -8.2 }, // Southwest corner of UK
          high: { latitude: 60.9, longitude: 1.8 }  // Northeast corner of UK
        }
      }
    };

    // Add type filtering if specified
    if (placeType) {
      requestBody.includedType = placeType;
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.id,places.types,places.formattedAddress,places.location'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      devLog(`Google Places API Error: ${response.status} - ${errorText}`);
      return [];
    }

    const data: GooglePlacesResponse = await response.json();
    return data.places || [];
  } catch (error) {
    devLog('Error fetching from Google Places API:', error);
    return [];
  }
}

// Function to fetch popular locations from Google Places API
async function fetchPopularLocations(apiKey: string) {
    try {
    devLog('Fetching popular locations from Google Places API...');
    
    // Fetch popular UK locations with more comprehensive list
      const popularQueries = [
      'London Eye London UK',
      'Tower Bridge London UK',
      'Big Ben London UK',
      'Buckingham Palace London UK',
      'Westminster Abbey London UK',
      'Canary Wharf London UK',
      'Oxford Street London UK',
      'Covent Garden London UK',
      'King\'s Cross Station London UK',
      'Paddington Station London UK',
        'Liverpool Street Station London UK',
      'Victoria Station London UK',
      'Waterloo Station London UK',
      'The Shard London UK',
      'Hyde Park London UK',
      'Greenwich London UK',
      'Camden Market London UK',
      'Borough Market London UK',
      'Shoreditch London UK',
      'Notting Hill London UK'
    ];

    const popularPlaces: GooglePlace[] = [];
    
    for (const query of popularQueries) {
      const places = await fetchPlacesFromGoogle(query, apiKey);
      if (places.length > 0) {
        popularPlaces.push(places[0]); // Take first result
      }
    }

    return popularPlaces.slice(0, 12); // Increased to 12 popular locations
        } catch (error) {
    devLog('Error fetching popular locations:', error);
    return [];
  }
}

// Function to fetch terminal/platform information for airports and train stations
async function fetchTerminalInfo(placeId: string, placeType: string, apiKey: string) {
  try {
    // For airports, fetch terminal information
    if (placeType === 'airport') {
      // Common terminals for major UK airports
      const commonTerminals = [
        { id: 'T1', name: 'Terminal 1', type: 'terminal' },
        { id: 'T2', name: 'Terminal 2', type: 'terminal' },
        { id: 'T3', name: 'Terminal 3', type: 'terminal' },
        { id: 'T4', name: 'Terminal 4', type: 'terminal' },
        { id: 'T5', name: 'Terminal 5', type: 'terminal' }
      ];
      return commonTerminals.slice(0, 3); // Return first 3 terminals
    }
    
    // For train stations, fetch platform information
    if (placeType === 'train_station') {
      // Common platforms for major train stations
      const commonPlatforms = [
        { id: 'P1', name: 'Platform 1', type: 'platform' },
        { id: 'P2', name: 'Platform 2', type: 'platform' },
        { id: 'P3', name: 'Platform 3', type: 'platform' },
        { id: 'P4', name: 'Platform 4', type: 'platform' },
        { id: 'P5', name: 'Platform 5', type: 'platform' }
      ];
      return commonPlatforms.slice(0, 4); // Return first 4 platforms
    }
    
    return [];
    } catch (error) {
    devLog('Error fetching terminal info:', error);
    return [];
  }
}

// Function to convert Google Place to our format
function convertGooglePlaceToSuggestion(place: GooglePlace, index: number) {
  return {
    id: place.id || `place-${index}`,
    address: place.formattedAddress || place.displayName?.text || 'Unknown Location',
    mainText: place.displayName?.text || 'Unknown Location',
    secondaryText: place.formattedAddress || '',
    name: place.displayName?.text || 'Unknown Location',
    latitude: place.location?.latitude || 0,
    longitude: place.location?.longitude || 0,
    coordinates: {
      lat: place.location?.latitude || 0,
      lng: place.location?.longitude || 0
    },
    metadata: {
      primaryType: place.types?.[0] || 'establishment',
      placeId: place.id,
      region: 'UK',
      category: place.types?.[0] || 'establishment'
    }
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input')?.trim() || '';
  const sessionToken = searchParams.get('sessionToken');
  const category = searchParams.get('category'); // 'airport' or 'train_station'
  const fetchPopular = searchParams.get('popular') === 'true';
  const placeId = searchParams.get('placeId'); // For fetching terminal info
  const fetchTerminals = searchParams.get('terminals') === 'true';

  const googlePlacesApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!googlePlacesApiKey) {
    return NextResponse.json({ 
      suggestions: [], 
      error: 'Missing Google Places API key' 
    }, { status: 500 });
  }

  try {
    // Handle terminal/platform information request
    if (fetchTerminals && placeId && category) {
      devLog(`Fetching terminal info for ${category} with placeId: ${placeId}`);
      
      const terminals = await fetchTerminalInfo(placeId, category, googlePlacesApiKey);
      
      devLog(`Found ${terminals.length} terminals/platforms`);
        return NextResponse.json({
        success: true,
        terminals,
        placeId,
        category 
      });
    }

    // Handle category-specific requests (airports or train stations)
    if (category) {
      devLog(`Fetching ${category} locations from Google Places API...`);
      
      let query = '';
      let placeType = '';
      
      if (category === 'airport') {
        query = 'airports in UK';
        placeType = 'airport';
      } else if (category === 'train_station') {
        query = 'train stations in London UK';
        placeType = 'train_station';
      }

      const places = await fetchPlacesFromGoogle(query, googlePlacesApiKey, placeType);
      const suggestions = places.map(convertGooglePlaceToSuggestion);

      devLog(`Found ${suggestions.length} ${category} locations`);
        return NextResponse.json({
          success: true,
        suggestions,
        category 
        });
      }

    // Handle popular locations request
    if (fetchPopular) {
      devLog('Fetching popular locations...');
      const places = await fetchPopularLocations(googlePlacesApiKey);
      const suggestions = places.map(convertGooglePlaceToSuggestion);

      devLog(`Found ${suggestions.length} popular locations`);
        return NextResponse.json({
        success: true,
        suggestions 
      });
      }

    // Handle text search with UK restrictions
    if (input) {
      devLog(`Searching for: "${input}" with UK restrictions`);
      
      const places = await fetchPlacesFromGoogle(input, googlePlacesApiKey);
      const suggestions = places.map(convertGooglePlaceToSuggestion);

      devLog(`Found ${suggestions.length} suggestions for: "${input}"`);
      return NextResponse.json({
        success: true,
        suggestions 
      });
    }

    // Default response - return empty suggestions
    return NextResponse.json({ 
      success: true,
      suggestions: [] 
      });

    } catch (error) {
    devLog('Unexpected error in Places API:', error);
      return NextResponse.json({
        success: false,
      suggestions: [],
      error: 'Error processing places request' 
      }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 