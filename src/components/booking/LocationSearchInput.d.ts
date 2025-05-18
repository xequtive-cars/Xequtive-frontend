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
export declare function LocationSearchInput({ onChange, searchQuery, setSearchQuery, searchResults, isLoading, error, clearResults, placeholder, className, }: LocationSearchInputProps): import("react").JSX.Element;
export {};
