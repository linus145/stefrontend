'use client';

import { Database, Workflow, Bot } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4 transition-colors duration-300">
          Engineered for absolute accuracy.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed transition-colors duration-300">
          Every agent plays a dedicated, specialized role in translating resume metadata and assessment intelligence into high-quality hiring choices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:-translate-y-1 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3 transition-colors duration-300">AI Resume Intelligence</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
            Advanced NLP parsing engine scans, processes, and extracts critical professional experience and dynamic project metrics with exceptional precision.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:-translate-y-1 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
            <Workflow className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3 transition-colors duration-300">ATS Infrastructure</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
            Connect and streamline team hiring tracks. Automatically triggers next stages, follow-ups, and organizes visual feedback pipelines easily.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:-translate-y-1 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3 transition-colors duration-300">Agentic Search</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm transition-colors duration-300">
            Proactive discovery scans global talent channels and flags candidates matching configured job descriptions before they even submit.
          </p>
        </div>

      </div>
    </section>
  );
}
