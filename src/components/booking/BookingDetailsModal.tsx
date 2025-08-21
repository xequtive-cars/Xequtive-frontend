import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CarIcon,
  InfoIcon,
  DollarSign,
  Navigation,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "../ui/badge";

interface Journey {
  distance_miles: number;
  duration_minutes: number;
}

// Status color mapping based on documentation
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "confirmed":
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "assigned":
    case "in_progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "cancelled":
    case "declined":
    case "no_show":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

// Status text mapping based on documentation
const getStatusText = (status: string) => {
  const displayMap: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    declined: "Declined",
    no_show: "No Show",
  };

  return displayMap[status] || status;
};

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    referenceNumber?: string;
    customer: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    bookingType: 'one-way' | 'hourly' | 'return';
    status: string;
    pickupDate: string;
    pickupTime: string;
    locations: {
      pickup: {
        address: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      };
      dropoff?: {
        address: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      };
      additionalStops: Array<{
        address: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      }>;
    };
    vehicle: {
      id: string;
      name: string;
      price: {
        amount: number;
        currency: string;
      };
    };
    journey?: Journey;
    hours?: number;
    returnType?: 'wait-and-return' | 'later-date';
    returnDate?: string;
    returnTime?: string;
    passengers: {
      count: number;
      checkedLuggage: number;
      handLuggage: number;
      mediumLuggage: number;
      babySeat: number;
      childSeat: number;
      boosterSeat: number;
      wheelchair: number;
    };
    specialRequests?: string;
    additionalStops: Array<{
      address: string;
    }>;
    waitingTime: number;
    travelInformation?: any;
    createdAt: string;
    updatedAt: string;
  } | null;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  open,
  onOpenChange,
  booking,
}) => {
  if (!booking) return null;

  const {
    id,
    referenceNumber,
    customer,
    bookingType,
    status,
    pickupDate,
    pickupTime,
    locations,
    vehicle,
    hours,
    returnType,
    returnDate,
    returnTime,
    journey,
    createdAt,
  } = booking;

  const formattedDate = pickupDate
    ? format(parseISO(`${pickupDate}T00:00:00`), "PP")
    : "N/A";

  const formattedCreatedDate = createdAt
    ? format(new Date(createdAt), "PP 'at' p")
    : "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-start gap-2 pr-8">
            <div className="flex justify-between items-center w-full">
            <span>Booking Details</span>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`font-normal ${getStatusColor(status)}`}>
                {getStatusText(status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {bookingType === 'hourly' ? 'Hourly Service' : 
                 bookingType === 'return' ? 'Return Trip' : 'One-Way Trip'}
              </Badge>
            </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            {referenceNumber ? (
              <>Reference: <span className="font-mono">{referenceNumber}</span></>
            ) : (
              <>Booking ID: {id.substring(0, 8).toUpperCase()}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Datetime Section */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Pickup Time</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" />
                <span>{pickupTime}</span>
              </div>
            </div>
          </div>

          {/* Locations Section */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Journey</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Pickup Location</div>
                  <div className="text-sm text-muted-foreground">
                    {locations.pickup.address}
                  </div>
                </div>
              </div>

              {locations.dropoff && (
                <div className="flex gap-2">
                  <MapPinIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Dropoff Location</div>
                    <div className="text-sm text-muted-foreground">
                      {locations.dropoff.address}
                    </div>
                  </div>
                </div>
              )}

              {locations.additionalStops && locations.additionalStops.length > 0 && (
                <div className="flex gap-2">
                  <MapPinIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Additional Stops</div>
                    <div className="text-sm text-muted-foreground">
                      {locations.additionalStops.length} stop
                      {locations.additionalStops.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}

              {journey && (
                <div className="flex gap-2">
                  <Navigation className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Journey Details</div>
                    <div className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-2 text-sm">
                        <CarIcon className="h-4 w-4" />
                        {journey.distance_miles &&
                        typeof journey.distance_miles === "number"
                          ? `${journey.distance_miles.toFixed(1)} miles`
                          : "-- miles"}{" "}
                        • Approximately {journey.duration_minutes} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Type Specific Information */}
          {(hours || returnType) && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Service Details</h3>
              <div className="space-y-3">
                {hours && (
                  <div className="flex gap-2">
                    <ClockIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Service Duration</div>
                      <div className="text-sm text-muted-foreground">
                        {hours} hours
                      </div>
                    </div>
                  </div>
                )}
                
                {returnType && (
                  <div className="flex gap-2">
                    <MapPinIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Return Type</div>
                      <div className="text-sm text-muted-foreground">
                        {returnType === 'wait-and-return' ? 'Wait & Return' : 'Later Date'}
                        {returnDate && returnTime && (
                          <div className="text-xs mt-1">
                            Return: {format(parseISO(returnDate), "MMM dd, yyyy")} at {returnTime}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vehicle Section */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Vehicle</h3>
            <div className="flex gap-2">
              <CarIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Vehicle Type</div>
                <div className="text-sm text-muted-foreground">
                  {vehicle.name}
                </div>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Payment</h3>
            <div className="flex gap-2">
              <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Price</div>
                <div className="text-sm text-muted-foreground">
                  £{vehicle.price.amount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Booking Information</h3>
            <div className="flex gap-2">
              <InfoIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  {formattedCreatedDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>

        {/* WhatsApp Contact Section */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-md p-4">
          <h4 className="font-medium text-slate-800 mb-2">
            Need Urgent Assistance?
          </h4>
          <p className="text-sm text-slate-700">
            For any urgent booking inquiries or support.
          </p>
          <p className="text-sm text-slate-700 mt-2 font-semibold">
            <a
              href="https://wa.me/447831054649"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.90-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.041 1.016-1.041 2.479 1.066 2.876 1.215 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Urgent Bookings: WhatsApp +447831054649
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
