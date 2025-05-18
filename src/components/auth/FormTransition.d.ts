import React, { ReactNode } from "react";
interface FormTransitionProps {
    children: ReactNode;
    direction?: "forward" | "backward";
    isActive: boolean;
    animationKey?: string;
}
export declare const FormTransition: React.FC<FormTransitionProps>;
export default FormTransition;
