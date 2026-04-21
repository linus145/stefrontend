'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // Errors handled inside Context toast natively
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 
        The card container matching the image:
        - Dark background (#121215)
        - Very subtle white/gray border, except top which has the purple gradient glow.
      */}
      <div className="relative w-full rounded-2xl bg-[#121215] shadow-2xl border border-white/[0.05] overflow-hidden">
        
        {/* The top gradient border effect */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#b49cf8] to-transparent opacity-80" />
        
        <div className="p-8">
          <h2 className="text-[17px] font-medium text-white text-center mb-8">Sign in to your account</h2>
          
          {/* SSO Buttons */}
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
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-[#1a1a1f] px-4 py-2.5 text-sm font-medium text-[#d4d4d8] hover:bg-[#202026] transition-colors border border-white/[0.03]"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
              <span className="bg-[#121215] px-4">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-[#09090b] border border-white/[0.08] text-[#f4f4f5] pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-[#b49cf8] focus:border-[#b49cf8] outline-none placeholder:text-[#52525b]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold tracking-wider text-[#a1a1aa] uppercase" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-[12px] text-[#b49cf8] hover:text-[#c4b1fa] hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#b49cf8] to-[#8061f2] py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-[0_0_20px_rgba(180,156,248,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-[#a1a1aa]">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-[#d4d4d8] hover:text-white transition-colors">
          Request Access
        </Link>
      </div>
    </div>
  );
}
