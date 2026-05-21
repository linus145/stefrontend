import React from 'react';
import { Badge } from '@/components/ui/badge';
import { renderFormattedContent, getCompanyAbbreviation } from './templates.helpers';

// ─── Design Theme Registry ──────────────────────────────────────────────────

export interface DesignTheme {
  id: string;
  name: string;
  description: string;
  accentColor: string;     // tailwind bg class for the thumbnail swatch
  previewBorder: string;   // tailwind border class for selector card highlight
}

export const DESIGN_THEMES: DesignTheme[] = [
  {
    id: 'corporate',
    name: 'Corporate Classic',
    description: 'Professional blue letterhead with verification seals',
    accentColor: 'bg-gradient-to-r from-[#0a66c2] to-indigo-500',
    previewBorder: 'border-[#0a66c2]',
  },
  {
    id: 'executive',
    name: 'Executive Premium',
    description: 'Dark luxury theme with gold signature accents',
    accentColor: 'bg-gradient-to-r from-amber-600 to-yellow-500',
    previewBorder: 'border-amber-500',
  },
  {
    id: 'gradient',
    name: 'Modern Gradient',
    description: 'Vibrant gradient header with contemporary layout',
    accentColor: 'bg-gradient-to-r from-violet-600 to-fuchsia-500',
    previewBorder: 'border-violet-500',
  },
  {
    id: 'minimal',
    name: 'Minimal Elegant',
    description: 'Clean whitespace with thin serif typography',
    accentColor: 'bg-gradient-to-r from-slate-700 to-slate-500',
    previewBorder: 'border-slate-500',
  },
];

// ─── Themed Document Renderer ───────────────────────────────────────────────

export const renderThemedDocument = (
  themeId: string,
  content: string,
  variables: Record<string, string> = {}
) => {
  const contentNode = renderFormattedContent(content, variables);
  const orgName = variables['organization_name'] || 'B2LINQ TECHNOLOGIES INC';
  const empName = variables['candidate_name'] || variables['employee_name'] || '';
  const empId   = variables['employee_id'] || 'TEMP';
  const today   = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── DESIGN 1: Corporate Classic ──────────────────────────────────────────
  if (themeId === 'corporate') {
    return (
      <div className="relative overflow-hidden border-t-4 border-[#0a66c2] bg-white dark:bg-[#0c0d19] p-8 shadow-xl min-h-[480px] font-sans flex flex-col justify-between rounded-b-md transition-all duration-300">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-blue-50/40 dark:bg-blue-950/10 pointer-events-none blur-3xl transform-gpu" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-50/30 dark:bg-indigo-950/5 pointer-events-none blur-3xl transform-gpu" />

        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-[#0a66c2] to-indigo-400 flex items-center justify-center text-white font-black text-xs shadow-md uppercase">
                  {orgName[0]}
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {orgName}
                </span>
              </div>
              <span className="text-[9px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-widest block">Corporate HR Operations</span>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <Badge className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/60 shadow-none text-[8px] font-extrabold uppercase rounded-md px-2 py-0.5 tracking-wider">
                Confidential
              </Badge>
              <div className="text-[9px] text-slate-400 font-medium uppercase">Ref: {getCompanyAbbreviation(orgName)}/DOC/2026/{empId}</div>
              <div className="text-[9px] text-slate-400">{today}</div>
            </div>
          </div>

          {/* Body */}
          <div className="pl-1 pr-1 text-slate-700 dark:text-slate-300 space-y-4">
            {contentNode}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-[10px]">
          <div className="relative flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase tracking-widest">{orgName} Verified</span>
          </div>
          <div className="flex gap-12">
            <div className="space-y-1.5">
              <div className="h-6 flex items-end">
                <span className="font-serif italic text-[#0a66c2] dark:text-blue-400 font-bold text-xs">HR Management</span>
              </div>
              <div className="h-px w-24 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Authorized Signatory</span>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-6 flex items-end justify-end">
                {empName ? (
                  <span className="font-serif italic text-[#0a66c2] dark:text-blue-400 font-bold text-xs">{empName}</span>
                ) : (
                  <span className="text-[8px] text-amber-500 animate-pulse font-extrabold font-sans">Awaiting Acceptance</span>
                )}
              </div>
              <div className="h-px w-24 bg-slate-200 dark:bg-slate-800 ml-auto" />
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Recipient</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESIGN 2: Executive Premium ──────────────────────────────────────────
  if (themeId === 'executive') {
    return (
      <div className="relative overflow-hidden bg-[#1a1a2e] text-slate-200 p-8 shadow-2xl min-h-[480px] font-sans flex flex-col justify-between rounded-md border border-amber-900/20 transition-all duration-300">
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-amber-500/40 pointer-events-none rounded-tl-md" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-amber-500/40 pointer-events-none rounded-br-md" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 opacity-80" />

        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-amber-800/30 pb-5 mb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-[#1a1a2e] font-black text-sm shadow-lg shadow-amber-500/20 uppercase">
                  {orgName[0]}
                </div>
                <div>
                  <span className="text-sm font-black text-amber-100 uppercase tracking-widest block">
                    {orgName}
                  </span>
                  <span className="text-[8px] text-amber-500/70 font-semibold uppercase tracking-[0.2em] block">Executive Division</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-none text-[8px] font-extrabold uppercase rounded-sm px-2.5 py-0.5 tracking-[0.15em]">
                ★ Premium
              </Badge>
              <div className="text-[9px] text-amber-600/50 font-medium tracking-wider uppercase">REF: {getCompanyAbbreviation(orgName)}/{empId}/EXC</div>
              <div className="text-[9px] text-amber-600/40">{today}</div>
            </div>
          </div>

          {/* Body - override content colors for dark bg */}
          <div className="pl-1 pr-1 space-y-4 [&_h1]:!text-amber-400 [&_h3]:!text-amber-200 [&_p]:!text-slate-300 [&_strong]:!text-amber-100 [&_span]:!border-amber-500/20" style={{ '--tw-text-opacity': 1 } as React.CSSProperties}>
            {contentNode}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-amber-800/20 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
          {/* Wax-seal style stamp */}
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-amber-500/5">
              <div className="h-10 w-10 rounded-full border border-amber-500/30 flex items-center justify-center">
                <span className="text-amber-400 font-black text-xs tracking-widest uppercase">{getCompanyAbbreviation(orgName)}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-amber-500/60 font-bold uppercase tracking-widest whitespace-nowrap">Certified</div>
          </div>

          <div className="flex gap-12">
            <div className="space-y-1.5">
              <div className="h-6 flex items-end">
                <span className="font-serif italic text-amber-400/80 font-bold text-xs">Director, HR Operations</span>
              </div>
              <div className="h-px w-28 bg-gradient-to-r from-amber-600/40 to-transparent" />
              <span className="text-[8px] text-amber-600/40 font-bold uppercase tracking-wider block">Authorized Signatory</span>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-6 flex items-end justify-end">
                {empName ? (
                  <span className="font-serif italic text-amber-300/80 font-bold text-xs">{empName}</span>
                ) : (
                  <span className="text-[8px] text-amber-500/50 animate-pulse font-bold">Pending</span>
                )}
              </div>
              <div className="h-px w-28 bg-gradient-to-l from-amber-600/40 to-transparent ml-auto" />
              <span className="text-[8px] text-amber-600/40 font-bold uppercase tracking-wider block">Recipient</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESIGN 3: Modern Gradient ────────────────────────────────────────────
  if (themeId === 'gradient') {
    return (
      <div className="relative overflow-hidden bg-white dark:bg-[#0c0d19] shadow-xl min-h-[480px] font-sans flex flex-col justify-between rounded-xl border border-slate-200/50 dark:border-slate-800 transition-all duration-300">
        {/* Gradient Header Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-8 pt-7 pb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-sm border border-white/10 uppercase">
                  {orgName[0]}
                </div>
                <span className="text-base font-black text-white uppercase tracking-tight drop-shadow-sm">
                  {orgName}
                </span>
              </div>
              <span className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em] block pl-[42px]">Human Resources • Document Services</span>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] text-white font-bold uppercase tracking-wider">Active Document</span>
              </div>
              <div className="text-[9px] text-white/50 font-medium">{today}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex-1">
          <div className="text-slate-700 dark:text-slate-300 space-y-4">
            {contentNode}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <div className="pt-5 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-[9px] text-violet-600 dark:text-violet-400 font-extrabold uppercase tracking-widest block">Document Verified</span>
                <span className="text-[8px] text-slate-400 font-medium">Digitally processed by {orgName} HR Suite</span>
              </div>
            </div>

            <div className="flex gap-10">
              <div className="space-y-1.5 text-center">
                <div className="h-6 flex items-end justify-center">
                  <span className="font-semibold text-violet-600 dark:text-violet-400 text-xs">HR Team</span>
                </div>
                <div className="h-0.5 w-20 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full mx-auto" />
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Issuer</span>
              </div>
              <div className="space-y-1.5 text-center">
                <div className="h-6 flex items-end justify-center">
                  {empName ? (
                    <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 text-xs">{empName}</span>
                  ) : (
                    <span className="text-[8px] text-slate-400 animate-pulse font-bold">—</span>
                  )}
                </div>
                <div className="h-0.5 w-20 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-full mx-auto" />
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Recipient</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESIGN 4: Minimal Elegant ────────────────────────────────────────────
  // (default fallback)
  return (
    <div className="relative bg-white dark:bg-[#0c0d19] min-h-[480px] font-serif flex flex-col justify-between transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-md">
      {/* Thin top line */}
      <div className="h-[3px] w-full bg-slate-800 dark:bg-slate-200 rounded-t-md" />

      <div className="p-10">
        {/* Header - minimal serif style */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-lg font-light text-slate-800 dark:text-slate-100 tracking-[0.25em] uppercase block">
              {orgName}
            </span>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
              <span className="text-[9px] text-slate-400 font-normal tracking-[0.3em] uppercase">Official Correspondence</span>
              <div className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-wider">{today}</div>
            <div className="text-[9px] text-slate-400 mt-0.5 tracking-wider">No. {empId}</div>
          </div>
        </div>

        {/* Body */}
        <div className="text-slate-700 dark:text-slate-300 space-y-4 font-sans">
          {contentNode}
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-8">
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-8">
            <div className="space-y-3">
              <span className="text-[9px] text-slate-400 tracking-[0.2em] uppercase block">With regards,</span>
              <div className="space-y-1">
                <span className="text-xs text-slate-700 dark:text-slate-200 font-medium block">Human Resources Department</span>
                <div className="h-px w-32 bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {empName && (
              <div className="space-y-3 text-right">
                <span className="text-[9px] text-slate-400 tracking-[0.2em] uppercase block">Acknowledged by,</span>
                <div className="space-y-1">
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-medium block">{empName}</span>
                  <div className="h-px w-32 bg-slate-200 dark:bg-slate-800 ml-auto" />
                </div>
              </div>
            )}
          </div>

          {/* Minimal brand mark */}
          <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
            <div className="h-px w-6 bg-slate-400" />
            <span className="text-[7px] text-slate-400 tracking-[0.3em] uppercase font-sans">{orgName}</span>
            <div className="h-px w-6 bg-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
