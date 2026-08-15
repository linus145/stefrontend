import React from 'react';
import { Sparkles, ArrowRight, Coins } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CreditUpgradePromptProps {
  onOpenPurchaseModal?: () => void;
}

export const CreditUpgradePrompt: React.FC<CreditUpgradePromptProps> = ({ onOpenPurchaseModal }) => {
  return (
    <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/40 rounded-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Need more credits?</h4>
      </div>
      <p className="text-xs text-indigo-950/85 dark:text-indigo-200/90 leading-relaxed">
        Top up your balance instantly or upgrade your subscription plan for higher monthly allocations up to 1,500 credits.
      </p>
      <div className="flex flex-col gap-2 pt-1">
        {onOpenPurchaseModal && (
          <Button
            onClick={onOpenPurchaseModal}
            className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-8 rounded-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            Buy Credit Package
          </Button>
        )}
        <Link href="/dashboard/settings?tab=billing" className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1">
          <span>Upgrade Plan in Settings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
