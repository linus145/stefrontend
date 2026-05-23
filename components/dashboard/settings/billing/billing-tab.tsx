'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, ShieldCheck, Sparkles, Crown, Loader2, ArrowRight, ArrowLeft, CheckCircle2, Zap, AlertCircle, Upload, QrCode, Clipboard, FileCheck, PhoneCall, Mail } from 'lucide-react';
import { PricingTable } from '@/components/Public/pricing/pricing-table';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BillingTab() {
  const { userSubscription, fetchSubscription } = useAuth();
  const [showPlans, setShowPlans] = useState(false);
  const [hasInitializedPlans, setHasInitializedPlans] = useState(false);
  
  // Manual payment form state
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentType, setPaymentType] = useState('new');
  const [upgradeUpiOrPhone, setUpgradeUpiOrPhone] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isVerified = userSubscription?.is_payment_verified ?? false;
  const planName = userSubscription?.plan_details?.name || 'Free Tier';
  const planPrice = Number(userSubscription?.plan_details?.price ?? 0);
  const status = userSubscription?.status || 'active';

  const isFree = planPrice === 0;
  
  // A plan is Active only if it is not free AND is approved (is_payment_verified is true)
  const isActive = !isFree && status === 'active' && isVerified;
  // A plan is Pending if it is premium AND is_payment_verified is false
  const isPending = !isFree && !isVerified;

  const isPremium = isActive;

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

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('pay@b2linq');
    toast.success('UPI ID copied to clipboard!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error('Please enter a Transaction Reference ID.');
      return;
    }
    if (paymentType === 'upgrade' && !upgradeUpiOrPhone.trim()) {
      toast.error('Please enter your PhonePe Number or UPI ID for verification.');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload your transaction screenshot.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('action', 'submit_payment');
    formData.append('transaction_id', transactionId.trim());
    formData.append('payment_method', paymentMethod);
    formData.append('payment_type', paymentType);
    if (paymentType === 'upgrade') {
      formData.append('upgrade_upi_or_phone', upgradeUpiOrPhone.trim());
    }
    formData.append('screenshot', screenshotFile);

    try {
      const response = await axiosInstance.post('/subscription/my-subscription/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data) {
        await fetchSubscription();
        toast.success('Payment proof submitted successfully!', {
          description: 'Our admin team will verify the transaction and activate your plan shortly.',
        });
        setTransactionId('');
        setUpgradeUpiOrPhone('');
        setPaymentType('new');
        setScreenshotFile(null);
        setScreenshotPreview(null);
      }
    } catch (error: any) {
      console.error('Error submitting payment verification:', error);
      toast.error(
        error.response?.data?.error || 'Failed to submit payment details. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Mock renewal date
  const getNextRenewalDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // SVG QR Code Visual
  const uipQR = (
    <svg viewBox="0 0 100 100" className="w-36 h-36 text-slate-800 dark:text-slate-200" fill="currentColor">
      <rect x="0" y="0" width="25" height="25" rx="1.5" />
      <rect x="4" y="4" width="17" height="17" fill="white" />
      <rect x="8" y="8" width="9" height="9" />
      
      <rect x="75" y="0" width="25" height="25" rx="1.5" />
      <rect x="79" y="4" width="17" height="17" fill="white" />
      <rect x="83" y="8" width="9" height="9" />
      
      <rect x="0" y="75" width="25" height="25" rx="1.5" />
      <rect x="7" y="79" width="11" height="11" fill="white" stroke="white" strokeWidth="2" />
      <rect x="8" y="83" width="9" height="9" />
      
      <rect x="35" y="5" width="5" height="5" />
      <rect x="45" y="8" width="8" height="5" />
      <rect x="60" y="5" width="5" height="12" />
      <rect x="35" y="18" width="15" height="5" />
      
      <rect x="5" y="35" width="5" height="18" />
      <rect x="15" y="45" width="10" height="5" />
      <rect x="25" y="35" width="5" height="8" />
      
      <rect x="35" y="35" width="12" height="12" />
      <rect x="53" y="35" width="5" height="5" />
      <rect x="63" y="42" width="8" height="8" />
      
      <rect x="35" y="55" width="5" height="8" />
      <rect x="45" y="60" width="12" height="5" />
      <rect x="63" y="55" width="5" height="18" />
      
      <rect x="80" y="35" width="8" height="5" />
      <rect x="85" y="48" width="5" height="12" />
      <rect x="73" y="65" width="12" height="5" />
      
      <rect x="35" y="75" width="8" height="8" />
      <rect x="50" y="82" width="5" height="12" />
      <rect x="60" y="75" width="5" height="5" />
      <rect x="60" y="85" width="12" height="5" />
    </svg>
  );

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
                  <span className="text-3xl font-black tracking-tight">
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

          {/* Under Review Visual Card */}
          {isPending && latestPayment?.status === 'pending' && (
            <div className="bg-card border border-amber-500/25 bg-amber-500/[0.02] rounded-md p-6 shadow-sm flex flex-col md:flex-row items-start gap-5 animate-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <FileCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-4 w-full">
                <div>
                  <h5 className="text-sm font-bold text-foreground">Transaction Proof Submitted</h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    We have successfully logged your manual payment verification. Our support desks are reviewing the transaction logs and will activate your workspace shortly.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-sm border border-border/60 text-xs grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Transaction VPA/Ref ID</span>
                    <span className="font-semibold text-foreground select-all mt-0.5 block">{latestPayment?.transaction_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Payment Mode</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{latestPayment?.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Verification Status</span>
                    <span className="font-extrabold text-amber-600 mt-0.5 block">Reviewing...</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Support Email Helpline</span>
                    <span className="font-semibold text-foreground mt-0.5 block select-all">contactmegrp@gmail.com</span>
                  </div>
                </div>

                {latestPayment?.screenshot && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Uploaded Screenshot</span>
                    <a href={latestPayment.screenshot} target="_blank" rel="noreferrer" className="inline-block border border-border rounded-sm overflow-hidden hover:opacity-90 transition-opacity">
                      <img src={latestPayment.screenshot} alt="Payment Proof" className="max-h-24 object-cover" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Payment QR Code & Screenshot Uploader Form */}
          {isPending && (!latestPayment || latestPayment?.status === 'rejected') && (
            <div className="bg-card border border-border rounded-md p-6 shadow-sm space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              {/* Rejection Notice Banner */}
              {latestPayment?.status === 'rejected' && (
                <div className="p-4 rounded-sm border border-rose-500/25 bg-rose-500/[0.03] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-450">Previous Verification Rejected</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                      Admin Notes: <span className="font-semibold text-rose-800 dark:text-rose-300">{latestPayment?.notes || "Verification failed. Please ensure the screenshot clearly displays the reference number."}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Please review your transaction reference, VPA bank logs, and re-submit below.</p>
                  </div>
                </div>
              )}

              <div className="border-b border-border pb-4">
                <h5 className="text-sm font-bold text-foreground">Manual UPI / QR Payment Verification</h5>
                <p className="text-xs text-muted-foreground mt-1">Scan the UPI QR code below, complete the transfer, and upload your payment details to activate your premium workspace.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* QR Code and Credentials (Left side) */}
                <div className="md:col-span-2 p-5 bg-muted/10 border border-border/80 rounded-sm flex flex-col items-center text-center justify-center space-y-4">
                  <div className="p-4 bg-white rounded-md border border-slate-200/50 shadow-sm relative group overflow-hidden">
                    {uipQR}
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase bg-[#0a66c2]/10 text-[#0a66c2] px-2 py-0.5 rounded border border-[#0a66c2]/20">Scan & Pay</span>
                    <h6 className="text-xs font-black text-foreground mt-2 select-all">₹{Number(planPrice).toLocaleString('en-IN')}</h6>
                    <p className="text-[10px] text-muted-foreground mt-1">GST inclusive flat billing rate</p>
                  </div>

                  <div className="w-full text-xs text-left space-y-2.5 border-t border-border pt-4 mt-2">
                    <div>
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Account VPA / UPI ID</span>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="font-bold text-foreground select-all text-[11px]">pay@b2linq</span>
                        <button type="button" onClick={handleCopyUPI} className="p-1 hover:bg-muted/80 rounded-sm transition-colors text-muted-foreground hover:text-foreground">
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Account Beneficiary</span>
                      <span className="font-semibold text-foreground mt-0.5 block text-[11px]">B2linq Technologies</span>
                    </div>
                  </div>
                </div>

                {/* Proof Submission Form (Right side) */}
                <form onSubmit={handleSubmitPayment} className="md:col-span-3 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block ml-0.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-10 px-3 border border-border bg-background rounded-sm text-xs font-medium text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    >
                      <option value="UPI">UPI App (GPay / PhonePe / Paytm)</option>
                      <option value="GPay">Google Pay (Direct Transfer)</option>
                      <option value="PhonePe">PhonePe (Direct Transfer)</option>
                      <option value="Paytm">Paytm VPA</option>
                      <option value="Net Banking">Net Banking (IMPS/NEFT)</option>
                      <option value="IMPS">IMPS IMmediate Transfer</option>
                      <option value="NEFT">NEFT / RTGS Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block ml-0.5">Payment Type</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full h-10 px-3 border border-border bg-background rounded-sm text-xs font-medium text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    >
                      <option value="new">New Subscription</option>
                      <option value="upgrade">Upgrading Subscription</option>
                    </select>
                  </div>

                  {paymentType === 'upgrade' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block ml-0.5">PhonePe Number or UPI ID</label>
                      <input
                        type="text"
                        placeholder="e.g. PhonePe registered number or UPI VPA"
                        value={upgradeUpiOrPhone}
                        onChange={(e) => setUpgradeUpiOrPhone(e.target.value)}
                        className="w-full h-10 px-3 border border-border bg-background rounded-sm text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary/40 focus:outline-none shadow-sm"
                        required={paymentType === 'upgrade'}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block ml-0.5">Transaction ID / Reference VPA ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 12-digit UPI Ref Number"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full h-10 px-3 border border-border bg-background rounded-sm text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary/40 focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block ml-0.5">Upload Transaction Screenshot</label>
                    <div className="relative border border-dashed border-border rounded-sm p-4 bg-muted/5 hover:bg-muted/10 hover:border-muted-foreground/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-32">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required={!screenshotPreview}
                      />
                      {screenshotPreview ? (
                        <div className="space-y-2 py-1">
                          <img src={screenshotPreview} alt="Screenshot Preview" className="max-h-24 object-cover rounded-sm border border-border" />
                          <p className="text-[10px] text-muted-foreground">Click or drag files to replace screenshot</p>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <Upload className="w-8 h-8 text-muted-foreground/75" />
                          <div>
                            <p className="text-xs font-bold text-foreground">Click to upload screenshot</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG or JPEG proof files</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full h-10 rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#0a66c2]/10 transition-all disabled:opacity-75 cursor-pointer active:scale-95 pt-0.5 mt-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Verification...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Submit Verification Proof</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="p-4 bg-muted/20 border border-border/50 rounded-sm flex items-center justify-between text-xs">
                <div className="flex gap-2 items-center">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-medium">Stuck? Have payment issues? Write support email:</span>
                  <span className="font-bold text-foreground select-all">contactmegrp@gmail.com</span>
                </div>
              </div>
            </div>
          )}
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
