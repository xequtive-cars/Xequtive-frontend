import { format } from "date-fns";
import { useFormContext } from "react-hook-form";
import { FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { FormData } from "@/types/form";

interface CustomDatePickerProps {
  name: "pickupDate";
  label: string;
  placeholder: string;
}

export default function CustomDatePicker({
  name,
  label,
  placeholder,
}: CustomDatePickerProps) {
  const form = useFormContext<FormData>();
  const selectedDate = form.watch(name);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      form.setValue(name, formattedDate);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div>
        <FormControl>
          <DatePicker
            date={selectedDate ? new Date(selectedDate) : undefined}
            setDate={handleDateChange}
            placeholder={placeholder}
            disabledDates={(date) => date < new Date()}
          />
        </FormControl>
      </div>
    </div>
  );
}
