import { ReactNode } from "react";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
interface AnalyticsContextType {
    trackEvent: (eventName: string, params?: Record<string, unknown>) => void;
    events: typeof ANALYTICS_EVENTS;
}
export declare function AnalyticsProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useAnalyticsContext(): AnalyticsContextType;
export default AnalyticsProvider;
