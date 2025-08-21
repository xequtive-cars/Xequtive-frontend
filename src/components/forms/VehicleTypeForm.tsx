import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FormData } from "@/types/form";

export default function VehicleTypeForm() {
  const form = useFormContext<FormData>();

  return (
    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
      <h3 className="text-base font-medium">Vehicle Type</h3>
      <FormField
        control={form.control}
        name="preferredVehicle"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm">Select Vehicle Type</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 border-2">
                  <span>{field.value || "Select a vehicle type"}</span>
                </SelectTrigger>
                <SelectContent className="max-w-md w-[320px]">
                  <SelectItem
                    value="Standard Saloon"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">Standard Saloon</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Comfortable sedan for up to 4 passengers, 2 luggage
                        pieces, and 2 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="Estate"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">Estate</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Spacious estate car for up to 4 passengers, 4 luggage
                        pieces, and 4 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="MPV-6"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">MPV-6</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Large MPV for up to 6 passengers, 4 luggage
                        pieces, and 4 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="MPV-8"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">MPV-8</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Extra large MPV for up to 8 passengers, 8 luggage
                        pieces, and 8 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="Executive Saloon"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">Executive Saloon</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Premium sedan for up to 4 passengers, 2 luggage pieces,
                        and 2 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="Executive MPV"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">Executive MPV</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Spacious executive vehicle for up to 8 passengers, 8 luggage
                        pieces, and 8 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="VIP Saloon"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">VIP Saloon</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        High-end luxury saloon for up to 3 passengers, 2
                        luggage pieces, and 2 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="VIP MPV/SUV"
                    className="focus:bg-accent py-6"
                  >
                    <div className="flex flex-col space-y-4">
                      <span className="font-medium">VIP MPV/SUV</span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        Premium VIP vehicle for up to 6 passengers, 6 luggage
                        pieces, and 6 hand luggage items.
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
