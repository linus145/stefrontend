'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmployeeLoginForm() {
  const { employeeLogin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side auth guard: redirect authenticated users to employee dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/employee/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use dedicated employee login flow and redirect to employee dashboard
      await employeeLogin(email.trim(), password, '/employee/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.detail || err.data?.detail || err.message || 'Invalid employee credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setIsSubmitting(true);
    toast.success('Logging in as Demo Employee...', { duration: 1500 });
    setTimeout(() => {
      // Store a mock session marker to bypass auth check in employee dashboard
      localStorage.setItem('demo_employee_user', JSON.stringify({
        id: 'demo-emp-001',
        email: 'employee@b2linq.com',
        first_name: 'David',
        last_name: 'Miller',
        role: 'EMPLOYEE',
        employee_id: 'EMP-0842',
        designation: 'Senior Frontend Engineer',
        department: 'Engineering',
        joining_date: '2024-03-15'
      }));
      router.replace('/employee/dashboard');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="w-full relative rounded-none sm:rounded-sm bg-transparent sm:bg-white/95 dark:bg-transparent sm:dark:bg-slate-900/40 backdrop-blur-none sm:backdrop-blur-md border-0 sm:border border-slate-200/80 dark:border-slate-800/80 shadow-none sm:shadow-2xl p-0 sm:p-8 overflow-hidden transition-all duration-300 sm:hover:border-slate-300/80 sm:dark:hover:border-slate-700/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Subtle accent bar at the top */}
      <div className="hidden sm:block absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0a66c2] to-transparent" />
      
      <h2 className="text-md font-semibold text-slate-800 dark:text-slate-200 text-center uppercase tracking-wider mb-6">
        Sign In to Employee Hub
      </h2>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-sm bg-rose-500/5 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase" htmlFor="email">
            Employee Username or Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <input
              id="email"
              type="text"
              placeholder="Username or email address"
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm bg-white dark:bg-slate-900 sm:bg-slate-50/80 sm:dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 sm:py-2 text-sm sm:text-xs transition-colors focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm bg-white dark:bg-slate-900 sm:bg-slate-50/80 sm:dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-10 pr-10 py-3 sm:py-2 text-sm sm:text-xs transition-colors focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#0a66c2] py-3 sm:py-2 text-sm sm:text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/10 hover:bg-[#004182] transition-all disabled:opacity-50 mt-6 sm:mt-4 cursor-pointer"
        >
          {isSubmitting ? 'Verifying...' : 'Sign In'}
          {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </form>

      {/* Quick Demo Login Divider */}
      <div className="hidden sm:flex relative my-6 items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative px-3 bg-white dark:bg-slate-950 text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
          Or Explore Instantly
        </span>
      </div>

      {/* Instant Sandbox/Demo Employee Portal Login */}
      <div className="hidden sm:block">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          Launch Demo Employee Portal
        </button>
      </div>
    </div>
  );
}
