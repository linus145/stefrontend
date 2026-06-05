import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';
import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { DemoShell } from '@/components/seedemo/demo-shell';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/seedemo', {
    title: 'Interactive System Demo | B2linq Hiring Platform',
    description: 'Explore and interact with B2linq\'s autonomous recruiter tools, technical interview pipeline, HR administration tools, and self-service employee portal.',
  });
}

export default function SeeDemoPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden selection:bg-indigo-150">
      
      {/* Decorative background grid and blurs */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed top-1/3 left-0 w-80 h-80 bg-purple-200/10 dark:bg-purple-950/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-0 w-80 h-80 bg-indigo-200/10 dark:bg-indigo-950/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="flex-1 w-full pt-20 relative z-10">
        <DemoShell />
      </main>

      <Footer />
    </div>
  );
}
