
import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-indigo-100">
      <Header />

      {/* Dynamic Background Layout globally */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full">

        {/* ================= HERO SECTION ================= */}
        <section className="relative flex flex-col items-center justify-center pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-32 px-4 sm:px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/50 px-4 py-1.5 text-xs text-slate-600 backdrop-blur-md mb-8 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 mr-3 animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
            AI-native infrastructure for modern hiring teams.
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">
            The autonomous <br /> hiring <span className="text-indigo-600">platform.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            AI-powered workflows for recruitment, screening, interviews, onboarding, and HR operations. Transform recruitment into intelligent autonomous hiring workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 rounded-xl bg-indigo-600 text-white shadow-sm hover:shadow-md hover:bg-indigo-500 transition-all font-semibold">
                Book Demo
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                Explore Platform
              </Button>
            </Link>
          </div>
        </section>


        {/* ================= METRICS / SOCIAL PROOF ================= */}
        <section className="border-y border-slate-200 bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="pt-4 md:pt-0">
              <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2">12x</p>
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500">Faster Sourcing</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2">90%</p>
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500">Task Automation</p>
            </div>
            <div className="pt-8 md:pt-0">
              <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2">99.8%</p>
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500">Matching Precision</p>
            </div>
          </div>
        </section>


        {/* ================= VALUE PROPOSITION ================= */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md hover:border-indigo-200 transition-all shadow-sm">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Resume Intelligence</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Deep skill extraction and candidate scoring powered by advanced semantic analysis of resumes and portfolios.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md hover:border-indigo-200 transition-all shadow-sm">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">ATS Infrastructure</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Modern pipelines, stage management, and recruiter dashboards for complete applicant tracking and transparency.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden group hover:shadow-md hover:border-indigo-200 transition-all shadow-sm">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Agentic Search</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Proactive talent discovery that identifies the perfect fit across global networks before they even apply.
              </p>
            </div>
          </div>
        </section>


        {/* ================= FLOW & FEATURES GRID ================= */}
        <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* PLATFORM FLOW (Left Side) */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">The execution engine.</h2>
                <p className="text-slate-600 text-lg">Autonomous workflows orchestrating the end-to-end hiring journey.</p>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

                <div className="relative flex items-start gap-6">
                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-indigo-200 text-indigo-600 shadow-sm font-bold text-sm shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">Apply & Analyze</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">Candidates apply through intelligent portals; AI agents instantly parse and analyze applicant data.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-6">
                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-900 shadow-sm font-bold text-sm shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">Screen & Interview</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">Deep skill extraction and match scoring followed by live, dynamic AI-conducted interviews.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-6">
                  <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-900 shadow-sm font-bold text-sm shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">Review & Hire</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">Recruiters receive summarized intelligence to make final calls with automated onboarding support.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* FEATURES GRID (Right Side) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <h4 className="text-slate-900 font-semibold mb-2">AI Interviews</h4>
                <p className="text-xs text-slate-600">Dynamic questioning and real-time evaluation with sentiment analysis.</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <h4 className="text-slate-900 font-semibold mb-2">Recruiter Workspace</h4>
                <p className="text-xs text-slate-600">Collaborative hub for team hiring decisions and candidate management.</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <h4 className="text-slate-900 font-semibold mb-2">Workflow Automation</h4>
                <p className="text-xs text-slate-600">Automated scheduling, follow-ups, and process coordination.</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <h4 className="text-slate-900 font-semibold mb-2">HR Intelligence</h4>
                <p className="text-xs text-slate-600">Predictive insights across your entire hiring funnel and operations.</p>
              </div>
            </div>

          </div>
        </section>


        {/* ================= AI SECTION ================= */}
        <section className="py-32 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm mb-8">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">The operating system for growth.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl p-8">
              <h4 className="text-slate-900 font-semibold mb-3">Autonomous Execution</h4>
              <p className="text-slate-600 text-sm leading-relaxed">AI agents orchestrating end-to-end recruitment workflows with zero manual overhead.</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl p-8">
              <h4 className="text-slate-900 font-semibold mb-3">Hiring Intelligence</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Deep insights into pipeline performance, recruiter productivity, and candidate potential.</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl p-8">
              <h4 className="text-slate-900 font-semibold mb-3">Process Automation</h4>
              <p className="text-slate-600 text-sm leading-relaxed">Streamlining onboarding and HR operations with precision-engineered AI workflows.</p>
            </div>
          </div>
        </section>


        {/* ================= WHY B2LINQ (COMPARISON) ================= */}
        <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl relative hover:shadow-md transition-all">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-widest text-xs">Traditional ATS</h3>
                <ul className="space-y-4 text-slate-500 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Manual candidate screening</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Static hiring pipelines</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Disconnected HR tools</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-indigo-200 shadow-sm p-8 rounded-2xl relative hover:shadow-md transition-all ring-1 ring-indigo-50">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-indigo-600 mb-4 uppercase tracking-widest text-xs">B2Linq Agentic OS</h3>
                <ul className="space-y-4 text-slate-700 text-sm">
                  <li className="flex items-center gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Autonomous AI workflows</li>
                  <li className="flex items-center gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Intelligent hiring coordination</li>
                  <li className="flex items-center gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Self-operating recruitment systems</li>
                </ul>
              </div>
            </div>

          </div>
        </section>


        {/* ================= CTA SECTION ================= */}
        <section className="py-32 px-6 text-center max-w-3xl mx-auto relative">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,rgba(79,70,229,0.05)_0%,transparent_40%)] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-6 relative z-10">
            Transform recruitment into <span className="text-indigo-600">autonomous operations.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 relative z-10">
            Built for modern hiring teams and enterprise workflows. Join the future of workforce technology.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href="/register">
              <Button className="h-14 px-10 rounded-xl bg-indigo-600 text-white shadow-md hover:shadow-lg hover:bg-indigo-500 transition-all font-bold text-base">
                Book Demo
              </Button>
            </Link>
            <Link href="/contactus">
              <Button variant="outline" className="h-14 px-10 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                Contact Sales
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
