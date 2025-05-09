import { useState, useCallback } from "react";

// Type for validation rule functions
type ValidationRule = (value: unknown) => string | null;

// Type for field validation map
type FieldValidation = {
  [fieldName: string]: ValidationRule[];
};

// Type for form values
type FormValues = Record<string, unknown>;

/**
 * Common validation rules
 */
export const validationRules = {
  required: (value: unknown): string | null => {
    if (value === undefined || value === null || value === "") {
      return "This field is required";
    }
    return null;
  },

  email: (value: unknown): string | null => {
    if (!value) return null; // Skip if empty (use with required for mandatory emails)
    if (typeof value !== "string") return "Invalid email type";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  phone: (value: unknown): string | null => {
    if (!value) return null; // Skip if empty
    if (typeof value !== "string") return "Invalid phone type";

    const phoneRegex =
      /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (!phoneRegex.test(value)) {
      return "Please enter a valid phone number";
    }
    return null;
  },

  minLength:
    (length: number) =>
    (value: unknown): string | null => {
      if (!value) return null; // Skip if empty
      if (typeof value !== "string") return "Invalid string type";

      if (value.length < length) {
        return `Must be at least ${length} characters`;
      }
      return null;
    },
};

/**
 * Hook for form validation
 *
 * @param initialValidation - Field validation configuration
 * @returns Validation state and functions
 */
export function useFormValidation(initialValidation: FieldValidation) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  // Set an error for a specific field
  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
    setIsValid(false);
  }, []);

  // Clear an error for a specific field
  const clearError = useCallback(
    (field: string) => {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      // Check if there are any remaining errors
      setIsValid(Object.keys(errors).length === 0);
    },
    [errors]
  );

  // Validate a single field
  const validateField = useCallback(
    (field: string, value: unknown): boolean => {
      // Skip if no validation rules for this field
      if (!initialValidation[field]) return true;

      // Run each validation rule for the field
      for (const rule of initialValidation[field]) {
        const errorMessage = rule(value);
        if (errorMessage) {
          setError(field, errorMessage);
          return false;
        }
      }

      // Clear error if validation passes
      clearError(field);
      return true;
    },
    [initialValidation, setError, clearError]
  );

  // Validate all form fields
  const validateForm = useCallback(
    (formValues: FormValues): boolean => {
      let formIsValid = true;
      const newErrors: Record<string, string> = {};

      // Validate each field
      Object.keys(initialValidation).forEach((field) => {
        const value = formValues[field];
        const rules = initialValidation[field];

        for (const rule of rules) {
          const errorMessage = rule(value);
          if (errorMessage) {
            newErrors[field] = errorMessage;
            formIsValid = false;
            break;
          }
        }
      });

      setErrors(newErrors);
      setIsValid(formIsValid);
      return formIsValid;
    },
    [initialValidation]
  );

  return {
    errors,
    isValid,
    setError,
    clearError,
    validateField,
    validateForm,
  };
}
