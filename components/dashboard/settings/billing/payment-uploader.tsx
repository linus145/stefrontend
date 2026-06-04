'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { AlertCircle, Clipboard, Upload, Loader2, FileCheck, Mail, Info } from 'lucide-react';

interface PaymentUploaderProps {
  planPrice: number;
  latestPayment: any;
}

export function PaymentUploader({ planPrice, latestPayment }: PaymentUploaderProps) {
  const { fetchSubscription } = useAuth();
  
  // Manual payment form state
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentType, setPaymentType] = useState('new');
  const [upgradeUpiOrPhone, setUpgradeUpiOrPhone] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Payment QR Code is loaded dynamically from public/paymentqr.webp

  return (
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

      {/* Payment Notice Banner */}
      <div className="p-4 rounded-sm border border-blue-500/15 bg-blue-500/[0.02] dark:border-blue-500/20 dark:bg-blue-500/[0.03] space-y-2.5">
        <div className="flex items-center gap-2 text-[#0a66c2] dark:text-blue-400">
          <Info className="w-4 h-4 shrink-0" />
          <h6 className="text-[10px] font-extrabold uppercase tracking-wider">Payment Notice</h6>
        </div>
        <div className="text-[11px] text-muted-foreground leading-relaxed space-y-2">
          <p className="font-bold text-foreground">Thank you for choosing B2Linq.</p>
          <p>
            At this stage, payments are processed directly through our official UPI QR code rather than through a third-party payment gateway. This allows us to keep the platform simple while we continue to expand our infrastructure.
          </p>
          <p>
            After completing your payment, please upload the payment screenshot or transaction reference ID for verification. Once verified, your subscription will be activated by our team.
          </p>
          <p>
            Please ensure that you send the exact amount displayed on the payment page. B2Linq is not responsible for payments sent to incorrect accounts, incorrect amounts, or payments made outside the official QR code displayed within this platform.
          </p>
          <p>
            If you experience any issues, our support team will be happy to assist you.
          </p>
          <p className="text-[10px] font-bold text-foreground/85 mt-2 border-t border-border/50 pt-2">
            By proceeding, you acknowledge and agree to this payment verification process.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* QR Code and Credentials (Left side) */}
        <div className="md:col-span-2 p-5 bg-muted/10 border border-border/80 rounded-sm flex flex-col items-center text-center justify-center space-y-4">
          <div className="p-4 bg-white rounded-md border border-slate-200/50 shadow-sm relative group overflow-hidden">
            <div className="w-36 h-36 relative overflow-hidden flex items-center justify-center bg-black rounded-sm">
              <img
                src="/paymentqr.webp"
                alt="Payment QR"
                className="w-full h-full object-cover object-top"
              />
            </div>
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
              <span className="text-[9px] text-muted-foreground block uppercase font-bold tracking-wider">Account Name</span>
              <span className="font-semibold text-foreground mt-0.5 block text-[11px]">Lakkavaram Ponnuswami Linus (LP Linus)</span>
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
  );
}
