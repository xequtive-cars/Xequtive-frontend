import { ReactNode } from "react";

export interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

declare const ProtectedRoute: React.FC<ProtectedRouteProps>;
