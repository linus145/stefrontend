import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Register | B2linq Platform',
  description: 'Sign up for the highly-optimized Startup Ecosystem.',
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
      {/* Back to Home Button */}
      <Link href="/" className="absolute left-4 top-4 z-20 md:left-8 md:top-8">
        <Button variant="ghost" size="sm" className="gap-2 group hover:bg-slate-100 transition-all duration-300">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Home</span>
        </Button>
      </Link>

      {/* Subtle radial glow matching the design */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_60%)]"></div>

      <div className="z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Branding mapping exactly to login */}
        <div className="mb-8 text-center space-y-2 mt-12 md:mt-0">
          <h1 className="text-4xl font-bold italic tracking-wider text-slate-900">
            B2linq
          </h1>
          <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-slate-500">
            ENTER THE ETHER
          </p>
        </div>

        {/* The Card */}
        <RegisterForm />
      </div>
    </div>
  );
}
