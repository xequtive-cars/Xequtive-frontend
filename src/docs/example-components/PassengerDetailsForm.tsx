import React, { useState } from "react";
import { useBooking } from "@/hooks/useBooking";
import { useFormValidation, validationRules } from "@/hooks/useFormValidation";
import { Spinner } from "@/components/ui/spinner";

/**
 * Example component showing how to use both useBooking and useFormValidation hooks
 * for the passenger details step of the booking process
 */
const PassengerDetailsForm: React.FC = () => {
  const { booking, api, createBooking, resetBookingState } = useBooking();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreeToTerms: false,
  });

  // Form validation
  const { errors, isValid, validateField, validateForm } = useFormValidation({
    fullName: [validationRules.required],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.required, validationRules.phone],
    agreeToTerms: [
      (value) => (value ? null : "You must agree to the terms and conditions"),
    ],
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate the field as the user types
    validateField(name, newValue);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    if (validateForm(formData)) {
      // Call the API to create a booking
      createBooking(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
        },
        formData.agreeToTerms
      );
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    // Reset the booking state after confirmation
    resetBookingState();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="specialRequests"
          >
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Terms and Conditions */}
        <div>
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 mr-2"
            />
            <label className="text-sm" htmlFor="agreeToTerms">
              I agree to the terms and conditions
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
          )}
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium text-lg mb-2">Booking Summary</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">From:</span> {booking.pickupAddress}
            </p>
            <p>
              <span className="font-medium">To:</span> {booking.dropoffAddress}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {booking.selectedDate?.toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Time:</span> {booking.selectedTime}
            </p>
            <p>
              <span className="font-medium">Passengers:</span>{" "}
              {booking.passengers}
            </p>
            <p>
              <span className="font-medium">Vehicle:</span>{" "}
              {booking.selectedVehicle?.name}
            </p>
            <p>
              <span className="font-medium">Total Price:</span> £
              {booking.selectedVehicle?.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || api.isFetching}
          className={`w-full p-3 rounded text-white text-center ${
            !isValid || api.isFetching
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {api.isFetching ? (
            <div className="flex items-center justify-center">
              <Spinner size="sm" className="text-white" />
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            "Complete Booking"
          )}
        </button>
      </form>

      {/* Booking Success */}
      {api.success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              Booking Confirmed!
            </h3>
            <p className="mb-4">
              Your booking has been confirmed. Your booking reference is{" "}
              <span className="font-bold">{api.bookingId}</span>.
            </p>
            <p className="mb-6 text-sm text-gray-600">
              A confirmation email has been sent to {formData.email}
            </p>
            <button
              onClick={handleConfirmBooking}
              className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDetailsForm;
