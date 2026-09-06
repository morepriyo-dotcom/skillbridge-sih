'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Mail,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [directLink, setDirectLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setStatus('loading');
    const result = await forgotPassword({ email: cleanEmail });
    
    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      if (result?.directRecoveryLink) {
        setDirectLink(result.directRecoveryLink);
      }
      setStatus('success');
    }
  };

  const handleResend = async () => {
    setStatus('loading');
    const result = await forgotPassword({ email: email.trim().toLowerCase() });
    if (result?.error) {
      setStatus('error');
      setMessage(result.error);
    } else {
      if (result?.directRecoveryLink) {
        setDirectLink(result.directRecoveryLink);
      }
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col space-y-6 text-center py-2 animate-in fade-in-50 duration-300">
        {/* Apple/Google Security Mail Icon */}
        <div className="relative mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-1 border-2 border-surface-1 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Title & Email Recipient Badge */}
        <div className="space-y-2">
          <h1 className="text-display-md text-ink font-semibold tracking-tight">Check your email</h1>
          <p className="text-body text-ink-muted leading-relaxed max-w-md mx-auto">
            We sent a secure password recovery authorization link to:
          </p>
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-surface-2 border border-hairline text-body-sm font-semibold text-ink">
            {email}
          </div>
        </div>

        {/* Apple / Google Security Notice Card */}
        <div className="bg-surface-2/60 border border-hairline rounded-xl p-4 text-left space-y-3">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
            <div className="text-caption text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">Single-use secure link: </span>
              Click the link in the message to verify your identity and choose a new password for your account.
            </div>
          </div>

          <div className="border-t border-hairline pt-3 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-caption text-ink-muted leading-relaxed">
              For security reasons, this recovery link will automatically expire in <span className="font-medium text-ink">1 hour</span>.
            </div>
          </div>

          <div className="border-t border-hairline pt-3 flex items-start space-x-3">
            <KeyRound className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-caption text-ink-muted leading-relaxed">
              If you didn&apos;t request this reset, you can safely disregard this email. Your password and account remain protected.
            </div>
          </div>
        </div>

        {/* Direct Recovery Link (Instant Fallback for Email Rate-Limits / Institutional Spam Filters) */}
        {directLink && (
          <div className="p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/25 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-bold text-ink flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent-blue" />
                Email delayed or filtered?
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue uppercase tracking-wider">
                Instant Access
              </span>
            </div>
            <p className="text-caption text-ink-muted leading-relaxed">
              Institutional firewalls (such as university <code className="text-xs font-mono text-ink">.ac.in</code> servers) or email rate limits may delay incoming messages. You can use your secure single-use authorization link directly:
            </p>
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <a
                href={directLink}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-pill bg-accent-blue text-white font-semibold text-body-sm hover:opacity-90 shadow-sm transition-all text-center"
              >
                Reset Password Directly <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(directLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2.5 rounded-pill bg-surface-2 border border-hairline text-caption font-medium text-ink hover:bg-surface-1 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link href="/login" className="block w-full">
            <Button className="w-full rounded-pill h-11 text-body-sm font-medium">
              Return to Sign In
            </Button>
          </Link>

          <div className="pt-2 text-caption text-ink-muted space-y-2">
            <p>
              Didn&apos;t receive the email? Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
            </p>
            <p>
              Still waiting?{' '}
              <button 
                type="button" 
                onClick={handleResend}
                className="text-accent-blue font-medium hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend recovery link
              </button>{' '}
              or{' '}
              <button 
                type="button" 
                onClick={() => setStatus('idle')}
                className="text-accent-blue font-medium hover:underline"
              >
                use a different email
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center mx-auto mb-1">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-display-md text-ink font-semibold tracking-tight">Reset your password</h1>
        <p className="text-body text-ink-muted">
          Enter your account email to receive a secure authorization link
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
          <label className="text-caption font-medium text-ink" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
            <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full rounded-pill h-11 font-medium" 
          disabled={status === 'loading' || !email.trim()}
        >
          {status === 'loading' ? 'Sending security authorization...' : 'Send Authorization Link'}
        </Button>
      </form>

      <div className="text-center text-body-sm text-ink-muted">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-accent-blue hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
