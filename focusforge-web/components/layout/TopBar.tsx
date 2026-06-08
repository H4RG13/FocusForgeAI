'use client';

import ProfileDropdown from './ProfileDropdown';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="hidden lg:flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <ProfileDropdown />
    </header>
  );
}
