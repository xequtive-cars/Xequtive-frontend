"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, MapPin, Navigation, Clock, Plane, Train, MapPinned } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

interface SearchResult {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  type?: 'current_location' | 'recent' | 'popular' | 'location' | 'category' | 'airport' | 'train_station';
}

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  clearResults: () => void;
  placeholder: string;
  className?: string;
}

export function LocationSearchInput({
  onChange,
  searchQuery,
  setSearchQuery,
  searchResults,
  isLoading,
  error,
  clearResults,
  placeholder,
  className = "",
}: LocationSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { getCurrentLocation } = useGeolocation();

  // Debug logging
  useEffect(() => {
    console.group('🔍 LocationSearchInput State');
    console.log('Search Query:', searchQuery);
    console.log('Search Results:', searchResults);
    console.log('Is Focused:', isFocused);
    console.groupEnd();
  }, [searchQuery, searchResults, isFocused]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setTimeout(() => {
        clearResults();
          setIsFocused(false);
        }, 200);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearResults]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'current_location') {
      getCurrentLocation().then((location) => {
        if (location) {
          onChange(`${location.latitude}, ${location.longitude}`);
          setSearchQuery(`Current Location (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`);
        }
      });
    } else {
    onChange(result.place_name);
    setSearchQuery(result.place_name);
    }
    clearResults();
    setIsFocused(false);
  };

  // Function to get icon based on result type
  const getResultIcon = (type?: SearchResult['type']) => {
    switch (type) {
      case 'current_location':
        return <Navigation size={20} className="text-blue-500" />;
      case 'airport':
        return <Plane size={20} className="text-green-500" />;
      case 'train_station':
        return <Train size={20} className="text-red-500" />;
      case 'category':
        return <MapPinned size={20} className="text-gray-500" />;
      case 'location':
      default:
        return <MapPin size={20} className="text-purple-500" />;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => {
            console.warn('🎯 Input Focused');
            setIsFocused(true);
          }}
          placeholder={placeholder}
          className={`
            w-full h-12 px-4 pr-10 rounded-md border 
            border-input bg-background text-foreground 
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary 
            dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200
            ${className}
          `}
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <MapPin size={20} />
          </div>
        )}
      </div>

      {isFocused && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="
            absolute z-50 w-full mt-1 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-md shadow-lg max-h-[500px] overflow-y-auto
            divide-y divide-gray-100 dark:divide-gray-700
          "
        >
          {searchResults.map((result) => {
            const icon = getResultIcon(result.type);
            const isCategory = result.type === 'category';

            return (
            <button
              key={result.id}
                onClick={() => !isCategory && handleResultClick(result)}
                className={`
                  w-full px-4 py-3 text-left 
                  flex items-center gap-3
                  ${isCategory 
                    ? 'bg-gray-50 dark:bg-gray-900 font-semibold text-muted-foreground cursor-default' 
                    : 'hover:bg-muted focus:outline-none focus:bg-muted dark:hover:bg-gray-700 dark:focus:bg-gray-700 cursor-pointer'}
                `}
                disabled={isCategory}
            >
                <div className="text-muted-foreground">{icon}</div>
                <div>
                  <div className={`
                    text-sm 
                    ${isCategory ? 'text-muted-foreground' : 'font-medium'}
                  `}>
                    {result.text}
                  </div>
                  <div className={`
                    text-xs 
                    ${isCategory 
                      ? 'text-muted-foreground' 
                      : 'text-muted-foreground'}
                  `}>
                {result.place_name}
                  </div>
              </div>
            </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="
          absolute z-50 w-full mt-1 p-2 
          text-sm text-red-500 bg-red-50 
          border border-red-200 rounded-md
          dark:bg-red-900/20 dark:border-red-900/30
        ">
          {error}
        </div>
      )}
    </div>
  );
}
