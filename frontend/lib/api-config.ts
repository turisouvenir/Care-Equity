/**
 * API Configuration
 * 
 * Centralized configuration for backend API URL.
 * Uses environment variable NEXT_PUBLIC_API_URL for the base URL.
 * Falls back to localhost for local development.
 */

// Type-safe access to process.env in Next.js
// Next.js replaces NEXT_PUBLIC_* vars at build time, but TypeScript needs proper handling
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

export const API_BASE_URL = getEnvVar('NEXT_PUBLIC_API_URL') || 'http://localhost:5001';

/**
 * Helper function to build full API endpoint URLs
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
