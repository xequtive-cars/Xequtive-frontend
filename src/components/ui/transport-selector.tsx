import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Predefined lists as fallback
const AIRLINES = [
  "British Airways",
  "EasyJet",
  "Ryanair",
  "Jet2",
  "TUI Airways",
  "Virgin Atlantic",
  "Wizz Air",
  "Aer Lingus",
];

interface TransportSelectorProps {
  type: "airline" | "train-operator";
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Define a type for the train operator response
interface TrainOperatorResponse {
  operators: Array<{ name: string }>;
}

export function TransportSelector({
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
}: TransportSelectorProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Use predefined list for airlines
    if (type === "airline") {
      setOptions(AIRLINES);
      return;
    }

    // For train operators, we'll use a more dynamic approach
    const fetchTrainOperators = async () => {
      try {
        // Construct headers manually
        const headers = new Headers();
        if (process.env.NEXT_PUBLIC_TRANSPORT_API_APP_ID) {
          headers.append(
            "X-App-Id",
            process.env.NEXT_PUBLIC_TRANSPORT_API_APP_ID
          );
        }
        if (process.env.NEXT_PUBLIC_TRANSPORT_API_APP_KEY) {
          headers.append(
            "X-App-Key",
            process.env.NEXT_PUBLIC_TRANSPORT_API_APP_KEY
          );
        }

        const response = await fetch(
          "https://api.transportapi.com/v3/uk/train/operators.json",
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch train operators");
        }

        const data: TrainOperatorResponse = await response.json();
        // Extract operator names
        setOptions(data.operators.map((op) => op.name));
      } catch (error) {
        console.error("Error fetching train operators:", error);
        // Fallback to predefined list if API fails
        setOptions([
          "Great Western Railway",
          "Avanti West Coast",
          "TransPennine Express",
          "LNER",
          "CrossCountry",
          "South Western Railway",
          "Southeastern",
          "Northern",
          "Chiltern Railways",
        ]);
      }
    };

    fetchTrainOperators();
  }, [type]);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>{type === "airline" ? "Airline" : "Train Operator"}</Label>
      <div className="relative">
        <Input
          placeholder={
            placeholder ||
            `Search ${type === "airline" ? "Airlines" : "Train Operators"}`
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
          disabled={disabled}
        />
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                placeholder ||
                `Select ${type === "airline" ? "Airline" : "Train Operator"}`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">
                No {type === "airline" ? "airlines" : "train operators"} found
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
