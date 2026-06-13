import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';
import { HeroSection } from '@/components/Public/home/hero-section';
import { ShowcaseSection } from '@/components/Public/home/showcase-section';
import { FeaturesSection } from '@/components/Public/home/features-section';
import { ExecutionEngine } from '@/components/Public/home/execution-engine';
import { OperatingSystem } from '@/components/Public/home/operating-system';
import { ComparisonSection } from '@/components/Public/home/comparison-section';
import { FlagshipWorkspaces } from '@/components/Public/home/flagship-workspaces';
import { CtaSection } from '@/components/Public/home/cta-section';
import { BenchmarkMetrics } from '@/components/Public/home/benchmark-metrics';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/', {
    title: 'B2linq Platform | Autonomous Hiring Orchestration',
    description: 'Deploy specialized AI agents that autonomously source talent, screen capabilities, conduct structured voice interviews, and deliver precise hiring verdicts in minutes—from sourcing to handshake.',
  });
}

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden min-h-screen font-sans selection:bg-indigo-100 relative">

      {/* Dynamic Background Layout elements */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Embedded CSS Animations for page-wide decorative effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes flowDash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .flow-path-animated {
          stroke-dasharray: 8 6;
          animation: flowDash 1.2s linear infinite;
        }
      `}} />

      <Header />

      <main className="relative z-10 w-full">
        <HeroSection />
        <ShowcaseSection />
        <FeaturesSection />
        <BenchmarkMetrics />
        <ExecutionEngine />
        <OperatingSystem />
        <ComparisonSection />
        <FlagshipWorkspaces />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

