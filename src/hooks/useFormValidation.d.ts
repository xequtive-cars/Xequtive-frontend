type ValidationRule = (value: unknown) => string | null;
type FieldValidation = {
    [fieldName: string]: ValidationRule[];
};
type FormValues = Record<string, unknown>;
/**
 * Common validation rules
 */
export declare const validationRules: {
    required: (value: unknown) => string | null;
    email: (value: unknown) => string | null;
    phone: (value: unknown) => string | null;
    minLength: (length: number) => (value: unknown) => string | null;
};
/**
 * Hook for form validation
 *
 * @param initialValidation - Field validation configuration
 * @returns Validation state and functions
 */
export declare function useFormValidation(initialValidation: FieldValidation): {
    errors: Record<string, string>;
    isValid: boolean;
    setError: (field: string, message: string) => void;
    clearError: (field: string) => void;
    validateField: (field: string, value: unknown) => boolean;
    validateForm: (formValues: FormValues) => boolean;
};
export {};
