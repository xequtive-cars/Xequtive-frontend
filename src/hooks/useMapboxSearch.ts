import { useState, useCallback, useEffect } from 'react';

export interface SearchResult {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  type?: 'current_location' | 'recent' | 'popular' | 'location' | 'category' | 'airport' | 'train_station';
}

export function useMapboxSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded default suggestions as fallback
  const defaultSuggestions: SearchResult[] = [
    {
      id: 'current_location',
      text: 'Use Current Location',
      place_name: 'Get my exact location',
      center: [0, 0],
      type: 'current_location'
    },
    {
      id: 'heathrow_airport',
      text: 'Heathrow Airport (LHR)',
      place_name: 'Terminal 2, 3, 4, 5 - London',
      center: [51.4700, -0.4543],
      type: 'airport'
    },
    {
      id: 'gatwick_airport',
      text: 'Gatwick Airport (LGW)',
      place_name: 'North and South Terminals - London',
      center: [51.1537, -0.1821],
      type: 'airport'
    },
    {
      id: 'kings_cross_station',
      text: 'King\'s Cross Station',
      place_name: 'Central London - Multiple Lines',
      center: [51.5302, -0.1229],
      type: 'train_station'
    }
  ];

  // Fetch popular locations with extensive error handling
  const fetchPopularLocations = useCallback(async (): Promise<SearchResult[]> => {
    try {

      const response = await fetch('/api/places?popular=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'  // Disable caching to ensure fresh data
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();

      if (!data.suggestions || data.suggestions.length === 0) {
        console.warn('No suggestions returned, using default');
        return defaultSuggestions;
      }

      const formattedResults: SearchResult[] = data.suggestions.map((suggestion: any) => ({
        id: suggestion.id || `popular-${Math.random().toString(36).substr(2, 9)}`,
        text: suggestion.mainText || suggestion.name || 'Unknown Location',
        place_name: suggestion.address || 'No address available',
        center: suggestion.coordinates || [0, 0],
        type: suggestion.metadata?.primaryType || 'location'
      }));


      return formattedResults.length > 0 ? formattedResults : defaultSuggestions;
    } catch (err) {
      console.error('❌ Popular Locations Fetch Error:', err);
      return defaultSuggestions;
    }
  }, []);

  const searchLocations = useCallback(async (query: string) => {

    // If query is empty, fetch popular locations
    if (!query || query.trim().length === 0) {
      const popularLocations = await fetchPopularLocations();
      setSearchResults(popularLocations);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
      const response = await fetch(`/api/places?input=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });


        if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
      // Process search results

      if (!data.suggestions || data.suggestions.length === 0) {
        console.warn('No search results, fetching popular locations');
        const popularLocations = await fetchPopularLocations();
        setSearchResults(popularLocations);
        return;
      }

      const formattedResults: SearchResult[] = data.suggestions.map((suggestion: any) => ({
        id: suggestion.id || `suggestion-${Math.random().toString(36).substr(2, 9)}`,
        text: suggestion.mainText || 'Unknown Location',
        place_name: suggestion.address || 'No address available',
        center: [0, 0],
        type: suggestion.metadata?.primaryType || 'location'
      }));

      // Combine with default suggestions
      const combinedResults = [
        ...defaultSuggestions,
        ...formattedResults
      ];

      setSearchResults(combinedResults);
      } catch (err) {
      console.error('❌ Search Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to popular locations
      const popularLocations = await fetchPopularLocations();
      setSearchResults(popularLocations);
      } finally {
        setIsLoading(false);
      }
  }, [fetchPopularLocations]);

  // Debounce search to reduce unnecessary API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        // Show popular locations when query is empty
        fetchPopularLocations().then(popularLocations => {
          setSearchResults(popularLocations);
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations, fetchPopularLocations]);

  // Force popular locations on initial render
  useEffect(() => {
    fetchPopularLocations().then(popularLocations => {
      setSearchResults(popularLocations);
    });
  }, [fetchPopularLocations]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    clearResults
  };
}
