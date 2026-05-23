'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, AlertCircle, CheckCircle2, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { axiosInstance } from '@/lib/axios';

export function SubscriptionStatusCard() {
  const { userSubscription, fetchSubscription } = useAuth();
  const [isActivating, setIsActivating] = useState(false);

  const planName = userSubscription?.plan_details?.name || 'Free Tier';
  const planPrice = Number(userSubscription?.plan_details?.price ?? 0);
  const status = userSubscription?.status || 'active'; // Default to active for Free Tier if no record

  const isFree = planPrice === 0;
  const isPending = !isFree && status === 'pending';
  const isActive = !isFree && status === 'active';

  const handleActivate = async () => {
    if (isFree) {
      toast.warning('No premium subscription to activate.', {
        description: 'Please go to Pricing/Settings to select a paid plan first.',
      });
      return;
    }

    if (isActive) {
      toast.info('Subscription is already active!');
      return;
    }

    setIsActivating(true);
    try {
      const response = await axiosInstance.post('/subscription/my-subscription/', {
        action: 'activate',
      });
      if (response.data) {
        await fetchSubscription();
        toast.success('Subscription activated successfully!', {
          description: `Welcome to the ${planName}! All premium tools and agentic flows are now unlocked.`,
        });
      }
    } catch (error: any) {
      console.error('Error activating subscription:', error);
      toast.error(
        error.response?.data?.error || 'Failed to activate subscription. Please try again.'
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border p-5 transition-all duration-300 shadow-sm",
        isFree && "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/80",
        isPending && "bg-amber-50/30 dark:bg-amber-950/5 border-amber-200/60 dark:border-amber-900/20 shadow-amber-500/[0.02]",
        isActive && "bg-gradient-to-br from-emerald-500/[0.03] to-indigo-500/[0.03] dark:from-emerald-500/[0.01] dark:to-indigo-500/[0.01] border-emerald-500/20 dark:border-emerald-500/10"
      )}
    >
      {/* Dynamic Background Glow Effect */}
      <div
        className={cn(
          "absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] -z-10 transition-all duration-500 opacity-60",
          isFree && "bg-slate-500/10 dark:bg-slate-500/5",
          isPending && "bg-amber-500/20 dark:bg-amber-500/10",
          isActive && "bg-emerald-500/20 dark:bg-emerald-500/10"
        )}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className={cn("flex gap-4", isActive ? "items-center" : "items-start")}>
          {/* Status Icon */}
          <div
            className={cn(
              "h-10 w-10 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm",
              isFree && "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400",
              isPending && "bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 animate-pulse",
              isActive && "bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isFree && <AlertCircle className="w-5 h-5" />}
            {isPending && <Zap className="w-5 h-5 text-amber-500 animate-bounce" />}
            {isActive && <Sparkles className="w-5 h-5 text-emerald-500" />}
          </div>

          {/* Text Content */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {isFree && "No Subscription Activated"}
                {isPending && "Subscription Pending Activation"}
                {isActive && "Subscription Activated"}
              </h4>
              <span
                className={cn(
                  "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider border",
                  isFree && "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                  isPending && "bg-amber-100/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
                  isActive && "bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                )}
              >
                {planName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {isFree && "You are currently using the Free version. Active locks are applied. Select a premium plan in Settings -> Billing to unlock advanced agentic automations."}
              {isPending && `Your selected ${planName} is currently pending activation. Please click "Activate Now" to initialize your premium tools and workspace.`}
              {/* {isActive && `Enjoy unlimited access to advanced hiring ATS automation, employee onboarding, AI resume screening, and conversational intelligence.`} */}
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
              onClick={handleActivate}
              disabled={isActivating}
              className={cn(
                "relative h-9 px-4 rounded-sm font-bold text-xs transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 border hover:scale-[1.02] active:scale-[0.98]",
                isFree && "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750",
                isPending && "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 dark:border-amber-600 shadow-md shadow-amber-500/10 dark:shadow-none animate-pulse hover:animate-none"
              )}
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  {isFree ? "Activate Subscription" : "Activate Now"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
