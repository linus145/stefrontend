'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLoginButton } from './google-login-button';

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

    if (!trimmedEmail) {
      setErrors({ email: ['Email is required'] });
      toast.error('Required fields are missing');
      return;
    }

    setIsSubmitting(true);
    try {
      if (loginMode === 'password') {
        if (!password.trim()) {
          setErrors({ password: ['Password is required'] });
          toast.error('Password is required');
          return;
        }
        await login(email, password);
      } else {
        if (!isOtpSent) {
          await requestOtp(email);
          setIsOtpSent(true);
        } else {
          if (!otp.trim()) {
            toast.error('Please enter the verification code.');
            return;
          }
          await verifyOtp(email, otp);
        }
      }
    } catch (error: any) {
      if (error.status === 403 && error.data?.message?.includes('not verified')) {
        // Auto-switch to OTP mode if account exists but isn't verified
        setLoginMode('otp');
        setGeneralError('Email not verified. We have sent a verification code to your email.');
        try {
          await requestOtp(email);
          setIsOtpSent(true);
        } catch (otpErr: any) {
          setGeneralError('Failed to send verification code. Please try again.');
        }
      } else if (error.data && typeof error.data === 'object') {
        setErrors(error.data);
        if (error.data.detail || error.data.non_field_errors) {
          setGeneralError(error.data.detail || error.data.non_field_errors[0]);
        }
      } else {
        setGeneralError(error.message || 'Action failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
        
        <div className="p-8">
          <h2 className="text-[17px] font-medium text-slate-900 text-center mb-8">
            {loginMode === 'password' ? 'Sign in to your account' : 'Verify your account'}
          </h2>
          
          {generalError && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              {generalError}
            </div>
          )}

          <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => { setLoginMode('password'); setIsOtpSent(false); }}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${loginMode === 'password' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMode('otp')}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${loginMode === 'otp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Email OTP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="founder@ste.io"
                  disabled={isSubmitting || (loginMode === 'otp' && isOtpSent)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-md bg-slate-50 border ${errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-medium text-red-500 mt-1">
                  {errors.email[0]}
                </p>
              )}
            </div>

            {loginMode === 'password' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-[12px] text-indigo-600 hover:text-indigo-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-md bg-slate-50 border ${errors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-10 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : isOtpSent && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="otp">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                    className="w-full rounded-md bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-[11px] text-indigo-600 font-medium hover:underline"
                >
                  Change email address
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70 mt-2"
            >
              {isSubmitting ? (
                loginMode === 'password' ? 'Signing in...' : (isOtpSent ? 'Verifying...' : 'Sending...')
              ) : (
                loginMode === 'password' ? 'Sign In' : (isOtpSent ? 'Verify & Sign In' : 'Send Code')
              )}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
          Signup
        </Link>
      </div>
    </div>
  );
}
