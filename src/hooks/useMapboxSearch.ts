import { useState, useEffect } from "react";

interface SearchResult {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
}

export function useMapboxSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchLocations = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchQuery
          )}.json?access_token=${
            process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          }&types=address,place,locality,neighborhood&limit=5`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();
        setSearchResults(data.features);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const clearResults = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    clearResults,
  };
}
