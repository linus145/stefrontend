'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 text-center max-w-4xl mx-auto relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.06)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-6 leading-tight transition-colors duration-300">
          Ready to automate your <br className="hidden sm:inline" /> <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">hiring orchestration?</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl transition-colors duration-300">
          Connect B2Linq with your existing applicant workflows today and discover talent with the speed and accuracy of autonomous AI agents.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 px-10 rounded-xl bg-[#0a66c2] text-white shadow-lg shadow-blue-100 dark:shadow-none hover:shadow-xl hover:shadow-blue-200 dark:hover:shadow-none hover:bg-[#084e96] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-bold text-base">
              Get Started Free
            </Button>
          </Link>
          <Link href="/book-demo" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all font-bold text-base shadow-sm">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
