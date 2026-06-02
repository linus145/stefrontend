import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { CareersList } from '@/components/Public/careers/careers-list';
import { Metadata } from 'next';
import { publicService } from '@/services/public.service';
import { getPageMetadata } from '@/lib/seo';
import { SEOStructuredData } from '@/components/Public/seo-structured-data';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/careers', {
    title: 'Join the Pioneers of Autonomous Hiring | B2linq Careers',
    description: 'Help us build the next generation of recruitment infrastructure. Explore open roles and shape the future of autonomous agentic work.',
  });
}

export default async function CareersPage() {
  let jobs = [];
  try {
    jobs = await publicService.getCareers();
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    jobs = [];
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.b2linq.in'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Careers',
        'item': 'https://www.b2linq.in/careers'
      }
    ]
  };

  // Dynamically map active jobs into Schema.org JobPosting format
  const jobPostingSchemas = jobs.map((job: any) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.role,
    'description': job.description || `Position for ${job.role} in our ${job.department} department.`,
    'datePosted': job.created_at || new Date().toISOString(),
    'hiringOrganization': {
      '@type': 'Organization',
      'name': 'B2linq',
      'sameAs': 'https://www.b2linq.in'
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location || 'Remote',
        'addressCountry': 'US'
      }
    },
    'employmentType': job.job_type || 'FULL_TIME'
  }));

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden min-h-screen font-sans selection:bg-indigo-100 transition-colors duration-300 relative">
      <SEOStructuredData data={[breadcrumbData, ...jobPostingSchemas]} />
      <Header />

      
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full pt-32">
        <section className="px-6 max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-8">
             We are hiring!
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6 transition-colors duration-300">
            Build the <span className="text-indigo-600 dark:text-indigo-400">Infrastructure</span> of Tomorrow.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
            We are a small, high-conviction team working on some of the most interesting problems in fintech and AI.
          </p>
        </section>

        <CareersList jobs={jobs} />

        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 transition-colors duration-300">Don't see a fit?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 transition-colors duration-300">We are always looking for exceptional talent. Drop us a line.</p>
            <a href="mailto:careers@b2linq.in" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-4">
              careers@b2linq.in
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
