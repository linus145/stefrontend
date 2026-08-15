import React, { useState } from 'react';
import {
  ArrowLeft, Coins, Check, Zap, ShieldCheck, Loader2, Sparkles, CreditCard, QrCode, FileText, Clipboard, Upload, Trash2, FileCheck, RefreshCw, Clock, CheckCircle2
} from 'lucide-react';
import { creditsService } from '@/services/credits.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: string;
  amountNum: number;
  popular?: boolean;
  perCredit: string;
  description: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 575,
    amountNum: 499,
    price: '₹499',
    perCredit: '1.15 credits / ₹1',
    description: 'Get 575 AI credits for ₹499 (1.15x credit value multiplier).'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 1150,
    amountNum: 999,
    price: '₹999',
    popular: true,
    perCredit: '1.15 credits / ₹1',
    description: 'Get 1,150 AI credits for ₹999 (1.15x credit value multiplier).'
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    credits: 4600,
    amountNum: 3999,
    price: '₹3,999',
    perCredit: '1.15 credits / ₹1',
    description: 'Get 4,600 AI credits for ₹3,999 (1.15x credit value multiplier).'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 8050,
    amountNum: 6999,
    price: '₹6,999',
    perCredit: '1.15 credits / ₹1',
    description: 'Get 8,050 AI credits for ₹6,999 (1.15x credit value multiplier).'
  },
];

interface PurchaseCreditPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function PurchaseCreditPage({ onBack, onSuccess }: PurchaseCreditPageProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [currentStep, setCurrentStep] = useState<'select_package' | 'payment_checkout' | 'payment_pending' | 'payment_approved'>('select_package');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI / GPay / PhonePe');
  const [transactionId, setTransactionId] = useState<string>('');
  const [upiOrPhone, setUpiOrPhone] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [pendingSubmittedTx, setPendingSubmittedTx] = useState<{ id: string; credits: number; package_name?: string } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch credit history to check for active pending / recently approved transactions
  const { data: historyRes, refetch: refetchHistory } = useQuery({
    queryKey: ['creditHistoryPoll'],
    queryFn: () => creditsService.getTransactionHistory(),
    refetchInterval: pendingSubmittedTx || currentStep === 'payment_pending' ? 3000 : false,
  });

  // Check if pending transaction gets approved in backend
  React.useEffect(() => {
    const rawData: any = historyRes;
    const txList: any[] = Array.isArray(rawData?.data?.data)
      ? rawData.data.data
      : (Array.isArray(rawData?.data)
          ? rawData.data
          : (Array.isArray(rawData) ? rawData : []));

    if (pendingSubmittedTx) {
      const pendingId = String(pendingSubmittedTx.id).trim();
      const matchedTx = txList.find((tx: any) => {
        let metaObj: any = tx.metadata;
        if (typeof tx.metadata === 'string') {
          try { metaObj = JSON.parse(tx.metadata); } catch (e) { metaObj = {}; }
        }
        const metaId = metaObj?.transaction_id ? String(metaObj.transaction_id).trim() : '';
        const descMatch = tx.description ? tx.description.includes(pendingId) : false;
        return metaId === pendingId || descMatch || String(tx.id) === pendingId;
      });

      let status = 'pending';
      if (matchedTx) {
        let metaObj: any = matchedTx.metadata;
        if (typeof matchedTx.metadata === 'string') {
          try { metaObj = JSON.parse(matchedTx.metadata); } catch (e) { metaObj = {}; }
        }
        status = metaObj?.status || 'pending';
      }

      if (matchedTx && status === 'approved') {
        toast.success("Payment Approved & Verified!", {
          description: `Successfully credited AI credits to your account balance.`
        });
        queryClient.invalidateQueries({ queryKey: ['userCredits'] });
        queryClient.refetchQueries({ queryKey: ['userCredits'], type: 'active' });
        queryClient.invalidateQueries({ queryKey: ['creditHistory'] });
        setCurrentStep('payment_approved');
      }
    } else if (txList.length > 0 && currentStep === 'select_package') {
      // Check for existing pending purchase transaction on initial load
      const pendingTx = txList.find(
        (tx: any) => {
          if (tx.activity_type !== 'purchase') return false;
          let metaObj: any = tx.metadata;
          if (typeof tx.metadata === 'string') {
            try { metaObj = JSON.parse(tx.metadata); } catch (e) { metaObj = {}; }
          }
          return metaObj?.status === 'pending';
        }
      );
      if (pendingTx) {
        let metaObj: any = pendingTx.metadata;
        if (typeof pendingTx.metadata === 'string') {
          try { metaObj = JSON.parse(pendingTx.metadata); } catch (e) { metaObj = {}; }
        }
        const tid = metaObj?.transaction_id || pendingTx.id;
        setPendingSubmittedTx({
          id: String(tid),
          credits: Number(pendingTx.amount) || 0,
          package_name: metaObj?.package_name || 'Credit Top-up'
        });
      }
    }
  }, [historyRes, pendingSubmittedTx, currentStep, queryClient]);

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

  const handleClearFile = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handlePurchase = async () => {
    if (!transactionId.trim()) {
      toast.error("Payment Verification Required", {
        description: "Please enter your Payment Transaction ID / Reference Number."
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await creditsService.purchaseCredits(
        selectedPackage.credits,
        selectedPackage.name,
        transactionId.trim(),
        paymentMethod,
        upiOrPhone.trim(),
        screenshotFile || screenshotPreview || ''
      );

      if (res.data?.status === "success") {
        toast.success("Payment Verified & Credits Added!", {
          description: `Successfully added ${selectedPackage.credits} AI credits to your balance.`
        });
        queryClient.invalidateQueries({ queryKey: ['userCredits'] });
        queryClient.refetchQueries({ queryKey: ['userCredits'], type: 'active' });
        setCurrentStep('payment_approved');
      } else {
        setPendingSubmittedTx({
          id: transactionId.trim(),
          credits: selectedPackage.credits,
          package_name: selectedPackage.name
        });
        setCurrentStep('payment_pending');
        toast.info("Payment Verification Submitted", {
          description: `Transaction ID ${transactionId.trim()} is pending admin verification.`
        });
        queryClient.invalidateQueries({ queryKey: ['userCredits'] });
      }
    } catch (error: any) {
      console.error("Error submitting payment verification:", error);
      toast.error("Submission Failed", {
        description: error.data?.message || error.message || "Could not submit payment verification. Please try again."
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // STEP 3: Dedicated Payment Pending Page View
  if (currentStep === 'payment_pending') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto py-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep('select_package')}
              className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Payment Verification Pending</h2>
              <p className="text-xs text-muted-foreground">Transaction under backend administrator review</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs py-1 px-3">
            Status: Pending Approval
          </Badge>
        </div>

        <Card className="border-border bg-card shadow-sm overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Payment Submitted & Under Review</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your payment reference <strong className="text-foreground">{pendingSubmittedTx?.id || transactionId}</strong> has been received. Our backend administration team is currently verifying the payment.
            </p>
          </div>

          <div className="bg-muted/30 border border-border/60 rounded-sm p-4 text-xs space-y-2 max-w-md mx-auto text-left">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground">Credits Requested</span>
              <span className="font-bold text-[#0a66c2]">{pendingSubmittedTx?.credits || selectedPackage.credits} AI Credits</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground">Package</span>
              <span className="font-bold text-foreground">{pendingSubmittedTx?.package_name || selectedPackage.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Reference</span>
              <span className="font-mono font-bold text-foreground">{pendingSubmittedTx?.id || transactionId}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="button"
              onClick={() => refetchHistory()}
              className="w-full max-w-md mx-auto rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-10 cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Verification Status Now</span>
            </Button>
            <p className="text-[11px] text-muted-foreground">
              This page automatically polls for administrator approval every 3 seconds.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // STEP 4: Dedicated Payment Approved Success Page View
  if (currentStep === 'payment_approved') {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300 max-w-2xl mx-auto py-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment Approved</h2>
            <p className="text-xs text-muted-foreground">Credits credited to your account balance</p>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs py-1 px-3">
            Status: Approved
          </Badge>
        </div>

        <Card className="border-border bg-card shadow-sm overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Payment Verified & Approved!</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your transaction reference <strong className="text-foreground">{pendingSubmittedTx?.id || transactionId}</strong> has been successfully verified by administration.
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-sm p-4 max-w-md mx-auto">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Credits Allocated to Balance</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 fill-current" />
              <span>+{pendingSubmittedTx?.credits || selectedPackage.credits} AI Credits</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['userCredits'] });
                queryClient.refetchQueries({ queryKey: ['userCredits'], type: 'active' });
                onSuccess();
                onBack();
              }}
              className="w-full max-w-md mx-auto rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-10 cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm"
            >
              <Coins className="w-4 h-4" />
              <span>Return to AI Credits Dashboard</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // STEP 1: Package Selection Page View
  if (currentStep === 'select_package') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Credit Control</span>
          </button>
          <Badge variant="outline" className="rounded-sm text-[11px] font-semibold border-[#0a66c2]/30 text-[#0a66c2]">
            Step 1 of 2: Package Selection
          </Badge>
        </div>

        {/* Title Banner */}
        <div>
          <h2 className="text-xl font-bold text-foreground">Select AI Credit Package (1.15x Multiplier)</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a credit plan tailored for your hiring workspace and proceed to the dedicated QR payment page.
          </p>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative border rounded-sm p-5 cursor-pointer transition-all flex flex-col justify-between ${isSelected
                    ? "border-[#0a66c2] bg-[#0a66c2]/5 ring-2 ring-[#0a66c2] shadow-md"
                    : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
                  }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2.5 right-4 bg-[#0a66c2] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
                    Most Popular
                  </Badge>
                )}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{pkg.name}</h3>
                      <span className="text-[11px] text-muted-foreground font-semibold text-[#0a66c2]">{pkg.perCredit}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${isSelected ? "bg-[#0a66c2] border-[#0a66c2] text-white" : "border-muted-foreground/30 bg-transparent"
                      }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-[#0a66c2]">{pkg.credits}</span>
                    <span className="text-xs font-semibold text-muted-foreground">credits (1.15x)</span>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-foreground">
                    <span>Price</span>
                    <span className="text-base text-[#0a66c2]">{pkg.price}</span>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setCurrentStep('payment_checkout');
                    }}
                    className={`w-full h-9 text-xs font-bold rounded-sm border-none shadow-xs cursor-pointer ${isSelected
                        ? "bg-[#0a66c2] hover:bg-[#004182] text-white"
                        : "bg-muted hover:bg-[#0a66c2] hover:text-white text-foreground"
                      }`}
                  >
                    <span>Proceed with {pkg.name}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Proceed Action Footer */}
        <div className="bg-card border border-border rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-foreground">Selected: {selectedPackage.name} ({selectedPackage.price})</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Includes {selectedPackage.credits} AI credits with 1.15x bonus rate</p>
          </div>
          <Button
            onClick={() => setCurrentStep('payment_checkout')}
            className="w-full sm:w-auto h-10 px-6 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs rounded-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to QR Payment & Verification</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>
    );
  }

  // STEP 2: Dedicated Separate Payment & QR Verification Sub-Page View
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          onClick={() => setCurrentStep('select_package')}
          className="flex items-center gap-2 text-xs font-bold text-[#0a66c2] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Package Selection</span>
        </button>
        <Badge variant="outline" className="rounded-sm text-[11px] font-semibold border-[#0a66c2]/30 text-[#0a66c2]">
          Step 2 of 2: Dedicated Payment Verification Page
        </Badge>
      </div>

      {/* Main Title Banner */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Payment & Transaction Verification ({selectedPackage.name})
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Scan the official B2Linq UPI QR Code below, complete your transfer of <strong className="text-foreground">{selectedPackage.price}</strong>, and enter your Transaction ID for admin approval.
        </p>
      </div>

      {/* Layout Grid for Dedicated Payment Page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Package Summary & Full-width QR Code Payment Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Package Banner Summary */}
          <div className="bg-[#0a66c2]/10 border border-[#0a66c2]/20 rounded-sm p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#0a66c2] tracking-wider block">Selected Package</span>
              <h3 className="text-base font-bold text-foreground">{selectedPackage.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedPackage.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground font-semibold block">Total Amount</span>
              <span className="text-xl font-extrabold text-[#0a66c2]">{selectedPackage.price}</span>
            </div>
          </div>

          {/* Manual UPI / QR Payment Verification Card (Matching Plan System) */}
          <div className="bg-card border border-border rounded-sm p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                <QrCode className="w-5 h-5 text-[#0a66c2]" />
                <span className="text-sm">Manual UPI / QR Payment Guide</span>
              </div>
              <Badge variant="outline" className="bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20 text-[10px] font-bold rounded-sm">
                Official B2Linq QR
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center">
              {/* QR Image Container */}
              <div className="sm:col-span-2 p-4 bg-muted/20 border border-border/80 rounded-sm flex flex-col items-center text-center space-y-2.5">
                <div className="w-40 h-40 relative overflow-hidden flex items-center justify-center bg-black rounded-sm border border-border shadow-xs">
                  <img
                    src="/paymentqr.webp"
                    alt="Payment QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scan with any UPI app</span>
              </div>

              {/* UPI & Bank Credentials */}
              <div className="sm:col-span-3 space-y-3.5 text-xs">
                <div className="p-3.5 rounded-sm bg-muted/30 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Official UPI VPA</span>
                    <span className="font-mono font-bold text-foreground text-sm">pay@b2linq</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('pay@b2linq');
                      toast.success('UPI ID copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-card hover:bg-muted border border-border text-xs font-bold text-[#0a66c2] cursor-pointer transition-all active:scale-95 shadow-xs"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copy VPA</span>
                  </button>
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed space-y-2 bg-muted/20 p-3 rounded-sm border border-border/40">
                  <p>• <strong>Accepted Payment Apps:</strong> Google Pay, PhonePe, Paytm, BHIM, Mobikwik, Net Banking.</p>
                  <p>• <strong>Exact Payment Amount:</strong> <strong className="text-[#0a66c2] font-bold">{selectedPackage.price}</strong> for <strong>{selectedPackage.credits} AI Credits</strong>.</p>
                  <p>• <strong>Backend Verification Policy:</strong> Enter your <strong>Transaction Reference ID</strong> on the right. Credits are added to your balance strictly upon administrator verification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Checkout & Payment Verification Card */}
        <div>
          <Card className="border border-border rounded-sm shadow-sm sticky top-24">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <CreditCard className="w-4 h-4 text-[#0a66c2]" />
                <h3 className="text-sm font-bold text-foreground">Submit Verification Details</h3>
              </div>

              {/* Package Summary */}
              <div className="space-y-2 text-xs bg-muted/30 p-3 rounded-sm border border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Selected Package</span>
                  <span className="font-bold text-foreground">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Credits (1.15x)</span>
                  <span className="font-bold text-[#0a66c2]">{selectedPackage.credits} AI Credits</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-xs font-bold text-foreground">Total Amount</span>
                  <span className="text-base font-bold text-[#0a66c2]">{selectedPackage.price}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Payment Method</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 rounded-sm border border-border bg-card text-xs font-semibold px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                >
                  <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe / BHIM</option>
                  <option value="Net Banking / Bank Transfer">Net Banking / Bank Transfer</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                </select>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Transaction ID / Ref No *</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Required</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 423904810293 or UPI Ref No"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="h-9 rounded-sm text-xs font-semibold bg-card border-border"
                />
              </div>

              {/* Phone / UPI ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  <span>Sender Phone / UPI ID</span>
                  <span className="text-[10px] text-muted-foreground font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. user@upi or 9876543210"
                  value={upiOrPhone}
                  onChange={(e) => setUpiOrPhone(e.target.value)}
                  className="h-9 rounded-sm text-xs font-semibold bg-card border-border"
                />
              </div>

              {/* Payment Receipt Screenshot Uploader */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Payment Receipt Screenshot</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </label>

                {screenshotPreview ? (
                  <div className="relative border border-border rounded-sm p-2 bg-muted/20 space-y-2">
                    <div className="relative h-28 w-full rounded-sm overflow-hidden border border-border/60 bg-black/5 flex items-center justify-center">
                      <img
                        src={screenshotPreview}
                        alt="Payment Screenshot Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Receipt Image Attached</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border hover:border-[#0a66c2]/50 transition-colors rounded-sm p-3 text-center bg-card">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="credit-screenshot-upload"
                    />
                    <label
                      htmlFor="credit-screenshot-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-1"
                    >
                      <Upload className="w-4 h-4 text-[#0a66c2]" />
                      <span className="text-xs font-bold text-foreground">Upload Payment Screenshot</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Pending Submitted Verification Banner */}
              {pendingSubmittedTx && (
                <div className="space-y-1.5 bg-amber-500/10 border border-amber-500/30 rounded-sm p-3 mt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Previous Payment Verification Pending</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Transaction ID <strong className="text-foreground">{pendingSubmittedTx.id}</strong> is pending administrator verification. You can submit a new payment reference below.
                  </p>
                </div>
              )}

              {/* Submit Verification Button */}
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-10 transition-all cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm mt-2"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Verification...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Submit Payment Verification ({selectedPackage.credits} Credits)</span>
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground leading-normal">
                Credits will be added to your balance upon verification of your transaction ID.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
