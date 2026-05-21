import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bot, Cpu, Users, GitBranch, ArrowRight, Zap, Play, Clock,
  RefreshCw, CheckCircle2, ShieldCheck, Database, Layers, Sparkles,
  Terminal, FileText, BarChart3, Star, Briefcase, Network, Radio,
  Workflow, ArrowUpRight, Search, ClipboardCheck, Video, Award, ChevronRight
} from 'lucide-react';
import { InteractiveAgentFlow } from '@/components/Public/home/interactive-agent-flow';

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-indigo-100 relative">

      {/* Dynamic Background Layout elements */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-0 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* Embedded CSS Animations for page-wide decorative effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes flowDash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .flow-path-animated {
          stroke-dasharray: 8 6;
          animation: flowDash 1.2s linear infinite;
        }
      `}} />

      <Header />

      <main className="relative z-10 w-full">

        {/* ================= HERO SECTION ================= */}
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

        {/* ================= SIGNATURE SHOWCASE: INTERACTIVE ORCHESTRATION ENGINE ================= */}
        <section id="interactive-flow" className="relative py-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
              <Workflow className="w-3.5 h-3.5" /> Pipeline Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 animate-pulse">
              The Agentic Workflow in Action
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Observe how incoming profiles travel along coordinated paths, triggering specialized agent layers to extract details, screen qualifications, conduct AI evaluations, and finalize hiring recommendations.
            </p>
          </div>

          <div className="w-full max-w-6xl flex justify-center z-10">
            <InteractiveAgentFlow />
          </div>
        </section>

        {/* ================= VALUE PROPOSITION ================= */}
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


        {/* ================= FLOW & FEATURES GRID ================= */}
        <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">

            {/* PLATFORM FLOW (Left Side) */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">The execution engine.</h2>
                <p className="text-slate-400 text-base">Autonomous pipelines orchestration managing the full hiring flow.</p>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">

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


        {/* ================= AI OPERATING SYSTEM ================= */}
        <section className="py-28 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 shadow-md mb-8">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The Operating System for Recruitment.</h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Configure agent workflows that autonomously align with your company's hiring standards and security parameters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            <div className="bg-white border border-slate-200/60 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-8">
              <h4 className="text-slate-950 font-bold text-base mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-500" /> Autonomous Flow
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Configure candidate routing pathways. Let autonomous agents dispatch assessments and verify credentials on the fly.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-8">
              <h4 className="text-slate-950 font-bold text-base mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" /> Structured Scorecards
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Review automated technical feedback checklists. Deep-dive skill indexes and analyze communication soft metrics immediately.
              </p>
            </div>

            <div className="bg-white border border-slate-200/60 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-3xl p-8">
              <h4 className="text-slate-950 font-bold text-base mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Enterprise Safety
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Maintain absolute compliance. Every agent actions within strict GDPR policies and configurable organization scopes.
              </p>
            </div>
          </div>
        </section>


        {/* ================= WHY B2LINQ (COMPARISON) ================= */}
        <section className="py-24 px-6 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                Redefining the hiring pipeline.
              </h2>
              <p className="text-slate-500 text-sm">
                See how B2Linq agentic automation transforms the manual administrative load of traditional hiring channels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl relative hover:shadow-md transition-all duration-300">
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Traditional ATS Pipelines</h3>
                <ul className="space-y-4 text-slate-500 text-sm font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">✕</span>
                    Sifting through hundreds of resumes manually
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">✕</span>
                    Hours spent scheduling and managing initial screens
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">✕</span>
                    Inconsistent scoring criteria across candidate pools
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold">✕</span>
                    High drop-off rates due to long response delays
                  </li>
                </ul>
              </div>

              <div className="bg-white border-2 border-indigo-500/20 shadow-lg p-8 rounded-3xl relative hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 ring-4 ring-indigo-50/50">
                <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow">Active Agent OS</div>
                <h3 className="text-sm font-bold text-indigo-600 mb-6 uppercase tracking-widest">B2Linq Autonomous OS</h3>
                <ul className="space-y-4 text-slate-800 text-sm font-semibold">
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">✓</span>
                    Autonomous sourcing agents scan global talent pools
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">✓</span>
                    Autonomous screening runs immediately on ingestion
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">✓</span>
                    Dynamic AI Voice interviews happen in under 3 minutes
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">✓</span>
                    Consolidated structured verdicts delivered to hiring teams
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PLATFORM TOOLS & CORE MODULES ================= */}
        <section className="py-24 px-6 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.02)_0%,transparent_60%)] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Platform Workspaces
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                Our Flagship Workspaces
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empower your recruiters and operations managers with deep, dedicated control centers designed to orchestrate technical talent and organizational workloads.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

              {/* Product Card 1: Recruiter Dashboard */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-600" />

                <div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    Recruiter Dashboard <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-sm mb-6">
                    A centralized command center for talent acquisition. Manage job postings, track applicant pipelines, deploy autonomous agents, and evaluate comprehensive AI-driven candidate scorecards.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-6 mb-6 border-t border-slate-100 pt-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Core Module</span>
                      <span className="text-xs font-semibold text-slate-700">Talent Orchestration</span>
                    </div>
                    <div className="w-px h-8 bg-slate-150" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Features</span>
                      <span className="text-xs font-semibold text-slate-700">Agents & Scorecards</span>
                    </div>
                  </div>

                  <Link href="/recruiter" className="flex items-center justify-center w-full h-11 rounded-xl bg-[#0a66c2] text-white font-semibold shadow hover:bg-[#084e96] hover:-translate-y-0.5 transition-all duration-200">
                    Enter Recruiter Dashboard
                  </Link>
                </div>
              </div>

              {/* Product Card 2: Interview Pipeline */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-600" />

                <div>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-5 h-5 text-indigo-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    Interview Pipeline <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-sm mb-6">
                    A technical evaluation center housing real-time voice call transcripts, AI-driven dynamic testing question banks, and custom circular score radial metrics. Screen candidates with complete domain integrity.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-6 mb-6 border-t border-slate-100 pt-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Core Module</span>
                      <span className="text-xs font-semibold text-slate-700">AI Screenings</span>
                    </div>
                    <div className="w-px h-8 bg-slate-150" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Features</span>
                      <span className="text-xs font-semibold text-slate-700">JSON Logs</span>
                    </div>
                  </div>

                  <Link href="/recruiter/AIInterviews" className="flex items-center justify-center w-full h-11 rounded-xl border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                    Enter Interview Pipeline
                  </Link>
                </div>
              </div>

              {/* Product Card 3: HR Tool */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-purple-600" />

                <div>
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    HR Tool Dashboard <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-sm mb-6">
                    A modern multi-tenant administration workspace supporting real-time shift models attendance trackers, soft-deletion synchronizing filters, manager leave approval dashboards, and granular organizational scoping.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-6 mb-6 border-t border-slate-100 pt-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Core Module</span>
                      <span className="text-xs font-semibold text-slate-700">Attendance Sync</span>
                    </div>
                    <div className="w-px h-8 bg-slate-150" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Features</span>
                      <span className="text-xs font-semibold text-slate-700">Admin controls</span>
                    </div>
                  </div>

                  <Link href="/recruiter/login" className="flex items-center justify-center w-full h-11 rounded-xl border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                    Enter HR Dashboard
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= CTA SECTION ================= */}
        <section className="py-32 px-6 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.06)_0%,transparent_50%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
              Ready to automate your <br className="hidden sm:inline" /> <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">hiring orchestration?</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl">
              Connect B2Linq with your existing applicant workflows today and discover talent with the speed and accuracy of autonomous AI agents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-14 px-10 rounded-xl bg-[#0a66c2] text-white shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 hover:bg-[#084e96] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-bold text-base">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/book-demo" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold text-base shadow-sm">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
