import * as React from "react";

export interface SwitchProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

declare const Switch: React.ForwardRefExoticComponent<
  SwitchProps & React.RefAttributes<HTMLButtonElement>
>;

export { Switch };
