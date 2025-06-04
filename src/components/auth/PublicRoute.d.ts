import { ReactNode } from "react";

export interface PublicRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

declare const PublicRoute: React.FC<PublicRouteProps>;
