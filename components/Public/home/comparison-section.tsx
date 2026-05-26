'use client';

export function ComparisonSection() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4 transition-colors duration-300">
            Redefining the hiring pipeline.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">
            See how B2Linq agentic automation transforms the manual administrative load of traditional hiring channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl relative hover:shadow-md transition-all duration-300">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-widest">Traditional ATS Pipelines</h3>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors duration-300">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold">✕</span>
                Sifting through hundreds of resumes manually
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold">✕</span>
                Hours spent scheduling and managing initial screens
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold">✕</span>
                Inconsistent scoring criteria across candidate pools
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold">✕</span>
                High drop-off rates due to long response delays
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/20 dark:border-indigo-500/30 shadow-lg p-8 rounded-3xl relative hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 ring-4 ring-indigo-50/50 dark:ring-indigo-950/20">
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow">Active Agent OS</div>
            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-6 uppercase tracking-widest">B2Linq Autonomous OS</h3>
            <ul className="space-y-4 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors duration-300">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-550/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-450 text-[10px] font-bold">✓</span>
                Autonomous sourcing agents scan global talent pools
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-550/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-450 text-[10px] font-bold">✓</span>
                Autonomous screening runs immediately on ingestion
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-550/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-450 text-[10px] font-bold">✓</span>
                Dynamic AI Voice interviews happen in under 3 minutes
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-550/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-450 text-[10px] font-bold">✓</span>
                Consolidated structured verdicts delivered to hiring teams
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
