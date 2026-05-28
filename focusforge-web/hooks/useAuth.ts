'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authApi } from '@/lib/api/auth';
import type { LoginPayload, RegisterPayload } from '@/types/api.types';
import axios from 'axios';

export function useAuth() {
  const { setAuth, clearAuth } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const login = async (data: LoginPayload) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await authApi.login(data);
      setAuth(res.data.data, res.data.token);
      router.push(res.data.data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        addToast({ type: 'error', message: 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await authApi.register(data);
      setAuth(res.data.data, res.data.token);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        addToast({ type: 'error', message: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return { login, register, logout, loading, errors };
}
