'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Briefcase, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from './google-login-button';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const { logout, requestOtp, verifyOtp, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
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

  const validateFirstName = (val: string) => {
    if (!val.trim()) return 'First name is required';
    const nameRegex = /^[A-Za-z\s'-]+$/;
    if (!nameRegex.test(val.trim())) return 'First name should only contain letters, spaces, hyphens, or apostrophes';
    return null;
  };

  const validateLastName = (val: string) => {
    if (!val.trim()) return 'Last name is required';
    const nameRegex = /^[A-Za-z\s'-]+$/;
    if (!nameRegex.test(val.trim())) return 'Last name should only contain letters, spaces, hyphens, or apostrophes';
    return null;
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Invalid email format';
    return null;
  };

  const validatePhone = (val: string) => {
    if (!val.trim()) return 'Mobile number is required';
    const phoneRegex = /^\+?1?\d{9,15}$/;
    if (!phoneRegex.test(val.trim())) return 'Invalid phone number format';
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val.trim()) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(val) || !/[a-z]/.test(val) || !/[0-9]/.test(val)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  };

  const validateConfirmPassword = (val: string, pass: string) => {
    if (val !== pass) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    if (isVerifying) {
      if (!otp.trim()) {
        toast.error('Verification Code: Please enter the verification code.');
        return;
      }
      setIsSubmitting(true);
      try {
        await verifyOtp(formData.email, otp);
      } catch (error: any) {
        const verifyErrorMsg = error.response?.data?.message || error.data?.message || 'Verification failed.';
        setGeneralError(verifyErrorMsg);
        toast.error(verifyErrorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Basic frontend validation with custom field errors (no toasts)
    const newErrors: Record<string, string[]> = {};
    const firstErr = validateFirstName(formData.first_name);
    if (firstErr) newErrors.first_name = [firstErr];

    const lastErr = validateLastName(formData.last_name);
    if (lastErr) newErrors.last_name = [lastErr];

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = [emailErr];

    const phoneErr = validatePhone(formData.phone_number);
    if (phoneErr) newErrors.phone_number = [phoneErr];

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = [passErr];

    const confErr = validateConfirmPassword(confirmPassword, formData.password);
    if (confErr) newErrors.confirm_password = [confErr];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      const regErrorMsg = error.data?.message || error.message || 'Registration failed.';
      setGeneralError(regErrorMsg);

      // Parse fieldErrors: only toast general detail or message, field-level errors show below inputs
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, fieldErrorsList]) => {
          if (field === 'detail' || field === 'message' || field === 'non_field_errors') {
            const msg = typeof fieldErrorsList === 'string' ? fieldErrorsList : (Array.isArray(fieldErrorsList) ? fieldErrorsList[0] : JSON.stringify(fieldErrorsList));
            setGeneralError(msg);
            toast.error(msg);
          }
        });
      } else {
        toast.error(regErrorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    let err: string | null = null;
    if (id === 'first_name') err = validateFirstName(value);
    else if (id === 'last_name') err = validateLastName(value);
    else if (id === 'email') err = validateEmail(value);
    else if (id === 'phone_number') err = validatePhone(value);
    else if (id === 'password') err = validatePassword(value);

    setErrors(prev => {
      const next = { ...prev };
      if (err) next[id] = [err];
      else delete next[id];

      // If password or confirmPassword changes, validate confirmPassword
      const confErr = validateConfirmPassword(confirmPassword, id === 'password' ? value : formData.password);
      if (confErr) next.confirm_password = [confErr];
      else delete next.confirm_password;
      return next;
    });
  };

  return (
    <div className="w-full pb-10">
      <div className="relative w-full rounded-sm bg-white dark:bg-[#121320] shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-500">

        <div className="p-6 sm:p-7 flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isVerifying ? 'Verify Your Email' : 'Sign Up'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
              Get started with B2Linq
            </p>
          </div>

          {generalError && (
            <div className="p-3 rounded-sm bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isVerifying ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="first_name">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        id="first_name"
                        disabled={isSubmitting}
                        value={formData.first_name}
                        onChange={handleChange}
                        className={cn(
                          "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none",
                          errors.first_name ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-800'
                        )}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-[10px] font-medium text-red-500 mt-1">
                        {errors.first_name[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="last_name">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      disabled={isSubmitting}
                      value={formData.last_name}
                      onChange={handleChange}
                      className={cn(
                        "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white px-4 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none",
                        errors.last_name ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-800'
                      )}
                    />
                    {errors.last_name && (
                      <p className="text-[10px] font-medium text-red-500 mt-1">
                        {errors.last_name[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="role">
                    Account Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <select
                      id="role"
                      disabled={isSubmitting}
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm outline-none appearance-none font-semibold cursor-pointer"
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
                  {errors.role && (
                    <p className="text-[10px] font-medium text-red-500 mt-1">
                      {errors.role[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="founder@ste.io"
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none",
                        errors.email ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-800'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] font-medium text-red-500 mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="phone_number">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      id="phone_number"
                      type="tel"
                      placeholder="+1234567890"
                      disabled={isSubmitting}
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={cn(
                        "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none",
                        errors.phone_number ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-800'
                      )}
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="text-[10px] font-medium text-red-500 mt-1">
                      {errors.phone_number[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        value={formData.password}
                        onChange={handleChange}
                        className={cn(
                          "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-10 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none",
                          errors.password ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-800'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[10px] font-medium text-red-500 mt-1">
                        {errors.password[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" htmlFor="confirm_password">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="confirm_password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        value={confirmPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfirmPassword(val);
                          const err = validateConfirmPassword(val, formData.password);
                          setErrors(prev => {
                            const next = { ...prev };
                            if (err) next.confirm_password = [err];
                            else delete next.confirm_password;
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border text-slate-900 dark:text-white pl-10 pr-10 py-2.5 text-sm transition-all focus:ring-1 focus:ring-[#5e3be1] focus:border-[#5e3be1] outline-none",
                          errors.confirm_password ? 'border-red-400 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-800'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-[10px] font-medium text-red-500 mt-1">
                        {errors.confirm_password[0]}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm text-slate-500 text-center">
                  We've sent a 6-digit verification code to <span className="font-semibold text-slate-900">{formData.email}</span>
                </p>
                <div className="space-y-2">
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
                      placeholder="000000"
                      maxLength={6}
                      disabled={isSubmitting}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full rounded-sm bg-[#f8fafc] dark:bg-[#151624] border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm outline-none tracking-[0.5em] font-mono text-center"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => requestOtp(formData.email)}
                  className="w-full text-xs text-[#5e3be1] dark:text-[#8c74f5] font-semibold hover:underline"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#0a66c2] hover:bg-[#004182] py-3 text-sm font-bold text-white shadow-lg shadow-[#0a66c2]/20 transition-all duration-300 disabled:opacity-70 mt-2 cursor-pointer"
            >
              {isSubmitting ? (isVerifying ? 'Verifying...' : 'Creating Account...') : (isVerifying ? 'Verify & Continue' : 'Create Account')}
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

      <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-[#5e3be1] dark:text-[#8c74f5] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
