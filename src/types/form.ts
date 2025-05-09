import { z } from "zod";

// Define location type
export interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  id?: string; // Optional unique identifier
}

// Define form schema with validation
export const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  // For locations, we won't validate in the schema as they're handled separately
  preferredVehicle: z.string().optional(),
  passengers: z.string().min(1, "Number of passengers is required"),
  luggage: z.string().optional(),
  handLuggage: z.string().optional(),
  specialRequests: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
