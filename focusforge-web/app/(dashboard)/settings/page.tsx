'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SelectInput from '@/components/ui/SelectInput';
import { useUIStore } from '@/store/ui.store';

const schema = z.object({
  name:                     z.string().min(1, 'Name is required').max(255),
  timezone:                 z.string().min(1),
  daily_focus_goal_minutes: z.number().min(15).max(720),
});
type FormData = z.infer<typeof schema>;

const TIMEZONES = [
  'UTC', 'Asia/Manila', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Hong_Kong',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Australia/Sydney',
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:                     user?.name ?? '',
      timezone:                 user?.timezone ?? 'UTC',
      daily_focus_goal_minutes: user?.daily_focus_goal_minutes ?? 120,
    },
  });

  const timezoneValue = watch('timezone');
  const timezoneOptions = TIMEZONES.map((tz) => ({ value: tz, label: tz }));

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data.data);
      addToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 lg:p-8">
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your profile and preferences.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                Admin
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Display name"
            id="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
            <SelectInput
              value={timezoneValue}
              onChange={(v) => setValue('timezone', v)}
              options={timezoneOptions}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily focus goal <span className="text-gray-400 font-normal dark:text-gray-500">(minutes)</span>
            </label>
            <input
              type="number"
              min={15}
              max={720}
              step={15}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              {...register('daily_focus_goal_minutes', { valueAsNumber: true })}
            />
            {errors.daily_focus_goal_minutes && (
              <p className="text-xs text-red-500">{errors.daily_focus_goal_minutes.message}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">Between 15 and 720 minutes (12 hours)</p>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">Account</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Role</span>
            <span className="font-medium capitalize text-gray-900 dark:text-gray-100">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Member since</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
