/**
 * API Client with retry logic for Render cold starts
 * 
 * Render's free tier spins down services after 15 minutes of inactivity.
 * The first request after spin-down can take 30-60 seconds to wake up the service.
 * This client implements retry logic to handle cold starts gracefully.
 */

// Get API base URL - same logic as api.ts but available here
function getApiBase(): string {
  const envUrl = typeof process !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : undefined;
  
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const url = envUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  }
  
  const isProduction = typeof window !== 'undefined' 
    ? window.location.hostname !== 'localhost'
    : (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
  
  return isProduction 
    ? 'https://care-equity.onrender.com'
    : 'http://localhost:5001';
}

export const API_BASE = getApiBase();

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Fetch with retry logic for cold starts
 */
export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 2000, // 2 seconds
    timeout = 30000, // 30 seconds
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If we get a 502, 503, or 504, it might be a cold start - retry
        if (!response.ok && [502, 503, 504].includes(response.status) && attempt < retries) {
          console.warn(`[API] Server error ${response.status}, retrying... (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }

        return response;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      lastError = error;

      // Network errors or timeouts - likely cold start
      if (
        (error.name === 'AbortError' || 
         error.name === 'TypeError' || 
         error.message?.includes('fetch') ||
         error.message?.includes('network')) &&
        attempt < retries
      ) {
        const delay = retryDelay * (attempt + 1);
        console.warn(`[API] Network error, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt or non-retryable error
      if (attempt === retries) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * Wake up the backend service (useful for cold starts)
 * Call this before making actual API requests if you want to pre-warm the service
 */
export async function wakeUpBackend(): Promise<boolean> {
  try {
    const response = await apiFetch('/health', {
      method: 'GET',
      retries: 2,
      retryDelay: 3000,
      timeout: 60000, // 60 seconds for cold start
    });
    return response.ok;
  } catch (error) {
    console.warn('[API] Failed to wake up backend:', error);
    return false;
  }
}
