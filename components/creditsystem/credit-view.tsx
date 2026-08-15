"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, PlusCircle } from 'lucide-react';
import { creditsService } from '@/services/credits.service';
import { UserCredit, CreditTransaction } from '@/types/credits.types';
import { toast } from 'sonner';

import { CreditBalanceCard } from './credit-balance-card';
import { CreditTransactionLogs } from './credit-transaction-logs';
import { CreditCostRates } from './credit-cost-rates';
import { CreditUpgradePrompt } from './credit-upgrade-prompt';
import { PurchaseCreditPage } from './purchase-credit-page';

export function CreditView() {
  const [credit, setCredit] = useState<UserCredit | null>(null);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'purchase'>('overview');

  const fetchData = async (showToast = false) => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        creditsService.getBalance(),
        creditsService.getTransactionHistory()
      ]);
      setCredit(balanceRes.data);
      setHistory(historyRes.data);
      if (showToast) {
        toast.success("Credits data updated successfully.");
      }
    } catch (err) {
      console.error("Error fetching credit data:", err);
      toast.error("Failed to load credit details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  // Merge cognitive step transactions into single grouped rows
  const groupedHistory = React.useMemo(() => {
    const grouped: CreditTransaction[] = [];
    const cognitiveStepsMap = new Map<string, CreditTransaction>();

    history.forEach((tx) => {
      const isCognitiveStep = tx.description?.startsWith("Autonomous Agent cognitive step") || 
                              tx.description?.includes("cognitive step for goal:");
      
      if (isCognitiveStep) {
        const key = tx.description;
        if (cognitiveStepsMap.has(key)) {
          const existing = cognitiveStepsMap.get(key)!;
          const currentAmt = parseFloat(existing.amount as any);
          const newAmt = parseFloat(tx.amount as any);
          existing.amount = Number((currentAmt + newAmt).toFixed(2));
          if (new Date(tx.created_at) > new Date(existing.created_at)) {
            existing.created_at = tx.created_at;
          }
        } else {
          const clone = { ...tx, amount: parseFloat(tx.amount as any) };
          cognitiveStepsMap.set(key, clone);
          grouped.push(clone);
        }
      } else {
        grouped.push({ ...tx, amount: parseFloat(tx.amount as any) });
      }
    });

    return grouped.map(tx => ({
      ...tx,
      amount: typeof tx.amount === 'number' ? Number(tx.amount.toFixed(2)) : tx.amount
    }));
  }, [history]);

  const getPlanBadgeClass = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50';
      case 'growth':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50';
      case 'basic':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400 border border-slate-200/50';
    }
  };

  const getActivityBadgeClass = (type: string) => {
    switch (type) {
      case 'allocation':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100';
      case 'burn':
        return 'bg-rose-50 text-rose-750 dark:bg-rose-950/30 dark:text-rose-450 border border-rose-100';
      case 'purchase':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100';
    }
  };

  const getPercentage = () => {
    if (!credit || credit.plan_limit === 0) return 0;
    return Math.min(100, Math.round((credit.balance / credit.plan_limit) * 100));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#0a66c2] animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Synchronizing credit logs...</p>
      </div>
    );
  }

  if (viewMode === 'purchase') {
    return (
      <PurchaseCreditPage
        onBack={() => setViewMode('overview')}
        onSuccess={() => fetchData(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Credits Control</h2>
          <p className="text-xs text-muted-foreground mt-1">Track and manage credit usage for your autonomous tasks and AI operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('purchase')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all cursor-pointer border-none shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Buy Credits
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Balance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance + Transaction Logs */}
        <div className="lg:col-span-2 space-y-6">
          <CreditBalanceCard
            credit={credit}
            getPlanBadgeClass={getPlanBadgeClass}
            getPercentage={getPercentage}
            onOpenPurchaseModal={() => setViewMode('purchase')}
          />
          <CreditTransactionLogs
            groupedHistory={groupedHistory}
            getActivityBadgeClass={getActivityBadgeClass}
          />
        </div>

        {/* Sidebar: Cost Rates + Upgrade */}
        <div className="space-y-6">
          <CreditCostRates />
          <CreditUpgradePrompt onOpenPurchaseModal={() => setViewMode('purchase')} />
        </div>
      </div>
    </div>
  );
}
