interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error?: {
        message: string;
        details?: string;
        code?: string;
    };
    metadata?: Record<string, unknown>;
}
export declare const apiService: {
    getFirebaseToken: () => Promise<string | null>;
    createRequest: (method: string, endpoint: string, data?: Record<string, unknown>, customOptions?: RequestInit) => Promise<RequestInit>;
    get: <T>(endpoint: string, customOptions?: RequestInit) => Promise<T>;
    post: <T>(endpoint: string, data: Record<string, unknown>, customOptions?: RequestInit) => Promise<T>;
    put: <T>(endpoint: string, data: Record<string, unknown>, customOptions?: RequestInit) => Promise<T>;
    delete: <T>(endpoint: string, customOptions?: RequestInit) => Promise<T>;
    fetchWithAuth<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>>;
};
export {};
