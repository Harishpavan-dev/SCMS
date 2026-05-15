import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, access_token } = response.data.data;
          
          set({ 
            user, 
            token: access_token, 
            isAuthenticated: true 
          });
          
          localStorage.setItem('token', access_token);
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return false;

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data, isAuthenticated: true });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      updateUser: (userData) => {
        set({ user: userData });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
