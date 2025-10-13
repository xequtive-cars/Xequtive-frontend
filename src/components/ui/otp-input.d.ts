// TypeScript declarations for OTP input component
export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function OTPInput(props: OTPInputProps): JSX.Element;
