'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from './google-login-button';

export function RegisterForm() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'FOUNDER' // Default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

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
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Registration Form Incomplete', {
        description: 'Please fill in all required fields marked with errors below.'
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/auth/register/', formData);
      
      // Clear any auto-login tokens to ensure we stay on /login
      // This prevents the middleware from redirecting to /dashboard
      await logout().catch(() => {}); 
      
      toast.success('Account created safely! Redirecting to login.');
      router.push('/login');
    } catch (error: any) {
      const errorData = error.data;
      // Handle both standard DRF and the custom {status, data} pattern shown by user
      const fieldErrors = errorData?.data && typeof errorData.data === 'object' ? errorData.data : (errorData || {});
      const errorMsg = errorData?.message || errorData?.detail || error.message || 'Registration failed.';
      
      toast.error('Registration Failed', {
        description: typeof errorMsg === 'string' ? errorMsg : 'Please check the errors below.'
      });

      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(fieldErrors);
        const general = fieldErrors.detail || fieldErrors.non_field_errors || (typeof errorData?.message === 'string' ? errorData.message : null);
        if (general) {
          setGeneralError(Array.isArray(general) ? general[0] : general);
        }
      } else {
        setGeneralError(typeof errorMsg === 'string' ? errorMsg : 'Registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error for the field when user types
    if (errors[e.target.id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[e.target.id];
        return next;
      });
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="relative w-full rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden">
        
        {/* The top gradient border effect */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
        
        <div className="p-8">
          <h2 className="text-[17px] font-medium text-slate-900 text-center mb-8">Sign Up</h2>
          
          {generalError && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              {generalError}
            </div>
          )}

          {/* SSO Buttons replication to keep aesthetic mirroring consistent */}
          <div className="space-y-3 mb-8">
            {/* <GoogleLoginButton /> */}
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="bg-white px-4">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    className={`w-full rounded-md bg-slate-50 border ${errors.first_name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none`}
                  />
                </div>
                {errors.first_name && (
                  <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.first_name[0]}
                  </p>
                )}
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
                  className={`w-full rounded-md bg-slate-50 border ${errors.last_name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none`}
                />
                {errors.last_name && (
                  <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.last_name[0]}
                  </p>
                )}
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
                  className={`w-full rounded-md bg-slate-50 border ${errors.role ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none`}
                >
                  <option value="FOUNDER">Founder</option>
                  <option value="INVESTOR">Investor</option>
                   <option value="MENTOR">Mentor</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.role && (
                <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.role[0]}
                </p>
              )}
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
                  className={`w-full rounded-md bg-slate-50 border ${errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.email[0]}
                </p>
              )}
            </div>

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
                  className={`w-full rounded-md bg-slate-50 border ${errors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} text-slate-900 pl-10 pr-10 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="space-y-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {Array.isArray(errors.password) ? (
                    errors.password.map((err, i) => (
                      <p key={i} className="text-[10px] font-medium text-red-500">
                        {err}
                      </p>
                    ))
                  ) : (
                    <p className="text-[10px] font-medium text-red-500">{errors.password}</p>
                  )}
                </div>
              )}
              
              {/* Live Password Validation Requirements */}
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password Requirements</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${formData.password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[10px] transition-colors duration-300 ${formData.password.length >= 8 ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>8+ Characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${/[A-Z]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[10px] transition-colors duration-300 ${/[A-Z]/.test(formData.password) ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>1 Uppercase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[10px] transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>1 Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <span className={`text-[10px] transition-colors duration-300 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>Special Char</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Architecting Account...' : 'Continue'}
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
