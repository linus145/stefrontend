import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const CreditUpgradePrompt: React.FC = () => {
  return (
    <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/40 rounded-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Need more credits?</h4>
      </div>
      <p className="text-xs text-indigo-950/85 dark:text-indigo-200/90 leading-relaxed">
        Unlock higher limits and more features by upgrading your subscription. Premium plans include up to 1,500 credits monthly.
      </p>
      <Link href="/dashboard/settings?tab=billing" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:opacity-90 transition-opacity">
        <span>Upgrade Plan in Settings</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
