import { Metadata } from 'next';
import { CompanyLoginForm } from '@/components/recruiter/company-login-form';

export const metadata: Metadata = {
  title: 'Company Login | B2linq Recruiter',
  description: 'Sign in to your recruiter account on B2linq to post jobs and manage applications.',
};

export default function RecruiterLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      {/* Teal radial glow for recruiter branding */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.05)_0%,transparent_60%)]" />

      <div className="z-10 w-full max-w-[520px] flex flex-col items-center">
        {/* Branding */}
        <div className="mb-8 text-center space-y-2 mt-12 md:mt-0">
          <h1 className="text-4xl font-bold italic tracking-wider text-foreground">
            B2linq
          </h1>
          <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-teal-500">
            RECRUITER PORTAL
          </p>
        </div>

        <CompanyLoginForm />
      </div>
    </div>
  );
}
