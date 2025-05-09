import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "@/types/form";

export default function SpecialRequestsForm() {
  const form = useFormContext<FormData>();

  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <FormField
        control={form.control}
        name="specialRequests"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium">
              Special Requests
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any special requirements (e.g., child seat, additional stops, etc.)"
                className="min-h-[250px] text-sm resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
