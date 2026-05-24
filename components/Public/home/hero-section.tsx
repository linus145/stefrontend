'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Zap, CheckCircle2, Clock, Users, ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-36 sm:pt-40 lg:pt-48 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-100 bg-white/80 px-4 py-1.5 text-xs text-indigo-700 backdrop-blur-md mb-8 shadow-sm hover:shadow-indigo-50/50 transition-all duration-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
        </span>
        <span className="font-semibold tracking-wide uppercase text-[10px]">Autonomous Agentic Infrastructure</span>
      </div>

      <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.05] max-w-4xl">
        The autonomous <br className="hidden sm:inline" /> hiring <span className="relative inline-block text-indigo-600 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">orchestration platform.</span>
      </h1>

      <p className="text-base sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl text-center">
        Deploy active, specialized AI agents that autonomously source, parse profiles, screen core capabilities, interview candidates, and deliver highly-precise hiring verdicts in minutes.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
        <Link href="/book-demo" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-13 px-8 rounded-xl bg-[#0a66c2] text-white shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 hover:bg-[#084e96] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group">
            Book Custom Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </Link>
        <Link href="#interactive-flow" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto h-13 px-8 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold flex items-center justify-center gap-2 shadow-sm">
            <Play className="w-4 h-4 text-[#0a66c2] fill-[#0a66c2]" /> Watch Live Flow
          </Button>
        </Link>
      </div>

      {/* Centered Metrics Row */}
      <div className="flex flex-nowrap overflow-x-auto justify-start lg:justify-center items-center gap-6 sm:gap-8 md:gap-12 border-t border-slate-200/60 pt-8 pb-4 w-full max-w-full px-4 lg:px-0 no-scrollbar">
        <div className="text-center group shrink-0">
          <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
            <Bot className="w-5 h-5 text-indigo-500" />
            <span>5</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Active Hiring Agents</div>
        </div>
        <div className="h-8 w-px bg-slate-200/60 shrink-0" />
        
        <div className="text-center group shrink-0">
          <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>12x</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Orchestration Speed</div>
        </div>
        <div className="h-8 w-px bg-slate-200/60 shrink-0" />
        
        <div className="text-center group shrink-0">
          <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>95%</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Matching Accuracy</div>
        </div>
        <div className="h-8 w-px bg-slate-200/60 shrink-0" />

        <div className="text-center group shrink-0">
          <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span>16h+</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Time Saved</div>
        </div>
        <div className="h-8 w-px bg-slate-200/60 shrink-0" />

        <div className="text-center group shrink-0">
          <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
            <Users className="w-5 h-5 text-purple-500" />
            <span>90%</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Human Power Saved</div>
        </div>
      </div>
    </section>
  );
}
