import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL; 

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
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true; // Prevent infinite retry loop
      try {
        // Attempt to refresh the session
        await axios.post(
          `${API_BASE_URL}/auth/refresh`, // Replace with your refresh endpoint
          {},
          { withCredentials: true } // Ensure cookies are sent with the refresh request
        );

        // Retry the original request
        return apiClient(error.config);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        console.error('Session refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;