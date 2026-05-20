import React from 'react';
import { Badge } from '@/components/ui/badge';

// Static seed templates to fallback on or display initially
export const DEFAULT_TEMPLATES = [
  {
    id: 'default-payroll-1',
    name: 'Standard Monthly Pay Stub Outline',
    category: 'PAYROLL',
    category_display: 'Payroll Related',
    content: `# MONTHLY SALARY STATEMENT

**Employer:** B2Linq Technologies Inc
**Employee Name:** {{employee_name}}
**Employee ID:** {{employee_id}}
**Pay Period:** {{pay_period}}

---

### 1. EARNINGS BREAKDOWN
* **Basic Monthly Salary:** {{basic_salary}}
* **House Rent Allowance (HRA):** {{hra}}
* **Overtime Bonus Amount:** {{overtime}}
* **Other Reimbursements:** {{reimbursements}}

**Gross Salary Amount:** {{gross_salary}}

---

### 2. DEDUCTIONS & CONTRIBUTION SLABS
* **Professional Income Tax:** {{tax_deductions}}
* **Provident Fund (PF):** {{pf_deductions}}
* **Employee State Insurance (ESI):** {{esi_deductions}}

**Total Slashed Deductions:** {{total_deductions}}

---

### 3. NET PAYOUT SUMMARY
**Net Transferred Payout:** {{net_salary}}

*This is an automated system-generated payroll receipt and does not require a physical signature.*`
  },
  {
    id: 'default-payroll-2',
    name: 'Annual Executive Bonus Release Guidelines',
    category: 'PAYROLL',
    category_display: 'Payroll Related',
    content: `# EXECUTIVE COMPENSATION BONUS SCHEDULE

This document outlines the performance-based bonus structures applicable to all management, executive, and lead roles inside B2Linq.

### KEY METRICS:
1. **Corporate Milestone Attainment:** 40% Weightage
2. **Individual Product KPI Index:** 40% Weightage
3. **Managerial Peer Reviews:** 20% Weightage

### TRANSFERS:
* Calculated quarterly.
* Transferred with standard payroll in the month following evaluation.
* Fully taxable as regular income as per country legislation.`
  },
  {
    id: 'default-offer-1',
    name: 'Graduate Software Engineer Offer Letter',
    category: 'OFFER_LETTER',
    category_display: 'Offer Letter',
    content: `Dear {{candidate_name}},

On behalf of B2Linq Technologies, we are thrilled to offer you the position of **Software Engineer**!

We were exceptionally impressed by your technical assessments and alignment with our product ecosystem.

### Key Offer Parameters:
* **Joining Date:** {{joining_date}}
* **Base CTC Salary:** {{annual_salary}}
* **Primary Workplace:** {{workplace_mode}} (Remote / Hybrid)
* **Reporting Manager:** {{reporting_manager}}

Please review this letter, sign it, and return a copy to the onboarding department within 5 business days.

Warm regards,
**The B2Linq Talent Team**`
  },
  {
    id: 'default-joining-1',
    name: 'Standard Executive Joining Agreement',
    category: 'JOINING_LETTER',
    category_display: 'Joining Letter',
    content: `# EMPLOYEE DECK & JOINING AGREEMENT

Welcome to B2Linq! This joining covenant establishes the operational parameters of your day-to-day engagement with the company.

### 1. Day-One Setup
* Complete Aadhaar & PAN authentication checks.
* Provision B2Linq cloud workspace profile.
* Set up direct salary bank account details.

### 2. Confidentiality & NDA
* You agree not to disclose proprietary codebase structures, client portfolios, or algorithmic solutions to any third-party entities during or after your tenure.

### 3. Workspace Compliance
* Hours and shifts must comply with local regional settings defined inside B2Linq HR Dashboard.`
  }
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper functions for template parsing and premium visual rendering
export const extractPlaceholders = (content: string): string[] => {
  if (!content) return [];
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const matches = [...content.matchAll(regex)];
  const variables = matches.map(m => m[1]);
  return Array.from(new Set(variables));
};

export const parseMarkdownInline = (text: string) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-slate-905 dark:text-white">{part}</strong>;
    }
    return part;
  });
};

export const replacePlaceholders = (text: string, variables: Record<string, string> = {}) => {
  const regexPlaceholder = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const matches = [...text.matchAll(regexPlaceholder)];
  if (matches.length === 0) {
    return parseMarkdownInline(text);
  }
  
  let lastIdx = 0;
  let key = 0;
  const nodes: React.ReactNode[] = [];
  
  for (const m of matches) {
    const start = m.index!;
    const end = start + m[0].length;
    const varName = m[1];
    
    if (start > lastIdx) {
      nodes.push(...parseMarkdownInline(text.substring(lastIdx, start)));
    }
    
    if (variables[varName] !== undefined && variables[varName] !== '') {
      nodes.push(
        <span key={`var-${key++}`} className="font-extrabold text-[#0a66c2] dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">
          {variables[varName]}
        </span>
      );
    } else {
      nodes.push(
        <span key={`ph-${key++}`} className="font-bold text-amber-600 dark:text-amber-455 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15 animate-pulse text-[10px]">
          {`{{${varName}}}`}
        </span>
      );
    }
    
    lastIdx = end;
  }
  
  if (lastIdx < text.length) {
    nodes.push(...parseMarkdownInline(text.substring(lastIdx)));
  }
  
  return nodes;
};

export const renderFormattedContent = (content: string, variables: Record<string, string> = {}) => {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-2 font-sans text-[11px] text-slate-700 dark:text-slate-355 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed === '---') {
          return <hr key={idx} className="my-4 border-slate-100 dark:border-slate-800" />;
        }

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-sm font-black text-[#0a66c2] dark:text-blue-400 tracking-tight mt-4 mb-2 uppercase">
              {replacePlaceholders(trimmed.substring(2), variables)}
            </h1>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs font-bold text-slate-900 dark:text-slate-150 mt-3 mb-1 uppercase tracking-wide">
              {replacePlaceholders(trimmed.substring(4), variables)}
            </h3>
          );
        }

        const isBullet = trimmed.startsWith('* ');
        const isNumbered = /^\d+\.\s/.test(trimmed);
        if (isBullet || isNumbered) {
          const contentStart = isBullet ? 2 : trimmed.indexOf(' ') + 1;
          const cleanText = trimmed.substring(contentStart);
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="text-[#0a66c2] dark:text-blue-400 font-bold mt-0.5">•</span>
              <p className="flex-1">
                {replacePlaceholders(cleanText, variables)}
              </p>
            </div>
          );
        }

        if (trimmed === '') {
          return <div key={idx} className="h-1.5" />;
        }

        return (
          <p key={idx}>
            {replacePlaceholders(line, variables)}
          </p>
        );
      })}
    </div>
  );
};

export const renderDocumentTheme = (category: string, content: string, variables: Record<string, string> = {}) => {
  const contentNode = renderFormattedContent(content, variables);
  
  if (category === 'OFFER_LETTER') {
    return (
      <div className="relative overflow-hidden border-t-4 border-indigo-600 bg-white dark:bg-[#0c0d19] p-8 shadow-xl min-h-[450px] font-sans flex flex-col justify-between rounded-b-md transition-all duration-300">
        {/* Modern corporate watermarks / background decoration */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-50/40 dark:bg-indigo-950/10 pointer-events-none blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-50/30 dark:bg-blue-950/5 pointer-events-none blur-3xl" />

        <div>
          {/* Header Layout */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-xs shadow-sm">
                  B
                </div>
                <span className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-tight">
                  {variables['organization_name'] || 'B2LINQ TECHNOLOGIES INC'}
                </span>
              </div>
              <span className="text-[9px] text-slate-455 dark:text-slate-400 font-bold uppercase tracking-widest block leading-tight">Corporate HR Operations</span>
            </div>
            
            <div className="text-left sm:text-right space-y-1">
              <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/60 shadow-none text-[8px] font-extrabold uppercase rounded-md px-2 py-0.5 tracking-wider">
                Strictly Confidential
              </Badge>
              <div className="text-[9px] text-slate-400 font-medium">Ref: B2L/OFFER/2026/{(variables['employee_id'] || 'TEMP')}</div>
            </div>
          </div>

          {/* Letter Body Area */}
          <div className="pl-1 pr-1 text-slate-700 dark:text-slate-300 space-y-4">
            {contentNode}
          </div>
        </div>

        {/* Dynamic Verification Seal & Signature Area */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-[10px]">
          {/* Circular Verification Seal Stamp */}
          <div className="relative flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-550 dark:bg-emerald-400 animate-pulse" />
            <span className="text-[8px] text-emerald-800 dark:text-emerald-400 font-extrabold uppercase tracking-widest">B2Linq Verified Contract</span>
          </div>

          <div className="flex justify-between w-full sm:w-auto gap-12">
            <div className="space-y-1.5">
              <div className="h-6 flex items-end">
                <span className="font-serif italic text-indigo-650 dark:text-indigo-400 font-bold text-xs">HR Management Team</span>
              </div>
              <div className="h-px w-24 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Authorized Signatory</span>
            </div>
            
            <div className="space-y-1.5 text-right">
              <div className="h-6 flex items-end justify-end">
                {variables['candidate_name'] || variables['employee_name'] ? (
                  <span className="font-serif italic text-indigo-655 dark:text-indigo-455 font-bold text-xs">
                    {variables['candidate_name'] || variables['employee_name']}
                  </span>
                ) : (
                  <span className="text-[8px] text-amber-500 animate-pulse font-extrabold font-sans">Awaiting Acceptance</span>
                )}
              </div>
              <div className="h-px w-24 bg-slate-200 dark:bg-slate-800 ml-auto" />
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block font-sans">Candidate Signature</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (category === 'JOINING_LETTER') {
    return (
      <div className="relative border-2 border-double border-slate-250 dark:border-slate-850 bg-white dark:bg-[#0c0d19] p-8 shadow-xl min-h-[450px] font-sans flex flex-col justify-between rounded-md transition-all duration-300">
        {/* Triple Border Visual Accents */}
        <div className="absolute inset-1 border border-slate-100 dark:border-slate-900 pointer-events-none rounded" />
        
        <div className="relative z-10">
          {/* Double-Line Top Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 dark:border-slate-800 pb-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-extrabold text-xs shadow-sm">
                  L
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {variables['organization_name'] || 'B2LINQ TECHNOLOGIES INC'}
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-widest block leading-tight">Official Corporate Placement Board</span>
            </div>
            
            <div className="text-[8px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider text-right">
              <div>Ref: B2L/JOIN/2026/{(variables['employee_id'] || 'TEMP')}</div>
              <div className="text-slate-400 font-normal mt-0.5">Date: {variables['joining_date'] || new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Letter Body Area */}
          <div className="px-1 text-slate-700 dark:text-slate-355 space-y-4">
            {contentNode}
          </div>
        </div>

        {/* Footing Stamps & Signatures */}
        <div className="relative z-10 mt-12 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-[10px]">
          {/* Official Stamp Overlay */}
          <div className="border-2 border-indigo-200/50 dark:border-indigo-900/30 text-indigo-400/80 rounded-md px-3 py-1 font-bold text-[8px] tracking-widest uppercase transform -rotate-2 select-none bg-indigo-50/20 dark:bg-[#151624]/20">
            OFFICIALLY APPROVED
          </div>

          <div className="flex justify-between w-full sm:w-auto gap-12">
            <div className="space-y-1.5">
              <div className="h-6 flex items-end">
                <span className="font-sans text-slate-850 dark:text-slate-200 font-extrabold text-[11px]">Operations & HR Admin</span>
              </div>
              <div className="h-px w-24 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">HR Representative</span>
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-px w-24 bg-slate-200 dark:bg-slate-800 ml-auto" />
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Employee Acknowledgment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT / PAYROLL category
  return (
    <div className="relative bg-white dark:bg-[#0c0d19] border border-slate-200/80 dark:border-slate-800 rounded-md shadow-xl p-8 min-h-[450px] font-sans flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Clean Corporate Grid Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-900 pb-5 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                $
              </div>
              <span className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-tight">
                {variables['organization_name'] || 'B2LINQ TECHNOLOGIES INC'}
              </span>
            </div>
            <span className="text-[8px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-widest block leading-tight">Corporate Payroll & Compensation Board</span>
          </div>
          
          <div className="text-right">
            <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100/50 dark:border-emerald-900/60 shadow-none text-[8px] font-bold uppercase rounded-md px-2 py-0.5">
              Verified Statement
            </Badge>
            <div className="text-[8px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Period: {variables['month'] || '—'} {variables['year'] || '—'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-1 text-slate-700 dark:text-slate-350 space-y-4">
          {contentNode}
        </div>

        {/* Premium Salary Slip Breakdown card */}
        {(variables['basic_salary'] || variables['hra'] || variables['annual_salary']) && (
          <div className="mt-8 bg-slate-50 dark:bg-[#121322] border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-inner">
            <div className="bg-slate-100/50 dark:bg-[#1a1c30] px-4 py-2 border-b border-slate-150 dark:border-slate-850 flex justify-between items-center">
              <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest">Compensation Details</span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450">INR (₹)</span>
            </div>
            
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">BASIC SALARY</span>
                <span className="text-xs font-extrabold text-slate-850 dark:text-white">{variables['basic_salary'] || '—'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">HOUSET RENT ALLOW.</span>
                <span className="text-xs font-extrabold text-slate-850 dark:text-white">{variables['hra'] || '—'}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">TAX DEDUCTIONS</span>
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-455">{variables['tax_amount'] || '—'}</span>
              </div>
              <div className="space-y-0.5 border-l border-slate-150 dark:border-slate-850 pl-4">
                <span className="text-[8px] text-emerald-650 dark:text-emerald-400 block font-bold uppercase tracking-wider">NET DISBURSED</span>
                <span className="text-sm font-black text-emerald-655 dark:text-emerald-400">{variables['annual_salary'] || variables['net_salary'] || '—'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-900 pt-4 mt-12 flex justify-between text-[8px] text-slate-450 font-semibold">
        <span>Generated: {new Date().toLocaleDateString()}</span>
        <span>b2linq.com • System Dispatched</span>
      </div>
    </div>
  );
};
