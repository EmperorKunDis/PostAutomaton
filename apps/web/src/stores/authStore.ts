import { create } from 'zustand';
import { User } from '@internal-marketing-content-app/shared';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const authResponse = await authService.login({ email, password });
      authService.saveAuthData(authResponse);
      
      set({
        user: authResponse.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  },

  register: async (email: string, name: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const authResponse = await authService.register({ email, name, password });
      authService.saveAuthData(authResponse);
      
      set({
        user: authResponse.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed'
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      authService.clearAuthData();
      set({
        user: null,
        isAuthenticated: false,
        error: null
      });
    }
  },

  loadUserFromStorage: () => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();
    
    if (token && user) {
      set({
        user,
        isAuthenticated: true
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));