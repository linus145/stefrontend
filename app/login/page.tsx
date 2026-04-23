import { LoginForm } from '@/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | B2linq Platform',
  description: 'Log into the highly-optimized Startup Ecosystem securely.',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
      {/* Subtle radial glow matching the design */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_50%)]"></div>

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Branding */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-bold italic tracking-wider text-slate-900">
            B2linq
          </h1>
          <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-slate-500">
            ENTER THE ETHER
          </p>
        </div>

        {/* The Card */}
        <LoginForm />
      </div>
    </div>
  );
}
