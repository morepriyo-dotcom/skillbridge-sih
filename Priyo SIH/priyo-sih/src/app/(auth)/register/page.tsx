'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/actions/auth';
import { registerSchema } from '@/lib/validators/auth';
import type { RegisterInput } from '@/lib/validators/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GraduationCap, Briefcase, Building, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';

const roles: Array<{
  id: 'student' | 'academician' | 'industry_partner' | 'institution_admin';
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
}> = [
  { id: 'student', title: 'Student', subtitle: 'Explore internships & build portfolio', icon: GraduationCap },
  { id: 'academician', title: 'Academician / Faculty', subtitle: 'Request access for research, FDPs & mentorship', icon: Landmark },
  { id: 'industry_partner', title: 'Industry Partner', subtitle: 'Request verification to post openings & hire talent', icon: Briefcase },
  { id: 'institution_admin', title: 'Institution Admin', subtitle: 'Request verification for analytics & accreditation', icon: Building },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'student' | 'academician' | 'industry_partner' | 'institution_admin'>('student');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const handleRoleSelect = (roleId: 'student' | 'academician' | 'industry_partner' | 'institution_admin') => {
    setSelectedRole(roleId);
    setValue('role', roleId, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const roleToSubmit = selectedRole || data.role;
    const result = await signUp({
      ...data,
      email: data.email.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      role: roleToSubmit,
    });
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col space-y-4 text-center py-4">
        <div className="w-12 h-12 rounded-full bg-semantic-success/20 text-semantic-success flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-display-md text-ink font-medium">Verification Link Sent</h1>
        <p className="text-body text-ink-muted leading-relaxed">
          We have dispatched an activation email to your address. Please follow the link to activate your account, then sign in.
        </p>
        <Button onClick={() => router.push('/login')} className="mt-4 rounded-pill">
          Proceed to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-display-md text-ink font-medium">Create your account</h1>
        <p className="text-body text-ink-muted">
          {step === 1 ? 'Select the access path you want to request' : 'Complete your account credentials'}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <p className="text-body-sm text-ink-muted">New accounts start with standard access. Partner and administrator permissions are assigned only after verification.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <Card
                  key={role.id}
                  className={cn(
                    "cursor-pointer p-4 flex flex-col items-start space-y-2 transition-all border",
                    isSelected
                      ? "border-accent-blue bg-accent-blue/5 shadow-sm"
                      : "border-hairline bg-surface-1 hover:border-hairline-soft hover:bg-surface-2"
                  )}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isSelected ? "bg-accent-blue text-white" : "bg-surface-2 text-ink"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <span className="text-body-sm font-semibold text-ink block">{role.title}</span>
                      <span className="text-micro text-ink-muted block">{role.subtitle}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Button 
            className="w-full rounded-pill" 
            onClick={() => setStep(2)} 
            disabled={!selectedRole}
          >
            Continue to Account Details
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('role')} value={selectedRole} />
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-body-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-surface-2 rounded-xl border border-hairline flex items-center justify-between text-body-sm">
            <span className="text-ink-muted">Selected Role:</span>
            <span className="text-ink font-semibold capitalize">
              {roles.find((r) => r.id === selectedRole)?.title}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-ink font-medium" htmlFor="fullName">Full Name</label>
            <Input id="fullName" placeholder="e.g. Dr. Priya Sharma" {...register('fullName')} />
            {errors.fullName && <p className="text-red-500 text-micro">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-ink font-medium" htmlFor="email">Official Email Address</label>
            <Input id="email" type="email" placeholder="name@institution.edu" {...register('email')} />
            {errors.email && <p className="text-red-500 text-micro">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-ink font-medium" htmlFor="password">Password</label>
            <Input id="password" type="password" placeholder="At least 8 chars (1 uppercase, 1 lowercase, 1 number)" {...register('password')} />
            {errors.password && <p className="text-red-500 text-micro">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-ink font-medium" htmlFor="confirmPassword">Confirm Password</label>
            <Input id="confirmPassword" type="password" placeholder="Re-enter password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-red-500 text-micro">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-full rounded-pill" disabled={isSubmitting}>
              Back
            </Button>
            <Button type="submit" className="w-full rounded-pill" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}

      <div className="text-center text-body-sm text-ink-muted border-t border-hairline pt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-accent-blue font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
