'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';
import ProfileDropdown from './ProfileDropdown';

const baseNavItems = [
  { href: ROUTES.DASHBOARD,  label: 'Dashboard',  icon: '⊞', roles: ['student', 'teacher', 'admin'] },
  { href: ROUTES.TASKS,      label: 'Tasks',       icon: '✓', roles: ['student', 'teacher', 'admin'] },
  { href: ROUTES.NOTES,      label: 'Notes',       icon: '📄', roles: ['student', 'teacher', 'admin'] },
  { href: ROUTES.FOCUS,      label: 'Focus',       icon: '⏱', roles: ['student', 'teacher', 'admin'] },
  { href: ROUTES.ANALYTICS,  label: 'Analytics',   icon: '📊', roles: ['student', 'teacher', 'admin'] },
  { href: ROUTES.LESSON_PLANS, label: 'Lesson Plans', icon: '📚', roles: ['teacher', 'admin'] },
];

const ROLE_BADGE: Record<string, string> = {
  teacher: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  admin:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

function NavList({ pathname, role, onNavigate }: { pathname: string; role?: string; onNavigate?: () => void }) {
  const items = baseNavItems.filter(item => !role || item.roles.includes(role));
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try { await authApi.logout(); } finally {
      clearAuth();
      router.push('/login');
    }
  }

  return (
    <>
      {/* Mobile top bar — hamburger + FF logo + profile avatar */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <span className="text-xs font-bold text-white">FF</span>
          </div>
        </div>
        <ProfileDropdown />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-700 dark:bg-gray-900 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">FF</div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">FocusForge AI</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu</p>
          <NavList pathname={pathname} role={user?.role} onNavigate={() => setMobileOpen(false)} />

          {/* Mobile-only action buttons */}
          <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 dark:border-gray-800">
            {user?.role === 'admin' && (
              <button
                onClick={() => { setMobileOpen(false); router.push('/admin'); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <span>🛡️</span> Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <span>→</span> Sign out
            </button>
          </div>
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">FF</div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">FocusForge AI</span>
          </div>
          {user?.role && user.role !== 'student' && (
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', ROLE_BADGE[user.role])}>
              {user.role}
            </span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu</p>
          <NavList pathname={pathname} role={user?.role} />
        </nav>
      </aside>
    </>
  );
}
