import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CarIcon,
  InfoIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";

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

interface BookingCardProps {
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
    journey: {
      distance_miles: number;
      duration_minutes: number;
    };
    createdAt: string;
  };
  onCancel?: (id: string) => void;
  showCancelButton?: boolean;
  onViewDetails?: (booking: BookingCardProps["booking"]) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  showCancelButton = false,
  onViewDetails,
}) => {
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
  } = booking;

  const formattedDate = pickupDate
    ? format(parseISO(`${pickupDate}T00:00:00`), "PP")
    : "N/A";
  const canBeCancelled =
    ["pending", "confirmed", "assigned"].includes(status) && showCancelButton;

  const handleCancel = () => {
    if (onCancel) {
      onCancel(id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(booking);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{vehicleType}</CardTitle>
          <Badge className={`font-normal ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </Badge>
        </div>
        <CardDescription>
          <div className="flex items-center gap-1 mt-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{formattedDate}</span>
            <span className="mx-1">•</span>
            <ClockIcon className="h-4 w-4" />
            <span>{pickupTime}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Pickup</div>
              <div className="text-sm text-muted-foreground">
                {pickupLocation.address}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <MapPinIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Dropoff</div>
              <div className="text-sm text-muted-foreground">
                {dropoffLocation.address}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <CarIcon className="h-4 w-4" />
              <span className="text-sm">
                {journey.distance_miles &&
                typeof journey.distance_miles === "number"
                  ? `${journey.distance_miles.toFixed(1)} miles`
                  : "-- miles"}{" "}
                • {journey.duration_minutes} min
              </span>
            </div>
            <div className="font-semibold">£{price.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-1"
          onClick={handleViewDetails}
        >
          <InfoIcon className="h-4 w-4" />
          <span>View Details</span>
        </Button>

        {canBeCancelled && (
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full"
            onClick={handleCancel}
          >
            Cancel Booking
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
