import axios from 'axios';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { refreshToken } = useAuthStore.getState();
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token } = response.data.data;
          
          useAuthStore.setState({ 
            token: access_token, 
            refreshToken: refresh_token 
          });
          
          localStorage.setItem('token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          return axios(originalRequest);
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }

    // Global Error Handling
    if (!error.response) {
      // Network error or server is down
      toast.error('Network Error: Unable to reach the server.');
    } else if (error.response.status >= 500) {
      toast.error('Server Error: Something went wrong on our end.');
    } else if (error.response.status === 403) {
      toast.error(error.response.data?.message || 'Access Denied.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
