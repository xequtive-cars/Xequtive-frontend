interface LocationInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onLocationSelect: (location: {
        address: string;
        longitude: number;
        latitude: number;
    }) => void;
    className?: string;
}
export declare function LocationInput({ placeholder, value, onChange, onLocationSelect, className, }: LocationInputProps): import("react").JSX.Element;
export {};
