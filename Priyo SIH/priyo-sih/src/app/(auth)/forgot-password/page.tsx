'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    const result = await forgotPassword({ email });
    
    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      setStatus('success');
      setMessage('Password reset link sent to your email.');
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-display-md text-ink">Reset password</h1>
        <p className="text-body text-ink-muted">
          Enter your email to receive a password reset link
        </p>
      </div>

      {status === 'success' ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-semantic-success text-body-sm text-center">
            {message}
          </div>
          <Link href="/login" className="block w-full">
            <Button className="w-full rounded-pill">Return to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-body-sm">
              {message}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-caption text-ink" htmlFor="email">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-pill" disabled={status === 'loading' || !email}>
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <div className="text-center text-body-sm text-ink-muted">
        Remember your password?{' '}
        <Link href="/login" className="text-accent-blue hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
