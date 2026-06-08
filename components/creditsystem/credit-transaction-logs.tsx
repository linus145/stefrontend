import React, { useState, useEffect } from 'react';
import { Coins, History, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { CreditTransaction } from '@/types/credits.types';

interface DateGroup {
  dateKey: string;
  label: string;
  transactions: CreditTransaction[];
  netAmount: number;
}

interface CreditTransactionLogsProps {
  groupedHistory: CreditTransaction[];
  getActivityBadgeClass: (type: string) => string;
}

export const CreditTransactionLogs: React.FC<CreditTransactionLogsProps> = ({
  groupedHistory,
  getActivityBadgeClass
}) => {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Group transactions by date for collapsible sections
  const dateGroupedHistory = React.useMemo(() => {
    const dateMap = new Map<string, { label: string; transactions: CreditTransaction[]; netAmount: number }>();

    const todayStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    groupedHistory.forEach((tx) => {
      const txDate = new Date(tx.created_at);
      const dateKey = txDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

      let label = dateKey;
      if (dateKey === todayStr) label = 'Today';
      else if (dateKey === yesterdayStr) label = 'Yesterday';

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { label, transactions: [], netAmount: 0 });
      }

      const group = dateMap.get(dateKey)!;
      group.transactions.push(tx);
      group.netAmount = Number((group.netAmount + (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount as any))).toFixed(2));
    });

    return Array.from(dateMap.entries()).map(([key, value]) => ({
      dateKey: key,
      ...value
    }));
  }, [groupedHistory]);

  // Auto-expand today's date group on first load
  useEffect(() => {
    if (dateGroupedHistory.length > 0 && Object.keys(expandedDates).length === 0) {
      const firstKey = dateGroupedHistory[0].dateKey;
      setExpandedDates({ [firstKey]: true });
    }
  }, [dateGroupedHistory]);

  const toggleDateGroup = (dateKey: string) => {
    setExpandedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  return (
    <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 pb-4 mb-4">
        <History className="w-4 h-4 text-[#0a66c2]" />
        <h3 className="text-sm font-semibold text-foreground">Transaction Logs</h3>
      </div>

      {dateGroupedHistory.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Coins className="w-10 h-10 text-muted-foreground/35 mx-auto" />
          <h4 className="text-xs font-semibold text-foreground">No Transactions Found</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
            Your credit allocations and burns will be logged here as you start running tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {dateGroupedHistory.map((group) => {
            const isExpanded = expandedDates[group.dateKey] ?? false;
            return (
              <div key={group.dateKey} className="border border-border/50 rounded-sm overflow-hidden">
                {/* Date Group Header — Clickable */}
                <button
                  type="button"
                  onClick={() => toggleDateGroup(group.dateKey)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <Calendar className="w-3.5 h-3.5 text-[#0a66c2]" />
                    <span className="text-[11px] font-bold text-foreground">{group.label}</span>
                    {group.label !== 'Today' && group.label !== 'Yesterday' && (
                      <span className="text-[10px] text-muted-foreground font-medium">({group.dateKey})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {group.transactions.length} transaction{group.transactions.length !== 1 ? 's' : ''}
                    </span>
                    <span className={`text-[10px] font-bold ${group.netAmount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {group.netAmount > 0 ? '+' : ''}{group.netAmount} credits
                    </span>
                  </div>
                </button>

                {/* Expanded Table */}
                {isExpanded && (
                  <div className="overflow-x-auto border-t border-border/40">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground font-semibold bg-muted/10">
                          <th className="py-2.5 px-4 w-[120px]">Type</th>
                          <th className="py-2.5 px-4 w-[80px] text-center">Amount</th>
                          <th className="py-2.5 px-4">Activity description</th>
                          <th className="py-2.5 px-4 w-[100px] text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {group.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/45 dark:hover:bg-slate-900/10 transition-colors">
                            <td className="py-3 px-4">
                              <span className={`inline-block text-[9px] font-semibold uppercase px-2 py-0.5 rounded-sm tracking-wider ${getActivityBadgeClass(tx.activity_type)}`}>
                                {tx.activity_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-semibold">
                              <span className={tx.amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground pr-4 max-w-[280px] truncate" title={tx.description}>
                              {tx.description}
                            </td>
                            <td className="py-3 px-4 text-right text-[10px] text-muted-foreground">
                              {new Date(tx.created_at).toLocaleString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
