/**
 * Backend API base URL.
 * - Uses NEXT_PUBLIC_API_URL environment variable if set (injected at build time by Next.js)
 * - Falls back to production Render URL in production
 * - Falls back to localhost for local development
 * 
 * Note: In Next.js, NEXT_PUBLIC_* env vars are replaced at build time with their actual values.
 * This means they're available in both server and client code as string literals.
 */
function getApiBase(): string {
  // Check for environment variable (replaced at build time by Next.js)
  // In browser, this will be the actual value or undefined
  const envUrl = typeof process !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : (typeof window !== 'undefined' 
      ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL 
      : undefined);
  
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const url = envUrl.trim();
    // Ensure it's an absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  }
  
  // Check if we're in production
  const isProduction = typeof window !== 'undefined' 
    ? window.location.hostname !== 'localhost'
    : (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
  
  if (isProduction) {
    // Production fallback - your Render backend URL
    return 'https://care-equity.onrender.com';
  }
  
  // Development fallback
  return 'http://localhost:5001';
}

/** @deprecated Use getApiBase() at fetch time so the correct URL is used on all devices. */
export const API_BASE = getApiBase();

// Log API base for debugging (helps identify issues)
if (typeof window !== 'undefined') {
  console.log('[API] Using backend URL:', API_BASE);
}
