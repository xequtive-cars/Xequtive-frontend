import { Location } from "@/types/form";
interface AdditionalStopsFormProps {
    additionalStops: Location[];
    setAdditionalStops: React.Dispatch<React.SetStateAction<Location[]>>;
    handleAddStop: () => void;
    handleRemoveStop: (index: number) => void;
}
export default function AdditionalStopsForm({ additionalStops, setAdditionalStops, handleAddStop, handleRemoveStop, }: AdditionalStopsFormProps): import("react").JSX.Element;
export {};
