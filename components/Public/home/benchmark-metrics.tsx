'use client';

import { Activity, CheckCircle, TrendingUp, Zap, BarChart3, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BenchmarkMetrics() {
  const stats = [
    {
      label: 'F1 Score',
      value: '92.0%',
      description: 'Optimal balance of recall and precision',
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40',
    },
    {
      label: 'Precision',
      value: '98.9%',
      description: 'Only 1 false positive out of 100 shortlist candidates',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
    },
    {
      label: 'Recall',
      value: '86.0%',
      description: '86% of actual relevant specialists shortlisted',
      icon: CheckCircle,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/40',
    },
    {
      label: 'Throughput Speed',
      value: '43.2 Resumes/min',
      description: 'Screened 100 resumes concurrently in 138 seconds',
      icon: Zap,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40',
    },
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-900 transition-colors duration-300">
      
      {/* Decorative Radial Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
            <BarChart3 className="w-3.5 h-3.5" /> Empirical Performance Metrics
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-4 transition-colors duration-300">
            Verified Production-Grade Accuracy.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto transition-colors duration-300">
            Real-world performance indicators compiled via concurrent load testing of 200 resumes (IT specialists and non-IT control groups) against a standardized job specification.
          </p>
        </div>

        {/* 4-Column Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 relative group"
            >
              {/* Floating Glow Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </span>
                <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center shrink-0", stat.bgColor)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                  {stat.value}
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal font-medium">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Class Comparison Details */}
        <div className="mt-12 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-8 rounded-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Clear Skill Separation & Classification
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              During evaluation, the system demonstrated excellent classification boundaries. The average score of relevant IT specialists was **74.7 points**, whereas the average score of non-relevant control applicants (HR, Sales, Hospitality) was only **25.9 points**—establishing a massive **48.8-point ATS safety margin**.
            </p>
          </div>
          
          {/* Visual Bar Comparison Chart */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
            {/* Relevant Score Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Mean Score (Relevant IT)</span>
                <span>74.7%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '74.7%' }} />
              </div>
            </div>

            {/* Non-Relevant Score Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-500">Mean Score (Non-Relevant Control)</span>
                <span>25.9%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '25.9%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
