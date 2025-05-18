import { z } from "zod";
export interface Location {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    id?: string;
}
export declare const formSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    pickupDate: z.ZodString;
    pickupTime: z.ZodString;
    preferredVehicle: z.ZodOptional<z.ZodString>;
    passengers: z.ZodString;
    luggage: z.ZodOptional<z.ZodString>;
    handLuggage: z.ZodOptional<z.ZodString>;
    specialRequests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    passengers: string;
    fullName: string;
    email: string;
    phone: string;
    pickupDate: string;
    pickupTime: string;
    handLuggage?: string | undefined;
    luggage?: string | undefined;
    specialRequests?: string | undefined;
    preferredVehicle?: string | undefined;
}, {
    passengers: string;
    fullName: string;
    email: string;
    phone: string;
    pickupDate: string;
    pickupTime: string;
    handLuggage?: string | undefined;
    luggage?: string | undefined;
    specialRequests?: string | undefined;
    preferredVehicle?: string | undefined;
}>;
export type FormData = z.infer<typeof formSchema>;
