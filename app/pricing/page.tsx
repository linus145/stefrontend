import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { PricingTable } from '@/components/Public/pricing/pricing-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans | B2linq Platform',
  description: 'Choose the right hiring orchestration plan. Standardized plans built for teams scaling from growth to enterprise-level intelligence.',
};

export default function PricingPage() {
  return (
    <div className="bg-slate-50 text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-blue-100 relative">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(10,102,194,0.05)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="relative z-10 w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <PricingTable />
      </main>

      <Footer />
    </div>
  );
}
