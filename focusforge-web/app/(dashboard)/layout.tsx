'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';
import Spinner from '@/components/ui/Spinner';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, hydrate } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    hydrate();
    const token = document.cookie.includes('ff_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    authApi.me()
      .then((res) => setUser(res.data.data))
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      {/* On mobile, sidebar is a drawer so main takes full width */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
