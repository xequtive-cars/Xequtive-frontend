# Redux Hooks Usage Guide

This document provides examples of how to use the custom hooks for working with the Redux state in the application.

## useBooking Hook

The `useBooking` hook provides a simplified interface to work with the booking state and related actions. It's designed to reduce boilerplate code and make components cleaner.

### Example Usage

```tsx
import { useBooking } from "@/hooks/useBooking";
import { Location } from "@/components/map/MapComponent";

function BookingLocationForm() {
  const {
    booking,
    ui,
    api,
    setPickupLocation,
    setDropoffLocation,
    addAdditionalStop,
    removeAdditionalStop,
    goToPassengerSelection,
  } = useBooking();

  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
  };

  const handleDropoffSelect = (location: Location) => {
    setDropoffLocation(location);
  };

  const handleContinue = () => {
    goToPassengerSelection();
  };

  return (
    <div>
      {/* Form elements */}
      <button
        disabled={!booking.pickupLocation || !booking.dropoffLocation}
        onClick={handleContinue}
      >
        Continue
      </button>
      {/* Show loading state */}
      {api.isFetching && <span>Loading...</span>}
    </div>
  );
}
```

## useFormValidation Hook

The `useFormValidation` hook provides a way to validate form inputs based on predefined rules.

### Example Usage

```tsx
import { useFormValidation, validationRules } from "@/hooks/useFormValidation";
import { useState } from "react";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Define validation rules for each field
  const { errors, isValid, validateField, validateForm } = useFormValidation({
    name: [validationRules.required],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    message: [validationRules.required, validationRules.minLength(10)],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field on change
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate entire form before submission
    if (validateForm(formData)) {
      // Form is valid, proceed with submission
      console.log("Form submitted:", formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && <p className="error">{errors.message}</p>}
      </div>

      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}
```

## Combining Both Hooks

For booking forms that require validation, you can combine both hooks:

```tsx
import { useBooking } from "@/hooks/useBooking";
import { useFormValidation, validationRules } from "@/hooks/useFormValidation";

function PersonalDetailsBookingForm() {
  const { booking, createBooking } = useBooking();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreeToTerms: false,
  });

  const { errors, isValid, validateField, validateForm } = useFormValidation({
    fullName: [validationRules.required],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.required, validationRules.phone],
    agreeToTerms: [(value) => (value ? null : "You must agree to the terms")],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm(formData)) {
      // Submit the booking using the hook
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

  // Form UI implementation...
}
```

## Best Practices

1. **Separation of Concerns**: Use hooks to keep your components focused on UI rather than state management logic.

2. **Consistent Validation**: Reuse validation rules across forms to ensure consistent behavior.

3. **Progressive Validation**: Validate fields on change for immediate feedback, but also validate the entire form on submission.

4. **Error Handling**: Always handle loading states and error messages from API calls.

5. **Type Safety**: Utilize TypeScript to ensure type safety throughout your application.

By following these patterns, you can create a more maintainable and user-friendly booking experience.
