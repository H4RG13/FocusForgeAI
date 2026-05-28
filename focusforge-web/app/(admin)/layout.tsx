'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setAuth, clearAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      authApi.me()
        .then((res) => setAuth(res.data.data, useAuthStore.getState().token!))
        .catch(() => { clearAuth(); router.replace('/login'); });
      return;
    }
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin top bar */}
      <header className="bg-red-600 text-white px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">FocusForge</span>
          <span className="bg-white/20 rounded px-2 py-0.5 text-xs font-semibold tracking-wide">ADMIN</span>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="/admin" className="hover:underline">Dashboard</a>
          <a href="/admin/users" className="hover:underline">Users</a>
          <a href="/dashboard" className="hover:underline opacity-75">← App</a>
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
