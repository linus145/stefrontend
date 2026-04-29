import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { JobList } from '@/components/careers/job-list';
import { Metadata } from 'next';
import { publicService } from '@/services/public.service';

export const metadata: Metadata = {
  title: 'Careers | B2linq Platform',
  description: 'Join the team building the future of startup execution.',
};

export default async function CareersPage() {
  let jobs = [];
  try {
    jobs = await publicService.getCareers();
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    // Fallback jobs
    jobs = [
      {
        role: "Senior AI Engineer",
        department: "Engineering",
        location: "Remote / San Francisco",
        job_type: "Full-time"
      },
      {
        role: "Product Designer",
        department: "Product",
        location: "London / Remote",
        job_type: "Full-time"
      }
    ];
  }

  return (
    <div className="bg-white text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-indigo-100">
      <Header />
      
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full pt-32">
        <section className="px-6 max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs text-emerald-600 font-medium mb-8">
             We are hiring!
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Build the <span className="text-indigo-600">Infrastructure</span> of Tomorrow.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            We are a small, high-conviction team working on some of the most interesting problems in fintech and AI.
          </p>
        </section>

        <JobList jobs={jobs} />
// ...

        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Don't see a fit?</h2>
            <p className="text-slate-600 mb-8">We are always looking for exceptional talent. Drop us a line.</p>
            <a href="mailto:careers@b2linq.com" className="text-indigo-600 font-bold hover:text-indigo-500 underline underline-offset-4">
              careers@b2linq.com
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
