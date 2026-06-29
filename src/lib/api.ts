export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Get access token from memory (handled by AuthContext)
  // For simplicity without a full state management library, we'll rely on the AuthContext
  // to attach the header before calling apiFetch, OR we can store it in a closure here.
  let token = typeof window !== 'undefined' ? (window as any).__accessToken : null;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Include credentials for cookies (refresh token)
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, fetchOptions);

  // Auto-refresh logic if 401 Unauthorized
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send the httpOnly cookie
      });

      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        // Update the token in memory
        if (typeof window !== 'undefined') {
          (window as any).__accessToken = accessToken;
        }
        
        // Retry original request with new token
        headers.set('Authorization', `Bearer ${accessToken}`);
        fetchOptions.headers = headers;
        response = await fetch(url, fetchOptions);
      } else {
        // Refresh failed, user needs to login again
        if (typeof window !== 'undefined') {
          (window as any).__accessToken = null;
          // Optionally redirect to login or trigger an event
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        (window as any).__accessToken = null;
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // Ignore JSON parse error on non-JSON response
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}
