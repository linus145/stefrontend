'use client';

import { Database, Workflow, Bot } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
          Engineered for absolute accuracy.
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Every agent plays a dedicated, specialized role in translating resume metadata and assessment intelligence into high-quality hiring choices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">AI Resume Intelligence</h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            Advanced NLP parsing engine scans, processes, and extracts critical professional experience and dynamic project metrics with exceptional precision.
          </p>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
            <Workflow className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">ATS Infrastructure</h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            Connect and streamline team hiring tracks. Automatically triggers next stages, follow-ups, and organizes visual feedback pipelines easily.
          </p>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Agentic Search</h3>
          <p className="text-slate-500 leading-relaxed text-sm">
            Proactive discovery scans global talent channels and flags candidates matching configured job descriptions before they even submit.
          </p>
        </div>

      </div>
    </section>
  );
}
