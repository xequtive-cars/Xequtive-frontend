interface SearchResult {
    id: string;
    text: string;
    place_name: string;
    center: [number, number];
}
export declare function useMapboxSearch(): {
    searchQuery: string;
    setSearchQuery: import("react").Dispatch<import("react").SetStateAction<string>>;
    searchResults: SearchResult[];
    isLoading: boolean;
    error: string | null;
    clearResults: () => void;
};
export {};
