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
  EditIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";

// Status color mapping - using dark maroon for all statuses
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    case "confirmed":
    case "completed":
      return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    case "assigned":
    case "in_progress":
      return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    case "cancelled":
    case "declined":
    case "no_show":
      return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    default:
      return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
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
    journey?: {
      distance_miles: number;
      duration_minutes: number;
    };
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
  };
  onCancel?: (id: string) => void;
  showCancelButton?: boolean;
  onEdit?: (booking: BookingCardProps["booking"]) => void;
  showEditButton?: boolean;
  onViewDetails?: (booking: BookingCardProps["booking"]) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  showCancelButton = false,
  onEdit,
  showEditButton = false,
  onViewDetails,
}) => {
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
  } = booking;

  const formattedDate = pickupDate
    ? format(parseISO(`${pickupDate}T00:00:00`), "PP")
    : "N/A";
  const canBeCancelled =
    ["pending", "confirmed", "assigned"].includes(status) && showCancelButton;
  
  // Edit button should only be shown for pending and confirmed bookings (before they're assigned)
  const canBeEdited =
    ["pending", "confirmed"].includes(status) && showEditButton;

  const handleCancel = () => {
    if (onCancel) {
      onCancel(id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(booking);
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
          <div>
            <CardTitle className="text-lg font-semibold">{vehicle.name}</CardTitle>
            {referenceNumber && (
              <p className="text-sm text-muted-foreground font-mono">
                Ref: {referenceNumber}
              </p>
            )}
          </div>
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
        <CardDescription>
          <div className="flex items-center gap-1 mt-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{formattedDate}</span>
            <span className="mx-1">•</span>
            <ClockIcon className="h-4 w-4" />
            <span>{pickupTime}</span>
            {hours && (
              <>
                <span className="mx-1">•</span>
                <span className="text-sm font-medium">{hours}h service</span>
              </>
            )}
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
                {locations.pickup.address}
              </div>
            </div>
          </div>

          {locations.dropoff && (
            <div className="flex gap-2">
              <MapPinIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Dropoff</div>
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

          {bookingType === 'return' && returnType && (
            <div className="flex gap-2">
              <MapPinIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Return Type</div>
                <div className="text-sm text-muted-foreground">
                  {returnType === 'wait-and-return' ? 'Wait & Return' : 'Later Date'}
                  {returnDate && returnTime && (
                    <div className="text-xs mt-1">
                      Return: {format(parseISO(returnDate), "MMM dd")} at {returnTime}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <CarIcon className="h-4 w-4" />
              <span className="text-sm">
                {journey ? (
                  <>
                    {journey.distance_miles &&
                    typeof journey.distance_miles === "number"
                      ? `${journey.distance_miles.toFixed(1)} miles`
                      : "-- miles"}{" "}
                    • {journey.duration_minutes} min
                  </>
                ) : (
                  "Journey details not available"
                )}
              </span>
            </div>
            <div className="font-semibold notranslate">£{vehicle.price.amount.toFixed(2)}</div>
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

        {/* {canBeEdited && (
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/20 w-full flex items-center justify-center gap-1"
            onClick={handleEdit}
          >
            <EditIcon className="h-4 w-4" />
            <span>Edit Booking</span>
          </Button>
        )} */}

        {canBeCancelled && (
          <Button
            variant="destructive"
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive/20 w-full"
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
