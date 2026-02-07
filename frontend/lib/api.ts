/**
 * Backend API base URL. Call this when making a request so the URL is read at request time
 * (works on all browsers and phones; layout injects the value into the page).
 * Set NEXT_PUBLIC_API_URL in Vercel to your Render URL (e.g. https://care-equity-drct.onrender.com).
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as unknown as { __CARE_EQUITY_API_BASE__?: string }).__CARE_EQUITY_API_BASE__) {
    return (window as unknown as { __CARE_EQUITY_API_BASE__: string }).__CARE_EQUITY_API_BASE__;
  }
  return (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5001';
}

/** @deprecated Use getApiBase() at fetch time so the correct URL is used on all devices. */
export const API_BASE = getApiBase();
