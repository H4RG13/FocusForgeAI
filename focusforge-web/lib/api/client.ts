import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'ff_token';

export const getToken = (): string | undefined => Cookies.get(TOKEN_KEY);
export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 30, sameSite: 'lax' });
};
export const removeToken = (): void => Cookies.remove(TOKEN_KEY);

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
