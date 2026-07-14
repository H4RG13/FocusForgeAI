'use client';

import Link from 'next/link';
import ProfileDropdown from './ProfileDropdown';

interface TopBarProps {
  title: string;
  backHref?: string;
}

export default function TopBar({ title, backHref }: TopBarProps) {
  return (
    <header className="hidden lg:flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
      </div>
      <ProfileDropdown />
    </header>
  );
}
