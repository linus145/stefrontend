import React from 'react';
import { Coins, PlusCircle, Zap } from 'lucide-react';
import { UserCredit } from '@/types/credits.types';
import { Button } from '@/components/ui/button';

interface CreditBalanceCardProps {
  credit: UserCredit | null;
  getPlanBadgeClass: (plan: string) => string;
  getPercentage: () => number;
  onOpenPurchaseModal?: () => void;
}

export const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  credit,
  getPlanBadgeClass,
  getPercentage,
  onOpenPurchaseModal
}) => {
  const isZeroBalance = (credit?.balance ?? 0) <= 0;

  return (
    <div className="bg-gradient-to-br from-[#0a66c2] via-[#084e96] to-indigo-900 text-white rounded-sm p-6 shadow-lg relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
        <Coins className="w-64 h-64" />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Current Balance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-bold tracking-tight">{credit?.balance ?? 0}</span>
            <span className="text-sm font-semibold text-blue-200">credits</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-[10px] font-semibold uppercase px-3 py-1 rounded-sm tracking-wider ${getPlanBadgeClass(credit?.last_allocated_plan_type ?? 'free')} bg-white/10 text-white border-none`}>
            {credit?.last_allocated_plan_type ?? 'Free'} Plan
          </span>
          {onOpenPurchaseModal && (
            <Button
              onClick={onOpenPurchaseModal}
              className="bg-white text-[#0a66c2] hover:bg-white/90 text-xs font-bold px-3.5 py-1.5 h-8 rounded-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none mt-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Top Up Credits
            </Button>
          )}
        </div>
      </div>

      {isZeroBalance && (
        <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/40 rounded-sm flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs font-semibold text-amber-100">
              Your credit balance is exhausted. Top up now to continue using AI tools.
            </span>
          </div>
          {onOpenPurchaseModal && (
            <Button
              onClick={onOpenPurchaseModal}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs h-7 px-3 rounded-sm shrink-0 cursor-pointer border-none"
            >
              Add Credits
            </Button>
          )}
        </div>
      )}

      <div className="mt-6 space-y-2 relative z-10">
        <div className="flex justify-between text-xs font-semibold text-blue-100">
          <span>Monthly Plan Allocation Limit</span>
          <span>{credit?.balance ?? 0} / {credit?.plan_limit ?? 100} credits</span>
        </div>
        <div className="w-full bg-black/20 rounded-sm h-2">
          <div
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-sm transition-all duration-500"
            style={{ width: `${getPercentage()}%` }}
          />
        </div>
        <p className="text-[10px] text-blue-200/80 leading-normal">
          Refreshed monthly. Unused plan credits expire at the end of each billing cycle.
        </p>
      </div>
    </div>
  );
};
