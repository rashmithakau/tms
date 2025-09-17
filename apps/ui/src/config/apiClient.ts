import axios from 'axios';

// Use explicit API base when provided; otherwise rely on same-origin + dev proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Replace with your API base URL
  withCredentials: true, // Ensure cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (no manual token attachment needed)
apiClient.interceptors.request.use(
  (config) => {
    return config; // No changes needed since cookies are automatically sent
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Avoid refresh attempts for auth endpoints (e.g., failed login) to prevent noise
    const urlPath = (originalRequest.url || '').toString();
    const isAuthEndpoint = /\/auth\/(login|refresh|password|me)/.test(urlPath);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true; // Prevent infinite retry loop
      try {
        // Attempt to refresh the session (backend expects GET /auth/refresh)
        await apiClient.get('/auth/refresh');

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        console.error('Session refresh failed:', refreshError);
        try {
          // Attempt server-side logout to clear cookies
          await apiClient.get('/auth/logout');
        } catch {}
        // Redirect to login page - cookies will be cleared by server
        if (typeof window !== 'undefined') {
          window.location.assign('/');
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export const getApiBaseURL = () => apiClient.defaults.baseURL || window.location.origin;