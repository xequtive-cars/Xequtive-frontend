import React from "react";
interface GoogleButtonProps {
    onClick?: () => void;
    type: "signin" | "signup";
    className?: string;
}
export declare const GoogleButton: ({ onClick, type, className, }: GoogleButtonProps) => React.JSX.Element;
export default GoogleButton;
