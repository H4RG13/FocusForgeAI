'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, loading, errors: apiErrors } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl">
            FF
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start your productivity journey</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <form onSubmit={handleSubmit((d) => registerUser(d))} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              placeholder="Jane Doe"
              autoComplete="name"
              error={errors.name?.message ?? apiErrors.name?.[0]}
              {...register('name')}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message ?? apiErrors.email?.[0]}
              {...register('email')}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              error={errors.password?.message ?? apiErrors.password?.[0]}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              id="password_confirmation"
              type="password"
              placeholder="Repeat password"
              autoComplete="new-password"
              error={errors.password_confirmation?.message}
              {...register('password_confirmation')}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
