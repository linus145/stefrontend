'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PlanOverviewProps {
  planName: string;
  planPrice: number;
  isActive: boolean;
  isPending: boolean;
  isFree: boolean;
  latestPayment: any;
  getNextRenewalDate: () => string;
  setShowPlans: (show: boolean) => void;
}

export function PlanOverview({
  planName,
  planPrice,
  isActive,
  isPending,
  isFree,
  latestPayment,
  getNextRenewalDate,
  setShowPlans,
}: PlanOverviewProps) {
  return (
    <div className="bg-card border border-border rounded-md p-6 shadow-sm relative overflow-hidden">
      {/* Ambient Background Glow for active premium */}
      {isActive && (
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] bg-emerald-500/10 dark:bg-emerald-500/5 -z-10" />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Plan</span>
          <h4 className="text-2xl font-bold text-foreground tracking-tight mt-1 flex items-center gap-2">
            {planName}
            {isActive && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active
              </span>
            )}
            {isPending && latestPayment?.status === 'pending' && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-450 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                Pending Verification
              </span>
            )}
            {isPending && (!latestPayment || latestPayment?.status === 'rejected') && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Payment Required
              </span>
            )}
            {isFree && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
                Free Tier
              </span>
            )}
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {isFree && "Access is limited to the candidate job application portal. Upgrade to unlock full HRMS tools."}
            {isPending && latestPayment?.status === 'pending' && `Your transaction Ref: ${latestPayment?.transaction_id} is under review by our admin team.`}
            {isPending && (!latestPayment || latestPayment?.status === 'rejected') && `UPI transfer verification is required to unlock your ${planName} workspace.`}
            {isActive && `Enjoy full startup ATS pipeline automation, employee self-service, and AI resume screening.`}
          </p>
        </div>
        <div className="shrink-0">
          <div className="flex items-baseline text-slate-900 dark:text-white">
            <span className="text-xl font-bold mr-0.5">₹</span>
            <span className="text-3xl font-bold tracking-tight">
              {Number(planPrice) === 0 ? '0' : Number(planPrice).toLocaleString('en-IN')}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold ml-1">/ mo</span>
          </div>
        </div>
      </div>

      {/* Plan Status details / billing info */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-muted/20 border border-border/50 rounded-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billing Cycle</p>
            <p className="font-semibold text-foreground mt-1">Monthly billing</p>
          </div>
          <div className="p-3 bg-muted/20 border border-border/50 rounded-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next Invoice Date</p>
            <p className="font-semibold text-foreground mt-1">{isFree ? "N/A" : getNextRenewalDate()}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => setShowPlans(true)}
            className="h-9 px-4 rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs shadow-sm shadow-[#0a66c2]/10 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {isFree ? (
              <>
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Change Plan</span>
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
