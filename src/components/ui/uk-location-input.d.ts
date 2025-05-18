interface UkLocationInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onLocationSelect: (location: {
        address: string;
        longitude: number;
        latitude: number;
    }) => void;
    className?: string;
    showInitialSuggestions?: boolean;
    type?: "pickup" | "dropoff" | "stop";
    initialSuggestionsTitle?: string;
    userLocation?: {
        latitude: number;
        longitude: number;
    } | null;
    disabled?: boolean;
}
export declare function UkLocationInput({ placeholder, value, onChange, onLocationSelect, className, showInitialSuggestions, type, initialSuggestionsTitle, userLocation, disabled, }: UkLocationInputProps): import("react").JSX.Element;
export {};
