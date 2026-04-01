import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('hhbb_user') || 'null'),
  token: localStorage.getItem('hhbb_token') || null,
  isLoading: false,
  error: null,

  // Computed
  get isAuthenticated() {
    return !!get().token;
  },

  get isAdmin() {
    return get().user?.role === 'admin';
  },

  get isEmployee() {
    return get().user?.role === 'employee';
  },

  get isCustomer() {
    return get().user?.role === 'customer';
  },

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('hhbb_token', data.token);
      localStorage.setItem('hhbb_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.error || 'Login failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem('hhbb_token', data.token);
      localStorage.setItem('hhbb_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('hhbb_token');
    localStorage.removeItem('hhbb_user');
    set({ user: null, token: null, error: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('hhbb_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch (error) {
      get().logout();
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
