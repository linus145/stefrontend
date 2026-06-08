'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { PricingTable } from '@/components/Public/pricing/pricing-table';
import { PlanOverview } from './plan-overview';
import { PaymentUnderReview } from './payment-under-review';
import { PaymentUploader } from './payment-uploader';
import { PlanFeatures } from './plan-features';

export function BillingTab() {
  const { userSubscription } = useAuth();
  const [showPlans, setShowPlans] = useState(false);
  const [hasInitializedPlans, setHasInitializedPlans] = useState(false);
  const [subTab, setSubTab] = useState<'overview' | 'payment'>('overview');

  const isVerified = userSubscription?.is_payment_verified ?? false;
  const planName = userSubscription?.plan_details?.name || 'Free Tier';
  const planPrice = Number(userSubscription?.plan_details?.price ?? 0);
  const status = userSubscription?.status || 'active';

  const isFree = planPrice === 0;
  
  // A plan is Active only if it is not free AND is approved (is_payment_verified is true)
  const isActive = !isFree && status === 'active' && isVerified;
  // A plan is Pending if it is premium AND is_payment_verified is false
  const isPending = !isFree && !isVerified;

  const lastPlanIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (userSubscription !== null) {
      const planId = userSubscription?.plan_details?.id || null;
      const hasPlan = userSubscription?.plan_details && (Number(userSubscription.plan_details.price) > 0);
      
      if (!hasInitializedPlans) {
        setShowPlans(!hasPlan);
        lastPlanIdRef.current = planId;
        setHasInitializedPlans(true);
      } else {
        // If the plan has actually changed (e.g. they selected a new plan on the pricing table)
        // and we were showing the plans selector, go back to the billing overview/uploader.
        if (planId !== lastPlanIdRef.current) {
          lastPlanIdRef.current = planId;
          if (showPlans) {
            setShowPlans(false);
          }
          if (hasPlan) {
            setSubTab('payment');
          }
        }
      }
    }
  }, [userSubscription, showPlans, hasInitializedPlans]);

  useEffect(() => {
    const handleTabChange = () => {
      // When tab changes, if user already has a premium plan selected, 
      // ensure we show the billing/uploader view by default, not the plans selector.
      const hasPlan = userSubscription?.plan_details && (Number(userSubscription.plan_details.price) > 0);
      if (hasPlan) {
        setShowPlans(false);
      }
    };

    window.addEventListener('settings-tab-change', handleTabChange);
    return () => window.removeEventListener('settings-tab-change', handleTabChange);
  }, [userSubscription]);

  // Extract latest payment verification details if available for the current plan
  const latestPayment = userSubscription?.latest_payment && userSubscription.latest_payment.plan === userSubscription.plan
    ? userSubscription.latest_payment
    : null;

  // Mock renewal date
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold transition-all cursor-pointer"
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

      {/* Sub tabs navigation */}
      <div className="flex gap-2 border-b border-border/60 pb-px mb-6">
        <button
          onClick={() => setSubTab('overview')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            subTab === 'overview'
              ? 'text-[#0a66c2] border-b-2 border-[#0a66c2]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview & Plans
        </button>
        <button
          onClick={() => setSubTab('payment')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
            subTab === 'payment'
              ? 'text-[#0a66c2] border-b-2 border-[#0a66c2]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Payment Upload & History
        </button>
      </div>

      {subTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Overview Card */}
          <div className="lg:col-span-2 space-y-6">
            <PlanOverview
              planName={planName}
              planPrice={planPrice}
              isActive={isActive}
              isPending={isPending}
              isFree={isFree}
              latestPayment={latestPayment}
              getNextRenewalDate={getNextRenewalDate}
              setShowPlans={setShowPlans}
            />

            {/* Under Review visual summary at overview tab as well */}
            {isPending && latestPayment?.status === 'pending' && (
              <PaymentUnderReview latestPayment={latestPayment} />
            )}
          </div>

          {/* Feature inclusions card (ChatGPT-style checklist) */}
          <PlanFeatures planName={planName} isFree={isFree} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Under Review visual card */}
          {latestPayment?.status === 'pending' && (
            <PaymentUnderReview latestPayment={latestPayment} />
          )}

          {/* If free and no pending premium plan, prompt to choose a plan */}
          {isFree && !latestPayment ? (
            <div className="bg-card border border-border rounded-sm p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2] mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">No Manual Payment Required</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-normal max-w-md mx-auto">
                  You are currently active on the Free Tier. To unlock premium AI resume screening, candidate evaluation reports, and workspace matching, select a premium plan first.
                </p>
              </div>
              <button
                onClick={() => setShowPlans(true)}
                className="h-9 px-4 rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs shadow-sm shadow-[#0a66c2]/10 hover:opacity-95 transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
              >
                <span>Browse Premium Plans</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            /* Manual Payment QR Code & Screenshot Uploader Form */
            <PaymentUploader planPrice={planPrice} latestPayment={latestPayment} />
          )}
        </div>
      )}
    </div>
  );
}
