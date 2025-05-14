import { useFormContext } from "react-hook-form";
import { FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { FormData } from "@/types/form";

interface CustomTimePickerProps {
  name: "pickupTime";
  label: string;
  placeholder: string;
}

export default function CustomTimePicker({
  name,
  label,
  placeholder,
}: CustomTimePickerProps) {
  const form = useFormContext<FormData>();
  const time = form.watch(name);

  const handleTimeChange = (newTime: string) => {
    form.setValue(name, newTime);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div>
        <FormControl>
          <TimePicker
            time={time}
            onTimeChange={handleTimeChange}
            placeholder={placeholder}
          />
        </FormControl>
      </div>
    </div>
  );
}
