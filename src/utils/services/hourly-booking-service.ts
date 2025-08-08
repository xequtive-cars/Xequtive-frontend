import { apiClient } from '@/lib/api-client';
import {
  HourlyFareRequest,
  HourlyFareResponse,
  HourlyBookingRequest,
  HourlyBookingResponse,
} from '@/types/hourlyBooking';

const BASE_URL = '/api/hourly-bookings';

export const hourlyBookingService = {
  // Health check
  checkHealth: async (): Promise<Record<string, string>> => {
    const response = await apiClient.get('/api/hourly-booking-health');
    return response.data;
  },

  // Get fare estimate
  getFareEstimate: async (request: HourlyFareRequest): Promise<HourlyFareResponse> => {
    const response = await apiClient.post(`${BASE_URL}/fare-estimate`, request);
    return response.data;
  },

  // Create booking
  createBooking: async (request: HourlyBookingRequest): Promise<HourlyBookingResponse> => {
    const response = await apiClient.post(`${BASE_URL}/create`, request);
    return response.data;
  },

  // Get user bookings
  getUserBookings: async (status?: string): Promise<any> => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`${BASE_URL}/user${params}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: string, reason: string): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/${bookingId}/cancel`, {
      cancellationReason: reason,
    });
    return response.data;
  },
}; 