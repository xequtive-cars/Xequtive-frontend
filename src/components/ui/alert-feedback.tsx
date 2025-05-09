"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type FeedbackType = "error" | "success" | "info" | "loading";

interface AlertFeedbackProps {
  type: FeedbackType;
  title?: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function AlertFeedback({
  type,
  title,
  message,
  className,
  onDismiss,
}: AlertFeedbackProps) {
  const icons = {
    error: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    loading: <Loader2 className="h-4 w-4 animate-spin" />,
    info: <Info className="h-4 w-4" />,
  };

  const styles = {
    error: "border-destructive/50 text-destructive",
    success: "border-green-500/50 text-green-500",
    loading: "border-blue-500/50 text-blue-500",
    info: "border-blue-500/50 text-blue-500",
  };

  return (
    <Alert className={cn("my-2 pr-2 relative", styles[type], className)}>
      <div className="flex items-center gap-2">
        {icons[type]}
        {title && <AlertTitle>{title}</AlertTitle>}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-auto rounded-full"
            onClick={onDismiss}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
      <AlertDescription className="mt-1">{message}</AlertDescription>
    </Alert>
  );
}

// Predefined error alert
export function ErrorAlert({
  message,
  ...props
}: Omit<AlertFeedbackProps, "type" | "message"> & { message: string }) {
  return <AlertFeedback type="error" message={message} {...props} />;
}

// Predefined success alert
export function SuccessAlert({
  message,
  ...props
}: Omit<AlertFeedbackProps, "type" | "message"> & { message: string }) {
  return <AlertFeedback type="success" message={message} {...props} />;
}

// Predefined loading alert
export function LoadingAlert({
  message,
  ...props
}: Omit<AlertFeedbackProps, "type" | "message"> & { message: string }) {
  return <AlertFeedback type="loading" message={message} {...props} />;
}

export default AlertFeedback;
