'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLoginButton } from './google-login-button';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const { login, requestOtp, verifyOtp, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Client-side auth guard: redirect authenticated users away from login
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Prevent flash of login form while checking auth or if already authenticated
  if (isLoading || isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    
    const trimmedEmail = email.trim();

    // 1. Client-Side Field Validation
    const clientErrors: Record<string, string[]> = {};
    if (!trimmedEmail) {
      clientErrors.email = ['Email is required'];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        clientErrors.email = ['Invalid email format'];
      }
    }

    if (loginMode === 'password') {
      if (!password.trim()) {
        clientErrors.password = ['Password is required'];
      }
    } else {
      if (isOtpSent && !otp.trim()) {
        clientErrors.otp = ['Verification code is required'];
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (loginMode === 'password') {
        await login(email, password);
      } else {
        if (!isOtpSent) {
          await requestOtp(email);
          setIsOtpSent(true);
        } else {
          await verifyOtp(email, otp);
        }
      }
    } catch (error: any) {
      if (error.status === 403 && error.data?.message?.includes('not verified')) {
        setLoginMode('otp');
        const unverifiedMsg = 'Email not verified. We have sent a verification code to your email.';
        setGeneralError(unverifiedMsg);
        try {
          await requestOtp(email);
          setIsOtpSent(true);
        } catch (otpErr: any) {
          setGeneralError('Failed to send verification code. Please try again.');
        }
      } else if (error.data && typeof error.data === 'object') {
        setErrors(error.data);
        
        // Loop over the backend errors: only toast general detail or message, field-level errors show below inputs
        Object.entries(error.data).forEach(([field, fieldErrors]) => {
          if (field === 'detail' || field === 'message' || field === 'non_field_errors') {
            const msg = typeof fieldErrors === 'string' ? fieldErrors : (Array.isArray(fieldErrors) ? fieldErrors[0] : JSON.stringify(fieldErrors));
            setGeneralError(msg);
            toast.error(msg);
          }
        });
      } else {
        const errorMsg = error.message || 'Action failed.';
        setGeneralError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full rounded-sm bg-white dark:bg-[#121320] shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-500">
        
        <div className="p-6 sm:p-7 flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {loginMode === 'password' ? 'Sign in to your account' : 'Verify your account'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
              Welcome back to B2Linq
            </p>
          </div>
          
          {generalError && (
            <div className="p-3 rounded-sm bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
              {generalError}
            </div>
          )}

          {/* Premium Tab Selector Toggle matching the image */}
          <div className="flex gap-1 p-1 bg-[#f0f2f7] dark:bg-[#1a1b2d] rounded-sm">
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setIsOtpSent(false); }}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-sm transition-all duration-300",
                loginMode === 'password'
                  ? "bg-white dark:bg-[#121320] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('otp')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-sm transition-all duration-300",
                loginMode === 'otp'
                  ? "bg-white dark:bg-[#121320] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              )}
            >
              OTP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Work Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="email">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  disabled={isSubmitting || (loginMode === 'otp' && isOtpSent)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none placeholder:text-slate-455",
                    errors.email ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200/80 dark:border-slate-800/80'
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-medium text-red-500 mt-1">
                  {errors.email[0]}
                </p>
              )}
            </div>

            {/* Password / OTP Verification Field */}
            {loginMode === 'password' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-semibold text-[#5e3be1] dark:text-[#8c74f5] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-10 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none placeholder:text-slate-455",
                      errors.password ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200/80 dark:border-slate-800/80'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : isOtpSent && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="otp">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    disabled={isSubmitting}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none placeholder:text-slate-455"
                  />
                </div>
                {errors.otp && (
                  <p className="text-[10px] font-medium text-red-500 mt-1">
                    {errors.otp[0]}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-xs font-semibold text-[#5e3be1] dark:text-[#8c74f5] hover:underline"
                >
                  Change email address
                </button>
              </div>
            )}

            {/* Remember Me Checkbox */}
            {loginMode === 'password' && (
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-slate-300 text-[#5e3be1] focus:ring-[#5e3be1] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-bold text-slate-400 dark:text-slate-400 cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>
            )}

            {/* Premium Purple Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#5e3be1] hover:bg-[#4b2ec7] py-3 text-sm font-bold text-white shadow-lg shadow-[#5e3be1]/20 transition-all duration-300 disabled:opacity-70 mt-1 cursor-pointer"
            >
              {isSubmitting ? (
                loginMode === 'password' ? 'Signing in...' : (isOtpSent ? 'Verifying...' : 'Sending...')
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          {/* Or Continue With Separator */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800/60"></div>
            <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">or continue with</span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800/60"></div>
          </div>

          {/* Google & SSO Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <GoogleLoginButton />
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 h-[44px] rounded-sm text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121320] transition-all duration-300 w-full cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-900 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>SSO</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Signup Redirection footer below card */}
      <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link href="/register" className="font-bold text-[#5e3be1] dark:text-[#8c74f5] hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
