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

const passwordSchema = z.object({
  current_password:      z.string().min(1, 'Current password is required'),
  password:              z.string().min(8, 'New password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});
type PasswordFormData = z.infer<typeof passwordSchema>;

function Eye() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

const TIMEZONES = [
  'UTC', 'Asia/Manila', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Hong_Kong',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Australia/Sydney',
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [saving,          setSaving]          = useState(false);
  const [savingPassword,  setSavingPassword]  = useState(false);
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

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

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  async function onPasswordSubmit(data: PasswordFormData) {
    setSavingPassword(true);
    try {
      await authApi.changePassword(data);
      addToast({ type: 'success', message: 'Password changed successfully.' });
      resetPw();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.current_password?.[0]
        ?? err?.response?.data?.message
        ?? 'Failed to change password.';
      addToast({ type: 'error', message: msg });
    } finally {
      setSavingPassword(false);
    }
  }

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

      {/* Change password card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
        <form onSubmit={handleSubmitPw(onPasswordSubmit)} className="space-y-4">
          {/* Current password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="current_password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current password</label>
            <div className="relative">
              <input
                id="current_password"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                className={`block w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${pwErrors.current_password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'}`}
                {...registerPw('current_password')}
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showCurrent ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {pwErrors.current_password && <p className="text-xs text-red-600">{pwErrors.current_password.message}</p>}
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
            <div className="relative">
              <input
                id="password"
                type={showNew ? 'text' : 'password'}
                placeholder="At least 8 characters"
                className={`block w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${pwErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'}`}
                {...registerPw('password')}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showNew ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {pwErrors.password && <p className="text-xs text-red-600">{pwErrors.password.message}</p>}
          </div>

          {/* Confirm new password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm new password</label>
            <div className="relative">
              <input
                id="password_confirmation"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat new password"
                className={`block w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${pwErrors.password_confirmation ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'}`}
                {...registerPw('password_confirmation')}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {pwErrors.password_confirmation && <p className="text-xs text-red-600">{pwErrors.password_confirmation.message}</p>}
          </div>
          <div className="pt-1">
            <Button type="submit" loading={savingPassword}>Change password</Button>
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
