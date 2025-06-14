"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        clearResults();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearResults]);

  const handleResultClick = (result: SearchResult) => {
    onChange(result.place_name);
    setSearchQuery(result.place_name);
    clearResults();
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`w-full h-12 px-4 pr-10 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${className}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isFocused && searchResults.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-2 text-left hover:bg-muted focus:outline-none focus:bg-muted"
            >
              <div className="text-sm font-medium">{result.text}</div>
              <div className="text-xs text-muted-foreground">
                {result.place_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute z-50 w-full mt-1 p-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
