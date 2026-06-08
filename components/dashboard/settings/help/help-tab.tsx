'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Mail, HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

export function HelpTab() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I upgrade or activate my premium subscription?",
      answer: "Navigate to the 'Billing & Plans' tab, select your preferred plan (Basic, Growth, or Enterprise), and you will be presented with our manual payment verification details. Use the standard UPI VPA ID or scan the QR code to transfer the amount, then enter your Transaction ID, select the payment method, and upload a screenshot of your payment. Our administration team will manually verify and unlock your premium space."
    },
    {
      question: "How long does manual verification take?",
      answer: "Manual verification is highly responsive! It usually takes between 10 minutes to 2 hours during our standard business operational hours (9:00 AM to 6:00 PM IST, Monday to Saturday). Submissions outside of business hours are verified first thing the next morning."
    },
    {
      question: "What forms of payment do you accept for manual verification?",
      answer: "We support all major Indian payment modes including UPI apps (GPay, PhonePe, Paytm, BHIM VPA), standard Net Banking (IMPS, NEFT, RTGS), and bank transfers. Simply scan our QR code or use our helpline UPI ID to make the transfer."
    },
    {
      question: "Where can I find my Transaction ID after making a transfer?",
      answer: "For UPI payments (GPay, PhonePe, Paytm), you can find the 12-digit UPI Ref No. or VPA transaction ID in your transaction history details. For bank transfers, please use your IMPS Ref No. or NEFT Reference ID."
    },
    {
      question: "What happens if my transaction verification fails or gets rejected?",
      answer: "If our admin team cannot verify your payment (due to an incorrect Transaction ID or illegible screenshot), your payment verification request will be marked as 'Rejected'. You will instantly see the rejection notice in your Billing tab, along with helpful notes from the administrator explaining how to re-submit."
    }
  ];

  return (
    <div className="space-y-6 mt-0 animate-in fade-in duration-300">
      <div>
        <h3 className="text-2xl font-semibold text-foreground tracking-tight">Help & Support</h3>
        <p className="text-muted-foreground text-sm font-medium mt-1">Get in touch with the B2linq customer success team.</p>
      </div>

      <div className="max-w-2xl">
        {/* Email Support Card */}
        <Card className="rounded-sm border-border bg-card shadow-sm p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450 group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">Email Support Desk</h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-lg">
                For manual payment verifications, billing discrepancies, custom workspace configurations, or general support, please write to our support desk. We ticket and reply to all requests within 2 hours.
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-border/60 mt-6">
            <a 
              href="mailto:contactmegrp@gmail.com?subject=B2linq Support Request"
              className="text-sm font-bold text-[#0a66c2] hover:text-[#004182] hover:underline flex items-center gap-1.5"
            >
              contactmegrp@gmail.com
            </a>
          </div>
        </Card>
      </div>

      {/* Frequently Asked Questions */}
      <Card className="rounded-sm border-border bg-card shadow-sm p-6 mt-6">
        <div className="flex items-center gap-2 mb-6 border-b border-border/60 pb-4">
          <HelpCircle className="w-5 h-5 text-[#0a66c2]" />
          <h4 className="text-sm font-bold text-foreground">Frequently Asked Questions</h4>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFAQ === index;
            return (
              <div 
                key={index} 
                className="border border-border/60 rounded-sm bg-muted/5 transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/10 transition-colors"
                >
                  <span className="text-xs font-bold text-foreground leading-snug">{faq.question}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
