'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/format';
import Spinner from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';

const adminNav = [
  { href: '/admin',       label: 'Dashboard', icon: '⊞' },
  { href: '/admin/users', label: 'Users',      icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setUser, clearAuth, user, hydrate } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const [checking,    setChecking]    = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

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

  function NavItems({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        {adminNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span>←</span>
          Back to App
        </Link>
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-gray-950 lg:flex-row">

      {/* ── Mobile top bar ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-900 px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white text-xs font-bold">
            A
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 active:bg-white/20"
          aria-label="Open admin menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-200 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white text-xs font-bold">A</div>
            <div>
              <p className="text-sm font-semibold text-white">FocusForge</p>
              <span className="text-[10px] font-semibold tracking-widest text-red-400 uppercase">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItems onNavigate={() => setMobileOpen(false)} />
        </nav>
        {user && (
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-sm font-semibold text-red-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-slate-700/50 bg-slate-900 lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white text-xs font-bold">A</div>
          <div>
            <p className="text-sm font-semibold text-white">FocusForge</p>
            <span className="text-[10px] font-semibold tracking-widest text-red-400 uppercase">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItems />
        </nav>
        {user && (
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-sm font-semibold text-red-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop-only top bar */}
        <header className="hidden lg:flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Admin Mode
          </span>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Logged in as <span className="font-medium text-slate-800 dark:text-gray-200">{user?.email}</span>
          </p>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-gray-950 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
