import React from "react";
type FeedbackType = "error" | "success" | "info" | "loading";
interface AlertFeedbackProps {
    type: FeedbackType;
    title?: string;
    message: string;
    className?: string;
    onDismiss?: () => void;
}
export declare function AlertFeedback({ type, title, message, className, onDismiss, }: AlertFeedbackProps): React.JSX.Element;
export declare function ErrorAlert({ message, ...props }: Omit<AlertFeedbackProps, "type" | "message"> & {
    message: string;
}): React.JSX.Element;
export declare function SuccessAlert({ message, ...props }: Omit<AlertFeedbackProps, "type" | "message"> & {
    message: string;
}): React.JSX.Element;
export declare function LoadingAlert({ message, ...props }: Omit<AlertFeedbackProps, "type" | "message"> & {
    message: string;
}): React.JSX.Element;
export default AlertFeedback;
