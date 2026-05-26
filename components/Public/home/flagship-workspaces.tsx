'use client';

import Link from 'next/link';
import { Layers, Briefcase, ArrowUpRight, Video, Users } from 'lucide-react';

export function FlagshipWorkspaces() {
  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.02)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5 text-indigo-600" /> Platform Workspaces
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4 transition-colors duration-300">
            Our Flagship Workspaces
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
            Empower your recruiters and operations managers with deep, dedicated control centers designed to orchestrate technical talent and organizational workloads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {/* Product Card 1: Recruiter Dashboard */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-600" />

            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2 transition-colors duration-300">
                Recruiter Dashboard <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>

              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6 transition-colors duration-300">
                A centralized command center for talent acquisition. Manage job postings, track applicant pipelines, deploy autonomous agents, and evaluate comprehensive AI-driven candidate scorecards.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-6 mb-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Core Module</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">Talent Orchestration</span>
                </div>
                <div className="w-px h-8 bg-slate-150 dark:bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Features</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">Agents & Scorecards</span>
                </div>
              </div>

              <Link href="/recruiter" className="flex items-center justify-center w-full h-11 rounded-xl bg-[#0a66c2] text-white font-semibold shadow hover:bg-[#084e96] hover:-translate-y-0.5 transition-all duration-200">
                Enter Recruiter Dashboard
              </Link>
            </div>
          </div>

          {/* Product Card 2: Interview Pipeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/30 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-600" />

            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2 transition-colors duration-300">
                Interview Pipeline <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>

              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6 transition-colors duration-300">
                A technical evaluation center housing real-time voice call transcripts, AI-driven dynamic testing question banks, and custom circular score radial metrics. Screen candidates with complete domain integrity.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-6 mb-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Core Module</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">AI Screenings</span>
                </div>
                <div className="w-px h-8 bg-slate-150 dark:bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Features</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">JSON Logs</span>
                </div>
              </div>

              <Link href="/recruiter/AIInterviews" className="flex items-center justify-center w-full h-11 rounded-xl border border-indigo-200 dark:border-indigo-850 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-850 hover:text-indigo-800 dark:hover:text-indigo-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                Enter Interview Pipeline
              </Link>
            </div>
          </div>

          {/* Product Card 3: HR Tool */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/30 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-purple-600" />

            <div>
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2 transition-colors duration-300">
                HR Tool Dashboard <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h3>

              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6 transition-colors duration-300">
                A modern multi-tenant administration workspace supporting real-time shift models attendance trackers, soft-deletion synchronizing filters, manager leave approval dashboards, and granular organizational scoping.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-6 mb-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Core Module</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">Attendance Sync</span>
                </div>
                <div className="w-px h-8 bg-slate-150 dark:bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Features</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">Admin controls</span>
                </div>
              </div>

              <Link href="/recruiter/login" className="flex items-center justify-center w-full h-11 rounded-xl border border-purple-200 dark:border-purple-855 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-850 hover:text-purple-800 dark:hover:text-purple-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                Enter HR Dashboard
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
