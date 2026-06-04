'use client';

import React from 'react';
import { FileCheck } from 'lucide-react';

interface PaymentUnderReviewProps {
  latestPayment: any;
}

export function PaymentUnderReview({ latestPayment }: PaymentUnderReviewProps) {
  return (
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
          {latestPayment?.bank_name && (
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Payer Bank Name</span>
              <span className="font-semibold text-foreground mt-0.5 block">{latestPayment?.bank_name}</span>
            </div>
          )}
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
  );
}
