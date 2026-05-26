'use client';

import { Video, Layers, Cpu, BarChart3 } from 'lucide-react';

export function ExecutionEngine() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">

        {/* PLATFORM FLOW (Left Side) */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">The execution engine.</h2>
            <p className="text-slate-400 text-base">Autonomous pipelines orchestration managing the full hiring flow.</p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">

            <div className="relative flex items-start gap-6 group">
              <div className="z-10 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 font-bold text-sm shrink-0 transition-colors duration-300 group-hover:border-indigo-500">1</div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Apply & Analyze</h4>
                <p className="text-slate-400 leading-relaxed text-sm">Candidates drop CVs into intelligent matching points, initiating real-time parsing workflows.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-6 group">
              <div className="z-10 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 font-bold text-sm shrink-0 transition-colors duration-300 group-hover:border-indigo-500">2</div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Screen & Interview</h4>
                <p className="text-slate-400 leading-relaxed text-sm">Deep matching correlation and comprehensive capabilities analysis verified via live custom voice interviews.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-6 group">
              <div className="z-10 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 font-bold text-sm shrink-0 transition-colors duration-300 group-hover:border-indigo-500">3</div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Review & Hire</h4>
                <p className="text-slate-400 leading-relaxed text-sm">Hiring managers assess candidate matching intelligence to confidently finalize onboard decisions.</p>
              </div>
            </div>

          </div>
        </div>

        {/* FEATURES GRID (Right Side) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Video className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-white font-bold mb-2">AI Voice Interviews</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Dynamic structured capability checks and conversational assessments tailored to exact role specs.</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-white font-bold mb-2">Recruiter Workspace</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Unified control center with shared assessment grids, scoring graphs, and candidate history.</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-white font-bold mb-2">Process Automation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">System automates emails, stage transitions, interview slots scheduling, and background checks.</p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-white font-bold mb-2">HR Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Predictive analytics scoring recruitment patterns, drop-off dynamics, and onboarding success.</p>
          </div>

        </div>

      </div>
    </section>
  );
}
