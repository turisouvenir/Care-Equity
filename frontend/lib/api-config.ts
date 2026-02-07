/**
 * API Configuration
 * 
 * Centralized configuration for backend API URL.
 * Uses environment variable NEXT_PUBLIC_API_URL for the base URL.
 * Falls back to localhost for local development.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Helper function to build full API endpoint URLs
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
