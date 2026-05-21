import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { BookDemoForm } from '@/components/Public/book-demo/book-demo-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Custom Demo | B2linq Platform',
  description: 'Book a custom demo of our autonomous hiring orchestration engine.',
};

export default function BookDemoPage() {
  return (
    <div className="bg-slate-50 text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-indigo-100 relative">
      
      {/* Decorative Glow Elements */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="relative z-10 w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BookDemoForm />
      </main>

      <Footer />
    </div>
  );
}
