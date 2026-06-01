'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/format';
import Spinner from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setUser, clearAuth, user, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    hydrate();
    const hasToken = document.cookie.includes('ff_token');
    if (!hasToken) { router.replace('/login'); return; }
    authApi.me()
      .then((res) => {
        const u = res.data.data;
        setUser(u);
        if (u.role !== 'admin') router.replace('/dashboard');
        else setIsAdmin(true);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-slate-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white text-xs font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-white">FocusForge</p>
            <span className="text-[10px] font-semibold tracking-widest text-red-400 uppercase">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-slate-700/50" />
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span>←</span>
            Back to App
          </Link>
        </nav>

        {/* User */}
        {user && (
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-sm font-semibold text-red-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Admin Mode
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Logged in as <span className="font-medium text-slate-800">{user?.email}</span>
          </p>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
