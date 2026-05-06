'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from './google-login-button';

export function RegisterForm() {
  const router = useRouter();
  const { logout, requestOtp, verifyOtp, isAuthenticated, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'FOUNDER' // Default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Client-side auth guard: redirect authenticated users away from register
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Prevent flash of register form while checking auth or if already authenticated
  if (isLoading || isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    if (isVerifying) {
      if (!otp.trim()) {
        toast.error('Please enter the verification code.');
        return;
      }
      setIsSubmitting(true);
      try {
        await verifyOtp(formData.email, otp);
      } catch (error: any) {
        setGeneralError(error.response?.data?.message || error.data?.message || 'Verification failed.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Basic frontend validation
    const newErrors: Record<string, string[]> = {};
    if (!formData.first_name.trim()) newErrors.first_name = ['First name is required'];
    if (!formData.last_name.trim()) newErrors.last_name = ['Last name is required'];
    if (!formData.email.trim()) newErrors.email = ['Email is required'];
    
    if (!formData.password.trim()) {
      newErrors.password = ['Password is required'];
    } else if (formData.password.length < 8) {
      newErrors.password = ['Password must be at least 8 characters long'];
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirm_password = ['Passwords do not match'];
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Registration Form Incomplete');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/auth/register/', formData);
      await requestOtp(formData.email);
      setIsVerifying(true);
      toast.success('Account created! Please verify your email.');
    } catch (error: any) {
      const fieldErrors = error.data?.data || error.data || {};
      setErrors(fieldErrors);
      setGeneralError(error.data?.message || error.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="w-full pb-10">
      <div className="relative w-full rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
        
        <div className="p-8">
          <h2 className="text-[17px] font-medium text-slate-900 text-center mb-8">
            {isVerifying ? 'Verify Your Email' : 'Sign Up'}
          </h2>
          
          {generalError && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isVerifying ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="first_name">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        id="first_name"
                        disabled={isSubmitting}
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full rounded-md bg-slate-50 border ${errors.first_name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="last_name">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      disabled={isSubmitting}
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full rounded-md bg-slate-50 border ${errors.last_name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 px-4 py-2.5 text-sm outline-none`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="role">
                    Account Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <select
                      id="role"
                      disabled={isSubmitting}
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-md bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none appearance-none"
                    >
                      <option value="FOUNDER">Founder</option>
                      <option value="CO_FOUNDER">Co-Founder</option>
                      <option value="INVESTOR">Investor</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="SALES">Sales</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="ENGINEER">Engineer</option>
                      <option value="PRODUCT">Product Manager</option>
                      <option value="DESIGN">Designer</option>
                      <option value="OPERATIONS">Operations</option>
                    </select>
                  </div>
                </div>

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
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-md bg-slate-50 border ${errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full rounded-md bg-slate-50 border ${errors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-10 py-2.5 text-sm outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase" htmlFor="confirm_password">
                      Confirm
                    </label>
                    <div className="relative">
                      <input
                        id="confirm_password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full rounded-md bg-slate-50 border ${errors.confirm_password ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 px-4 py-2.5 text-sm outline-none`}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm text-slate-500 text-center">
                  We've sent a 6-digit verification code to <span className="font-semibold text-slate-900">{formData.email}</span>
                </p>
                <div className="space-y-2">
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
                      placeholder="000000"
                      maxLength={6}
                      disabled={isSubmitting}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full rounded-md bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none tracking-[0.5em] font-mono text-center"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => requestOtp(formData.email)}
                  className="w-full text-xs text-indigo-600 font-medium hover:underline"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70 mt-4"
            >
              {isSubmitting ? (isVerifying ? 'Verifying...' : 'Creating Account...') : (isVerifying ? 'Verify & Continue' : 'Create Account')}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
          Sign In 
        </Link>
      </div>
    </div>
  );
}
