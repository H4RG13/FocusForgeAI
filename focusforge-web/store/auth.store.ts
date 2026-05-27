import { create } from 'zustand';
import type { User } from '@/types/domain.types';
import { getToken, setToken, removeToken } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    setToken(token);
    set({ user, token, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    removeToken();
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = getToken();
    if (token) set({ token, isAuthenticated: true });
  },
}));
