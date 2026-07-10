'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { useAuthStore } from '@/store/auth.store';
import { AdminUser } from '@/types/domain.types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SelectInput from '@/components/ui/SelectInput';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

type Role = 'student' | 'teacher' | 'admin';

const ROLE_COLORS: Record<Role, string> = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-purple-100 text-purple-700',
  admin:   'bg-red-100 text-red-700',
};

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin',   label: 'Admin'   },
];

export default function AdminUsersPage() {
  const queryClient  = useQueryClient();
  const currentUser  = useAuthStore(s => s.user);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pendingId,  setPendingId]  = useState<{ action: string; id: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => adminApi.getUsers({ search: search || undefined, role: roleFilter || undefined }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const withPending = (action: string, fn: (id: number) => Promise<unknown>) => (id: number) => {
    setPendingId({ action, id });
    fn(id).then(invalidate).catch(() => {}).finally(() => setPendingId(null));
  };

  const assignRole = useMutation({ mutationFn: ({ id, role }: { id: number; role: Role }) => adminApi.assignRole(id, role) });
  const ban        = useMutation({ mutationFn: adminApi.banUser   });
  const unban      = useMutation({ mutationFn: adminApi.unbanUser });
  const destroy    = useMutation({ mutationFn: adminApi.deleteUser });

  const handleRoleChange = (user: AdminUser, newRole: Role) => {
    setPendingId({ action: 'role', id: user.id });
    assignRole
      .mutateAsync({ id: user.id, role: newRole })
      .then(invalidate)
      .catch(() => {})
      .finally(() => setPendingId(null));
  };

  const handleBan    = withPending('ban',    (id) => ban.mutateAsync(id));
  const handleUnban  = withPending('unban',  (id) => unban.mutateAsync(id));
  const handleDelete = withPending('delete', (id) => destroy.mutateAsync(id));

  const isPending = (action: string, id: number) =>
    pendingId?.action === action && pendingId?.id === id;

  const isSelf   = (id: number) => currentUser?.id === id;
  const isAdmin  = (user: AdminUser) => user.role === 'admin';
  const canChangeRole = (user: AdminUser) => !isSelf(user.id) && !isAdmin(user);

  const users: AdminUser[] = (data as { data: AdminUser[] } | undefined)?.data ?? [];

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete User"
        message={`Delete ${deleteTarget?.name ?? 'this user'}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={isPending('delete', deleteTarget?.id ?? -1)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{data?.meta?.total ?? 0} total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectInput
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: '',         label: 'All roles' },
            { value: 'student',  label: 'Students'  },
            { value: 'teacher',  label: 'Teachers'  },
            { value: 'admin',    label: 'Admins'    },
          ]}
          ringColor="red"
          className="w-36 shrink-0"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-gray-400">Tasks / Notes</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400">Joined</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && [...Array(5)].map((_, i) => (
              <tr key={i}>
                <td colSpan={6} className="px-4 py-3">
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ))}
            {!isLoading && users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {/* Name + email */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-gray-400 text-xs dark:text-gray-500">{user.email}</p>
                </td>

                {/* Role — dropdown if changeable, badge if self or admin */}
                <td className="px-4 py-3">
                  {canChangeRole(user) ? (
                    <SelectInput
                      value={user.role}
                      disabled={isPending('role', user.id)}
                      onChange={(v) => handleRoleChange(user, v as Role)}
                      options={ROLE_OPTIONS}
                      className="w-32"
                    />
                  ) : (
                    <Badge color={ROLE_COLORS[user.role as Role] ?? 'bg-gray-100 text-gray-700'}>
                      {user.role}
                    </Badge>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {user.is_banned
                    ? <Badge color="bg-red-100 text-red-700">Banned</Badge>
                    : <Badge color="bg-green-100 text-green-700">Active</Badge>}
                </td>

                {/* Stats */}
                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                  {user.tasks_count} / {user.notes_count}
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-gray-500 text-xs dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1 flex-wrap">
                    {user.is_banned
                      ? <Button size="sm" variant="ghost" onClick={() => handleUnban(user.id)} loading={isPending('unban', user.id)}>Unban</Button>
                      : !isSelf(user.id) && <Button size="sm" variant="ghost" onClick={() => handleBan(user.id)} loading={isPending('ban', user.id)}>Ban</Button>
                    }
                    {!isSelf(user.id) && (
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(user)} loading={isPending('delete', user.id)}>Delete</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {isLoading && [...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
        {!isLoading && users.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No users found.</p>
        )}
        {!isLoading && users.map((user) => (
          <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {canChangeRole(user) ? (
                  <SelectInput
                    value={user.role}
                    disabled={isPending('role', user.id)}
                    onChange={(v) => handleRoleChange(user, v as Role)}
                    options={ROLE_OPTIONS}
                    className="w-32"
                  />
                ) : (
                  <Badge color={ROLE_COLORS[user.role as Role] ?? 'bg-gray-100 text-gray-700'}>
                    {user.role}
                  </Badge>
                )}
                {user.is_banned
                  ? <Badge color="bg-red-100 text-red-700">Banned</Badge>
                  : <Badge color="bg-green-100 text-green-700">Active</Badge>
                }
              </div>
            </div>

            {/* Meta */}
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span>📋 {user.tasks_count} tasks</span>
              <span>📝 {user.notes_count} notes</span>
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {user.is_banned
                ? <Button size="sm" variant="ghost" onClick={() => handleUnban(user.id)} loading={isPending('unban', user.id)}>Unban</Button>
                : !isSelf(user.id) && <Button size="sm" variant="ghost" onClick={() => handleBan(user.id)} loading={isPending('ban', user.id)}>Ban</Button>
              }
              {!isSelf(user.id) && (
                <Button size="sm" variant="danger" onClick={() => setDeleteTarget(user)} loading={isPending('delete', user.id)}>Delete</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
