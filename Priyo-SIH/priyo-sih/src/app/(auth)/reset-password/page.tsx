'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus('loading');
    const result = await resetPassword({
      password,
      confirmPassword,
    });

    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col space-y-6 text-center py-4 animate-in fade-in-50 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-display-md text-ink font-semibold tracking-tight">Password updated</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            Your account credentials have been successfully updated. Redirecting you to sign in...
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button className="w-full rounded-pill h-11 text-body-sm font-medium">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center mx-auto mb-1">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-display-md text-ink font-semibold tracking-tight">Set new password</h1>
        <p className="text-body text-ink-muted">
          Choose a strong, unique password to secure your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {status === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-body-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-caption font-medium text-ink" htmlFor="password">
            New password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-caption font-medium text-ink" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Apple/Google style password requirement checklist */}
        <div className="bg-surface-2/60 border border-hairline rounded-xl p-3.5 space-y-2 text-caption">
          <div className="text-ink-muted font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-accent-blue" />
            Security requirements:
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
            <span className={hasMinLength ? 'text-emerald-500 font-medium' : 'text-ink-muted'}>
              {hasMinLength ? '✓' : '•'} At least 8 characters
            </span>
            <span className={hasUpper ? 'text-emerald-500 font-medium' : 'text-ink-muted'}>
              {hasUpper ? '✓' : '•'} One uppercase letter
            </span>
            <span className={hasLower ? 'text-emerald-500 font-medium' : 'text-ink-muted'}>
              {hasLower ? '✓' : '•'} One lowercase letter
            </span>
            <span className={hasNumber ? 'text-emerald-500 font-medium' : 'text-ink-muted'}>
              {hasNumber ? '✓' : '•'} One number
            </span>
          </div>
          {confirmPassword && (
            <div className="pt-1 text-xs">
              <span className={passwordsMatch ? 'text-emerald-500 font-medium' : 'text-red-500'}>
                {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full rounded-pill h-11 font-medium"
          disabled={status === 'loading' || !isFormValid}
        >
          {status === 'loading' ? 'Saving new password...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
