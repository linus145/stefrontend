import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Register | B2linq Platform',
  description: 'Sign up for the highly-optimized Startup Ecosystem.',
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-[#f3f4fc] dark:bg-[#0b0c15] p-4 sm:p-6 overflow-hidden font-sans">
      {/* Top Left Branding Logo & Name (Static, no navigation) */}
      <div className="absolute left-6 top-6 z-20 flex items-center gap-2">
        <div className="w-5.5 h-5.5 rounded-md bg-[#5e3be1] flex items-center justify-center shadow-md shadow-[#5e3be1]/30">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L18 5l-3.5-3.5L4.5 16.5z" />
            <path d="M12 15l-3-3" />
            <path d="M9 15l-3-3" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">B2Linq</span>
      </div>

      {/* Exquisite Pink & Purple Radial Glow Backgrounds */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#805ad5]/15 to-[#d53f8c]/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#3182ce]/10 to-[#805ad5]/5 blur-[100px] pointer-events-none z-0"></div>

      <div className="z-10 w-full max-w-[395px] flex-1 flex flex-col justify-center items-center py-2">
        {/* Branding Header */}
        <div className="mb-3 text-center space-y-1.5 mt-2 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            {/* Custom Premium Logo Shape matching B2Linq Rocket */}
            <div className="w-6 h-6 rounded-md bg-[#5e3be1] flex items-center justify-center shadow-lg shadow-[#5e3be1]/30">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5L18 5l-3.5-3.5L4.5 16.5z" />
                <path d="M12 15l-3-3" />
                <path d="M9 15l-3-3" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">B2Linq</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
            Enterprise Connectivity Simplified.
          </p>

          {/* Elegant Back to Home button under logo */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5e3be1] dark:text-[#8c74f5] hover:underline pt-1 group">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>

        {/* The Card containing the Form */}
        <RegisterForm />
      </div>

      {/* Bottom Footer legal links */}
      <div className="z-10 text-center py-2 space-y-3">
        <div className="flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Security</Link>
        </div>
      </div>
    </div>
  );
}
