import * as React from "react";
export interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
    rightIcon?: React.ReactNode;
    error?: boolean;
}
declare const InputWithIcon: React.ForwardRefExoticComponent<InputWithIconProps & React.RefAttributes<HTMLInputElement>>;
export { InputWithIcon };
