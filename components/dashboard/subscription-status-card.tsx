'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, AlertCircle, ShieldCheck, Zap, FileCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SubscriptionStatusCard() {
  const { userSubscription } = useAuth();

  const planName = userSubscription?.plan_details?.name || 'Free Tier';
  const planPrice = Number(userSubscription?.plan_details?.price ?? 0);
  const status = userSubscription?.status || 'active';

  const isFree = planPrice === 0;
  const isVerified = userSubscription?.is_payment_verified ?? false;
  const latestPayment = userSubscription?.latest_payment && userSubscription.latest_payment.plan === userSubscription.plan
    ? userSubscription.latest_payment
    : null;

  // A plan is Pending if it is premium AND is_payment_verified is false
  const isPending = !isFree && !isVerified;
  const isActive = !isFree && status === 'active' && isVerified;

  const handleGoToBilling = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Switch to settings section
    window.dispatchEvent(new CustomEvent('dashboard-section-change', { detail: 'settings' }));
    
    // Set tab to Billing and dispatch tab change
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'Billing');
    window.history.replaceState(null, '', url.pathname + url.search);
    window.dispatchEvent(new Event('settings-tab-change'));
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border p-5 transition-all duration-300 shadow-sm",
        isFree && "bg-slate-50/50 dark:bg-slate-900/10 border-slate-205 dark:border-slate-800/80",
        isPending && latestPayment?.status === 'pending' && "bg-amber-500/[0.03] border-amber-500/30 dark:border-amber-500/20 shadow-amber-500/[0.01]",
        isPending && latestPayment?.status === 'rejected' && "bg-rose-500/[0.03] border-rose-500/30 dark:border-rose-500/20 shadow-rose-500/[0.01]",
        isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "bg-amber-500/[0.03] border-amber-500/30 dark:border-amber-500/20 shadow-amber-500/[0.01]",
        isActive && "bg-gradient-to-br from-emerald-500/[0.03] to-indigo-500/[0.03] dark:from-emerald-500/[0.01] dark:to-indigo-500/[0.01] border-emerald-500/20 dark:border-emerald-500/10"
      )}
    >
      {/* Dynamic Background Glow Effect */}
      <div
        className={cn(
          "absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] -z-10 transition-all duration-500 opacity-60",
          isFree && "bg-slate-500/10 dark:bg-slate-500/5",
          isPending && latestPayment?.status === 'rejected' && "bg-rose-500/20 dark:bg-rose-500/10",
          isPending && latestPayment?.status === 'pending' && "bg-amber-500/20 dark:bg-amber-500/10",
          isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "bg-amber-500/20 dark:bg-amber-500/10",
          isActive && "bg-emerald-500/20 dark:bg-emerald-500/10"
        )}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-4 items-start sm:items-center">
          {/* Status Icon */}
          <div
            className={cn(
              "h-10 w-10 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm",
              isFree && "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400",
              isPending && latestPayment?.status === 'pending' && "bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 animate-pulse",
              isPending && latestPayment?.status === 'rejected' && "bg-rose-100/80 dark:bg-rose-950/40 border-rose-205 dark:border-rose-900/50 text-rose-600 dark:text-rose-400",
              isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400",
              isActive && "bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isFree && <AlertCircle className="w-5 h-5" />}
            {isPending && latestPayment?.status === 'pending' && <FileCheck className="w-5 h-5 text-amber-500" />}
            {isPending && latestPayment?.status === 'rejected' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && <Zap className="w-5 h-5 text-amber-500 animate-bounce" />}
            {isActive && <Sparkles className="w-5 h-5 text-emerald-500" />}
          </div>

          {/* Text Content */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {isFree && "Free Tier Active"}
                {isPending && latestPayment?.status === 'pending' && "Payment Verification Under Progress"}
                {isPending && latestPayment?.status === 'rejected' && "Payment Verification Rejected"}
                {isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "Payment Verification Required"}
                {isActive && "Subscription Activated"}
              </h4>
              <span
                className={cn(
                  "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider border",
                  isFree && "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                  isPending && latestPayment?.status === 'pending' && "bg-amber-100/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
                  isPending && latestPayment?.status === 'rejected' && "bg-rose-100/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/30",
                  isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "bg-amber-100/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
                  isActive && "bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                )}
              >
                {planName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {isFree && "Upgrade to a premium plan to unlock start-to-finish automated ATS flows, employee NDA/Offer packet generation, and smart AI resume screening."}
              {isPending && latestPayment?.status === 'pending' && `We are reviewing your payment verification (Ref ID: ${latestPayment?.transaction_id}). Your premium workspace will automatically unlock once verified.`}
              {isPending && latestPayment?.status === 'rejected' && `Reason: "${latestPayment?.notes || 'Payment screenshot invalid or reference number did not match bank logs'}" - click Resolve below to submit correct transaction proof.`}
              {isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && `Your selected plan (${planName}) is currently locked. Scan the UPI QR code and submit your screenshot proof inside the billing dashboard to activate your workspace.`}
              {isActive && `Enjoy full access to advanced hiring ATS automation, priority support, employee onboarding, AI resume screening, and recruiter collaboration panels.`}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center">
          {isActive ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 dark:bg-emerald-500/5 px-3.5 py-1.5 rounded-sm border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Active</span>
            </div>
          ) : (
            <button
              onClick={handleGoToBilling}
              className={cn(
                "relative h-9 px-4 rounded-sm font-bold text-xs transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 border hover:scale-[1.02] active:scale-[0.98]",
                isFree && "bg-white dark:bg-slate-800 border-slate-202 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750",
                isPending && latestPayment?.status === 'pending' && "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 dark:border-amber-600 shadow-md shadow-amber-500/10 dark:shadow-none",
                isPending && latestPayment?.status === 'rejected' && "bg-rose-600 hover:bg-rose-700 text-white border-rose-600 dark:border-rose-700 shadow-md shadow-rose-500/10",
                isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 dark:border-amber-600 shadow-md shadow-amber-500/10 dark:shadow-none"
              )}
            >
              {isFree && (
                <>
                  <span>Upgrade Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
              {isPending && latestPayment?.status === 'pending' && "View Payment Status"}
              {isPending && latestPayment?.status === 'rejected' && "Resolve Now"}
              {isPending && (!latestPayment || latestPayment?.status !== 'pending' && latestPayment?.status !== 'rejected') && "Verify Payment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
