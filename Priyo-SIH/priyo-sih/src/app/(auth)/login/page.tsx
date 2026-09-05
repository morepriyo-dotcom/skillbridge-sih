'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get('next') || searchParams.get('redirect');
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard';
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await signIn({ 
      email: data.email, 
      password: data.password, 
    }, next);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push(next);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-body-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-caption text-ink" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
        {errors.email && <p className="text-red-500 text-micro">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-caption text-ink" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="text-micro text-accent-blue hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-red-500 text-micro">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full rounded-pill h-11 font-medium" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-display-md text-ink">Welcome back</h1>
        <p className="text-body text-ink-muted">Enter your credentials to sign in</p>
      </div>

      <Suspense fallback={<div className="text-center py-6 text-ink-muted text-body-sm">Loading login...</div>}>
        <LoginFormContent />
      </Suspense>

      <div className="text-center text-body-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-accent-blue hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
