import { Middleware } from "@reduxjs/toolkit";
declare const persistenceMiddleware: Middleware;
export declare const loadPersistedState: () => Partial<{
    booking: unknown;
    api: unknown;
}> | undefined;
export default persistenceMiddleware;
