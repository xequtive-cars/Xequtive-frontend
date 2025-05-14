import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NumberIncrementerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}

export function NumberIncrementer({
  value,
  onChange,
  min = 0,
  max = 8,
  label,
  disabled = false,
}: NumberIncrementerProps) {
  const handleChange = (newValue: number) => {
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm">{label}</span>}
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleChange(value - 1)}
          disabled={disabled || value <= min}
          className="h-8 w-8 rounded-full border-border/50"
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease</span>
        </Button>
        <span className="w-10 text-center text-sm font-medium">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleChange(value + 1)}
          disabled={disabled || value >= max}
          className="h-8 w-8 rounded-full border-border/50"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </div>
  );
}
