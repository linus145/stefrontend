'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, ShieldCheck, Sparkles, Crown, Loader2, ArrowRight, ArrowLeft, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { PricingTable } from '@/components/Public/pricing/pricing-table';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BillingTab() {
  const { userSubscription, fetchSubscription } = useAuth();
  const [showPlans, setShowPlans] = useState(false);
  const [hasInitializedPlans, setHasInitializedPlans] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const isPremium = !!(userSubscription &&
                    userSubscription.status === 'active' &&
                    userSubscription.plan_details &&
                    Number(userSubscription.plan_details.price) > 0);

  useEffect(() => {
    if (userSubscription !== null && !hasInitializedPlans) {
      setShowPlans(!isPremium);
      setHasInitializedPlans(true);
    }
  }, [userSubscription, isPremium, hasInitializedPlans]);

  const planName = userSubscription?.plan_details?.name || 'Free Tier';
  const planPrice = Number(userSubscription?.plan_details?.price ?? 0);
  const status = userSubscription?.status || 'active';

  const isFree = planPrice === 0;
  const isPending = !isFree && status === 'pending';
  const isActive = !isFree && status === 'active';

  const handleActivate = async () => {
    if (isFree) return;
    setIsActivating(true);
    try {
      const response = await axiosInstance.post('/subscription/my-subscription/', {
        action: 'activate',
      });
      if (response.data) {
        await fetchSubscription();
        toast.success('Subscription activated successfully!', {
          description: `Your ${planName} features are now fully unlocked.`,
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

  // Format a mock renewal date (30 days from now or standard date)
  const getNextRenewalDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (showPlans) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Select a Plan</h3>
            <p className="text-xs text-muted-foreground mt-1">Upgrade, change, or choose a new plan for your workspace</p>
          </div>
          <button
            onClick={() => setShowPlans(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Billing
          </button>
        </div>
        <PricingTable />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border pb-4 mb-6">
        <h3 className="text-lg font-bold text-foreground">Billing & Subscription</h3>
        <p className="text-xs text-muted-foreground mt-1">Manage your active subscription plan, payments, and invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Overview Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-md p-6 shadow-sm relative overflow-hidden">
            {/* Ambient Background Glow for active premium */}
            {isActive && (
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] bg-emerald-500/10 dark:bg-emerald-500/5 -z-10" />
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Current Plan</span>
                <h4 className="text-2xl font-black text-foreground tracking-tight mt-1 flex items-center gap-2">
                  {planName}
                  {isActive && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-450 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                      Pending Activation
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
                  {isPending && `Your ${planName} subscription has been created but is pending activation.`}
                  {isActive && `Enjoy full startup ATS pipeline automation, employee self-service, and AI resume screening.`}
                </p>
              </div>
              <div className="shrink-0">
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-xl font-bold mr-0.5">₹</span>
                  <span className="text-3xl font-black tracking-tight">
                    {Number(planPrice) === 0 ? '0' : Number(planPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold ml-1">/ mo</span>
                </div>
              </div>
            </div>

            {/* Pending activation action */}
            {isPending && (
              <div className="mb-6 p-4 rounded-sm border border-amber-500/25 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Initialize Premium Space</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Please click below to activate your premium agentic flows and tools.</p>
                  </div>
                </div>
                <button
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="w-full sm:w-auto h-9 px-5 rounded-sm bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer active:scale-95 shrink-0"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <span>Activate Now</span>
                  )}
                </button>
              </div>
            )}

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
                {!isFree && (
                  <button className="h-9 px-4 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground font-bold text-xs transition-all cursor-pointer">
                    Manage Payment Method
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature inclusions card (ChatGPT-style checklist) */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-md p-6 shadow-sm h-full">
            <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Included in your plan</h5>
            
            <ul className="space-y-3.5 text-xs">
              {isFree ? (
                <>
                  <FeatureItem label="Candidate Job Board Access" enabled />
                  <FeatureItem label="Basic Applicant Dashboard" enabled />
                  <FeatureItem label="1-10 Employees limit" enabled />
                  <FeatureItem label="ATS Data Sync Integration" enabled={false} />
                  <FeatureItem label="Conversational HR AI Assistant" enabled={false} />
                  <FeatureItem label="AI Resume Screening" enabled={false} />
                </>
              ) : planName.toLowerCase().includes('basic') ? (
                <>
                  <FeatureItem label="ATS & HRMS Data Syncing" enabled />
                  <FeatureItem label="Auto welcome & NDA packets" enabled />
                  <FeatureItem label="Up to 100 Employees limit" enabled />
                  <FeatureItem label="2 Core systems integration" enabled />
                  <FeatureItem label="Conversational AI Handbook Search" enabled={false} />
                  <FeatureItem label="AI Resume Screening Engine" enabled={false} />
                </>
              ) : planName.toLowerCase().includes('growth') ? (
                <>
                  <FeatureItem label="Full Conversational AI Agent" enabled />
                  <FeatureItem label="AI Resume Screening & Score" enabled />
                  <FeatureItem label="Up to 500 Employees limit" enabled />
                  <FeatureItem label="Unlimited standard integrations" enabled />
                  <FeatureItem label="Interactive Onboarding Guides" enabled />
                  <FeatureItem label="Autonomous Pipeline Automation" enabled={false} />
                </>
              ) : (
                /* Enterprise AI OS */
                <>
                  <FeatureItem label="Full Agentic Autonomous Systems" enabled />
                  <FeatureItem label="Custom Enterprise API & ERP" enabled />
                  <FeatureItem label="Unlimited Employees limit" enabled />
                  <FeatureItem label="Autonomous AI Hiring Agents" enabled />
                  <FeatureItem label="Full HR Management Suite" enabled />
                  <FeatureItem label="Dedicated Support & Infra" enabled />
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <li className={cn("flex items-start gap-2.5", !enabled && "opacity-45")}>
      {enabled ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      )}
      <span className={cn("leading-normal font-medium", enabled ? "text-foreground" : "text-muted-foreground line-through")}>
        {label}
      </span>
    </li>
  );
}
