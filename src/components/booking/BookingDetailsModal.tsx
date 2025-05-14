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
    pickupDate: string;
    pickupTime: string;
    pickupLocation: {
      address: string;
    };
    dropoffLocation: {
      address: string;
    };
    vehicleType: string;
    price: number;
    status: string;
    journey: Journey;
    createdAt: string;
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
    pickupDate,
    pickupTime,
    pickupLocation,
    dropoffLocation,
    vehicleType,
    price,
    status,
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
          <DialogTitle className="flex justify-between items-center">
            <span>Booking Details</span>
            <Badge className={`font-normal ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Booking Reference: {id.substring(0, 8).toUpperCase()}
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
                    {pickupLocation.address}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <MapPinIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Dropoff Location</div>
                  <div className="text-sm text-muted-foreground">
                    {dropoffLocation.address}
                  </div>
                </div>
              </div>

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
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Vehicle</h3>
            <div className="flex gap-2">
              <CarIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Vehicle Type</div>
                <div className="text-sm text-muted-foreground">
                  {vehicleType}
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
                  £{price.toFixed(2)}
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
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsModal;
