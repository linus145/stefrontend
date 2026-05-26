'use client';

import { Sparkles, Bot, BarChart3, ShieldCheck } from 'lucide-react';

export function OperatingSystem() {
  return (
    <section className="py-28 px-6 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-md mb-8">
        <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-4 tracking-tight transition-colors duration-300">The Operating System for Recruitment.</h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto transition-colors duration-300">
        Configure agent workflows that autonomously align with your company's hiring standards and security parameters.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-8">
          <h4 className="text-slate-950 dark:text-slate-50 font-bold text-base mb-3 flex items-center gap-2 transition-colors duration-300">
            <Bot className="w-4 h-4 text-indigo-500" /> Autonomous Flow
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
            Configure candidate routing pathways. Let autonomous agents dispatch assessments and verify credentials on the fly.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-8">
          <h4 className="text-slate-950 dark:text-slate-50 font-bold text-base mb-3 flex items-center gap-2 transition-colors duration-300">
            <BarChart3 className="w-4 h-4 text-purple-500" /> Structured Scorecards
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
            Review automated technical feedback checklists. Deep-dive skill indexes and analyze communication soft metrics immediately.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-8">
          <h4 className="text-slate-950 dark:text-slate-50 font-bold text-base mb-3 flex items-center gap-2 transition-colors duration-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Safety
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
            Maintain absolute compliance. Every agent actions within strict GDPR policies and configurable organization scopes.
          </p>
        </div>
      </div>
    </section>
  );
}
