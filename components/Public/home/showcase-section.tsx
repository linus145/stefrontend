'use client';

import { Workflow, Bot } from 'lucide-react';
import { InteractiveAgentFlow } from '@/components/Public/home/interactive-agent-flow';
import { InteractiveChatAgent } from '@/components/Public/home/interactive-chat-agent';

export function ShowcaseSection() {
  return (
    <section id="interactive-flow" className="relative py-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
          <Workflow className="w-3.5 h-3.5" /> Pipeline Showcase
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-4 animate-pulse transition-colors duration-300">
          The Agentic Workflow in Action
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed transition-colors duration-300">
          Observe how incoming profiles travel along coordinated paths, triggering specialized agent layers to extract details, screen qualifications, conduct AI evaluations, and finalize hiring recommendations.
        </p>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-16 justify-center z-10">
        <InteractiveAgentFlow />
        
        {/* Cooperative Agentic Chat Flow Showcase */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-16 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Bot className="w-3.5 h-3.5" /> Interactive Command Center
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-2 transition-colors duration-300">
              Execute Real-Time Agentic Actions
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-colors duration-300">
              Instruct cooperative agent nodes to compile JDs, query bank ledgers to run monthly payroll, or execute employee onboarding packages instantly.
            </p>
          </div>
          
          <InteractiveChatAgent />
        </div>
      </div>
    </section>
  );
}
