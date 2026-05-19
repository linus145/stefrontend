import { EmployeeLoginForm } from '@/components/employee/empdashboard/employee-login-form';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Employee Sign In | B2linq Portal',
  description: 'Log into the highly-optimized Startup Ecosystem secure Employee Portal.',
};

export default function EmployeeLoginPage() {
  return (
    <DashboardThemeProvider>
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 pt-20 pb-8 px-4 sm:p-8 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {/* Background gradients */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(10,102,194,0.04)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(10,102,194,0.08)_0%,transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Back to Home Button */}
        <Link href="/" className="absolute left-4 top-4 z-20 md:left-8 md:top-8">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-sm transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium text-xs uppercase tracking-wider">Back to Home</span>
          </Button>
        </Link>

        <div className="z-10 w-full max-w-[420px] flex flex-col items-center">
          {/* Branding */}
          <div className="mb-6 text-center space-y-2">
            <h1 className="text-4xl font-bold italic tracking-wider text-slate-900 dark:text-white">
              B2linq
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#0a66c2] dark:text-[#0a66c2]">
              EMPLOYEE PORTAL
            </p>
          </div>

          {/* Client Login Form Component */}
          <EmployeeLoginForm />

          {/* Footer info */}
          <div className="mt-8 text-center text-slate-400 dark:text-slate-600 text-[10px] tracking-wide max-w-xs uppercase font-semibold">
            Authorized personnel only. Access monitored by enterprise security systems.
          </div>
        </div>
      </div>
    </DashboardThemeProvider>
  );
}
