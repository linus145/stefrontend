'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'FOUNDER' // Default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.first_name) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/auth/register/', formData);
      toast.success('Account created safely! Redirecting to login.');
      router.push('/login');
    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.data ? JSON.stringify(error.data) : error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="w-full pb-10">
      <div className="relative w-full rounded-2xl bg-[#121215] shadow-2xl border border-white/[0.05] overflow-hidden">
        
        {/* The top gradient border effect */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#b49cf8] to-transparent opacity-80" />
        
        <div className="p-8">
          <h2 className="text-[17px] font-medium text-white text-center mb-8">Request Access</h2>
          
          {/* SSO Buttons replication to keep aesthetic mirroring consistent */}
          <div className="space-y-3 mb-8">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-[#1a1a1f] px-4 py-2.5 text-sm font-medium text-[#d4d4d8] hover:bg-[#202026] transition-colors border border-white/[0.03]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
              <span className="bg-[#121215] px-4">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase" htmlFor="first_name">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="first_name"
                    disabled={isSubmitting}
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full rounded-md bg-[#09090b] border border-white/[0.08] text-[#f4f4f5] pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-[#b49cf8] focus:border-[#b49cf8] outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase" htmlFor="last_name">
                  Last Name
                </label>
                <input
                  id="last_name"
                  disabled={isSubmitting}
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full rounded-md bg-[#09090b] border border-white/[0.08] text-[#f4f4f5] px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-[#b49cf8] focus:border-[#b49cf8] outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase" htmlFor="role">
                Account Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  id="role"
                  disabled={isSubmitting}
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-md bg-[#09090b] border border-white/[0.08] text-[#f4f4f5] pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-[#b49cf8] focus:border-[#b49cf8] outline-none appearance-none"
                >
                  <option value="FOUNDER">Founder</option>
                  <option value="INVESTOR">Investor</option>
                   <option value="MENTOR">Mentor</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#71717a]">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="founder@ste.io"
                  disabled={isSubmitting}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md bg-[#09090b] border border-white/[0.08] text-[#f4f4f5] pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-[#b49cf8] focus:border-[#b49cf8] outline-none placeholder:text-[#52525b]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md bg-[#09090b] border border-white/[0.08] text-[#f4f4f5] pl-10 pr-10 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-[#b49cf8] focus:border-[#b49cf8] outline-none placeholder:text-[#52525b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-[#71717a] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#52525b] mt-1">
                Requires 8+ chars, 1 uppercase, 1 number natively bounding Django constraints.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#b49cf8] to-[#8061f2] py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-[0_0_20px_rgba(180,156,248,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Architecting Account...' : 'Continue'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-[#a1a1aa]">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#d4d4d8] hover:text-white transition-colors">
          Sign In natively
        </Link>
      </div>
    </div>
  );
}
