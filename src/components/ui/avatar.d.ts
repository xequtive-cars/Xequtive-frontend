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

declare const Avatar: React.ForwardRefExoticComponent<
  AvatarProps & React.RefAttributes<HTMLDivElement>
>;
declare const AvatarImage: React.ForwardRefExoticComponent<
  AvatarImageProps & React.RefAttributes<HTMLImageElement>
>;
declare const AvatarFallback: React.ForwardRefExoticComponent<
  AvatarFallbackProps & React.RefAttributes<HTMLDivElement>
>;

export { Avatar, AvatarImage, AvatarFallback };
