'use client';

import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Sign out
      </Button>
    </header>
  );
}
