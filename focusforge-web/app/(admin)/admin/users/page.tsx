'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminUser } from '@/types/domain.types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => adminApi.getUsers({ search: search || undefined, role: roleFilter || undefined }),
  });

  const promote  = useMutation({ mutationFn: adminApi.promoteUser,  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }) });
  const demote   = useMutation({ mutationFn: adminApi.demoteUser,   onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }) });
  const ban      = useMutation({ mutationFn: adminApi.banUser,      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }) });
  const unban    = useMutation({ mutationFn: adminApi.unbanUser,    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }) });
  const destroy  = useMutation({ mutationFn: adminApi.deleteUser,   onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }) });

  const users: AdminUser[] = (data as { data: AdminUser[] } | undefined)?.data ?? [];

  function confirmDelete(user: AdminUser) {
    if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
      destroy.mutate(user.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">{data?.meta?.total ?? 0} total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-500">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-500">Tasks / Notes</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500">Joined</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && [...Array(5)].map((_, i) => (
              <tr key={i}>
                <td colSpan={6} className="px-4 py-3">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ))}
            {!isLoading && users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge color={user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  {user.is_banned
                    ? <Badge color="bg-red-100 text-red-700">Banned</Badge>
                    : <Badge color="bg-green-100 text-green-700">Active</Badge>}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {user.tasks_count} / {user.notes_count}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1 flex-wrap">
                    {user.role === 'user'
                      ? <Button size="sm" variant="ghost" onClick={() => promote.mutate(user.id)} loading={promote.isPending}>Promote</Button>
                      : <Button size="sm" variant="ghost" onClick={() => demote.mutate(user.id)} loading={demote.isPending}>Demote</Button>
                    }
                    {user.is_banned
                      ? <Button size="sm" variant="ghost" onClick={() => unban.mutate(user.id)} loading={unban.isPending}>Unban</Button>
                      : <Button size="sm" variant="ghost" onClick={() => ban.mutate(user.id)} loading={ban.isPending}>Ban</Button>
                    }
                    <Button size="sm" variant="danger" onClick={() => confirmDelete(user)} loading={destroy.isPending}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
