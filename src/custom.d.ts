// This file is used to provide global type declarations for component modules

declare module "@/components/ui/avatar" {
  import * as React from "react";

  export interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
    className?: string;
  }

  export interface AvatarImageProps
    extends React.ComponentPropsWithoutRef<"img"> {
    className?: string;
  }

  export interface AvatarFallbackProps
    extends React.ComponentPropsWithoutRef<"div"> {
    className?: string;
  }

  export const Avatar: React.ForwardRefExoticComponent<
    AvatarProps & React.RefAttributes<HTMLDivElement>
  >;
  export const AvatarImage: React.ForwardRefExoticComponent<
    AvatarImageProps & React.RefAttributes<HTMLImageElement>
  >;
  export const AvatarFallback: React.ForwardRefExoticComponent<
    AvatarFallbackProps & React.RefAttributes<HTMLDivElement>
  >;
}

declare module "@/components/ui/switch" {
  import * as React from "react";

  export interface SwitchProps
    extends React.ComponentPropsWithoutRef<"button"> {
    className?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }

  export const Switch: React.ForwardRefExoticComponent<
    SwitchProps & React.RefAttributes<HTMLButtonElement>
  >;
}
