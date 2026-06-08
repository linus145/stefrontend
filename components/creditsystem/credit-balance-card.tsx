import React from 'react';
import { Coins } from 'lucide-react';
import { UserCredit } from '@/types/credits.types';

interface CreditBalanceCardProps {
  credit: UserCredit | null;
  getPlanBadgeClass: (plan: string) => string;
  getPercentage: () => number;
}

export const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  credit,
  getPlanBadgeClass,
  getPercentage
}) => {
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
        <span className={`text-[10px] font-semibold uppercase px-3 py-1 rounded-sm tracking-wider ${getPlanBadgeClass(credit?.last_allocated_plan_type ?? 'free')} bg-white/10 text-white border-none`}>
          {credit?.last_allocated_plan_type ?? 'Free'} Plan
        </span>
      </div>

      <div className="mt-8 space-y-2 relative z-10">
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
