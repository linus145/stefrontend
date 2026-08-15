'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, CreditCard, Coins, CheckCircle2, Clock, AlertCircle, RefreshCw, Search, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { creditsService } from '@/services/credits.service';
import { CreditTransaction } from '@/types/credits.types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UnifiedTransaction {
  id: string;
  type: 'plan_payment' | 'credit_purchase' | 'credit_allocation' | 'credit_burn';
  category: 'Plan' | 'Credits';
  title: string;
  transactionId?: string;
  amountText: string;
  paymentMethod?: string;
  status: 'approved' | 'pending' | 'rejected' | 'active';
  date: string;
  rawDate: Date;
  details?: string;
}

export function TransactionLogsTab() {
  const { userSubscription } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'plans' | 'credits' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch credit transaction history with live auto-polling
  const { data: historyRes, isLoading: loading, refetch: refetchTransactions } = useQuery({
    queryKey: ['creditHistory'],
    queryFn: () => creditsService.getTransactionHistory(),
    staleTime: 0,
    refetchInterval: 5000,
  });

  const creditLogs: CreditTransaction[] = React.useMemo(() => {
    const rawData: any = historyRes;
    if (!rawData) return [];
    if (Array.isArray(rawData.data?.data)) return rawData.data.data;
    if (Array.isArray(rawData.data)) return rawData.data;
    if (Array.isArray(rawData)) return rawData;
    return [];
  }, [historyRes]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetchTransactions().then(() => {
      setRefreshing(false);
      toast.success("Transaction logs refreshed.");
    }).catch(() => setRefreshing(false));
  };

  // Combine subscription manual payment proof + credit transactions into unified array
  const unifiedTransactions = React.useMemo(() => {
    const list: UnifiedTransaction[] = [];

    // 1. Subscription Plan Payments from userSubscription
    if (userSubscription?.latest_payment) {
      const p = userSubscription.latest_payment;
      const isVerified = userSubscription.is_payment_verified;
      const subTxnId = p.transaction_id || (p.id ? `SUB-${String(p.id).slice(0, 8).toUpperCase()}` : undefined);
      list.push({
        id: p.id || `sub-pmt-${p.transaction_id}`,
        type: 'plan_payment',
        category: 'Plan',
        title: `Subscription Plan Payment (${userSubscription.plan_details?.name || 'Premium Plan'})`,
        transactionId: subTxnId,
        amountText: `₹${Number(userSubscription.plan_details?.price || 0).toLocaleString()}`,
        paymentMethod: p.payment_method || 'UPI/Bank',
        status: isVerified ? 'approved' : (p.status || 'pending'),
        date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
        rawDate: p.created_at ? new Date(p.created_at) : new Date(),
        details: `Bank: ${p.bank_name || 'UPI'} • Type: ${p.payment_type || 'New'}`
      });
    } else if (userSubscription?.plan_details && Number(userSubscription.plan_details.price) > 0) {
      list.push({
        id: `sub-plan-${userSubscription.id}`,
        type: 'plan_payment',
        category: 'Plan',
        title: `Subscription Plan (${userSubscription.plan_details.name})`,
        transactionId: `SUB-${String(userSubscription.id).slice(0, 8).toUpperCase()}`,
        amountText: `₹${Number(userSubscription.plan_details.price).toLocaleString()}`,
        status: userSubscription.is_payment_verified ? 'approved' : 'pending',
        date: 'Active Plan',
        rawDate: new Date(),
        details: `Status: ${userSubscription.status || 'Active'}`
      });
    }

    // 2. AI Credit Payment & Allocation Transactions from creditLogs (excluding burn logs)
    creditLogs.forEach((tx) => {
      const isPurchase = tx.activity_type === 'purchase';
      const isAllocation = tx.activity_type === 'allocation';

      // Skip usage/burn logs - Settings transaction log only shows payment & allocation history
      if (!isPurchase && !isAllocation) return;

      let txnId = '';
      let txStatus = 'approved';
      let method = '';

      if (tx.description && tx.description.toLowerCase().includes('pending verification')) {
        txStatus = 'pending';
      }

      if (tx.metadata) {
        let metaObj: any = tx.metadata;
        if (typeof tx.metadata === 'string') {
          try {
            metaObj = JSON.parse(tx.metadata);
          } catch (e) {
            metaObj = {};
          }
        }
        if (metaObj.transaction_id) txnId = String(metaObj.transaction_id);
        if (metaObj.status) txStatus = String(metaObj.status);
        if (metaObj.payment_method) method = String(metaObj.payment_method);
      }

      // Regex fallback extraction from description e.g. "Txn ID: 423904810293"
      if (!txnId && tx.description) {
        const match = tx.description.match(/Txn ID:\s*([^\s,]+)/i) || tx.description.match(/Ref No:\s*([^\s,]+)/i);
        if (match && match[1]) {
          txnId = match[1];
        }
      }

      // Secondary fallback to short UUID transaction reference
      if (!txnId && tx.id) {
        txnId = `TXN-${String(tx.id).slice(0, 8).toUpperCase()}`;
      }

      const type: UnifiedTransaction['type'] = isPurchase ? 'credit_purchase' : 'credit_allocation';

      let amountStr = `${tx.amount > 0 ? '+' : ''}${tx.amount} Credits`;
      if (isPurchase && tx.metadata && (tx.metadata as any).package_name) {
        amountStr += ` (${(tx.metadata as any).package_name})`;
      }

      list.push({
        id: tx.id,
        type,
        category: 'Credits',
        title: isPurchase ? 'AI Credit Top-up Purchase' : 'Monthly Plan Credit Allocation',
        transactionId: txnId,
        amountText: amountStr,
        paymentMethod: method || undefined,
        status: txStatus === 'pending' ? 'pending' : (txStatus === 'rejected' ? 'rejected' : 'approved'),
        date: new Date(tx.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        rawDate: new Date(tx.created_at),
        details: tx.description || 'AI Credit payment transaction'
      });
    });

    // Sort chronologically descending
    return list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [userSubscription, creditLogs]);

  // Filtered List
  const filteredList = React.useMemo(() => {
    return unifiedTransactions.filter((item) => {
      // Filter tab
      if (filterType === 'plans' && item.category !== 'Plan') return false;
      if (filterType === 'credits' && item.category !== 'Credits') return false;
      if (filterType === 'pending' && item.status !== 'pending') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTxnId = item.transactionId?.toLowerCase().includes(q);
        const matchesDetails = item.details?.toLowerCase().includes(q);
        return matchesTitle || matchesTxnId || matchesDetails;
      }

      return true;
    });
  }, [unifiedTransactions, filterType, searchQuery]);

  const getStatusBadge = (status: UnifiedTransaction['status']) => {
    switch (status) {
      case 'approved':
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified & Approved</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>Pending Verification</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Rejected</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <RefreshCw className="w-7 h-7 text-[#0a66c2] animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Loading transaction logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0a66c2]" />
            <span>Transaction Logs & Payment History</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Combined payment history records for subscription plans and AI credit top-ups
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-sm border border-border/60">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-bold rounded-sm transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-[#0a66c2] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Logs ({unifiedTransactions.length})
          </button>
          <button
            onClick={() => setFilterType('plans')}
            className={`px-3 py-1 text-xs font-bold rounded-sm transition-all cursor-pointer ${
              filterType === 'plans' ? 'bg-[#0a66c2] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Plan Payments
          </button>
          <button
            onClick={() => setFilterType('credits')}
            className={`px-3 py-1 text-xs font-bold rounded-sm transition-all cursor-pointer ${
              filterType === 'credits' ? 'bg-[#0a66c2] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Credit Purchases
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1 text-xs font-bold rounded-sm transition-all cursor-pointer ${
              filterType === 'pending' ? 'bg-[#0a66c2] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Verification
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Txn ID, plan or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs rounded-sm border-border bg-card"
          />
        </div>
      </div>

      {/* Transactions Table / List */}
      {filteredList.length === 0 ? (
        <div className="bg-card border border-border rounded-sm p-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">No transaction logs found</h4>
          <p className="text-xs text-muted-foreground">
            {searchQuery ? "No payment or credit transactions match your search query." : "Payment and credit top-up history will appear here after transactions are created."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title / Description</th>
                  <th className="py-3 px-4">Txn ID / Ref</th>
                  <th className="py-3 px-4">Amount / Credits</th>
                  <th className="py-3 px-4 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                        item.category === 'Plan'
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                      }`}>
                        {item.category === 'Plan' ? <CreditCard className="w-3 h-3" /> : <Coins className="w-3 h-3" />}
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
                        {item.details}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-foreground">
                      {item.transactionId ? (
                        <span className="bg-muted/50 px-1.5 py-0.5 rounded-sm border border-border/50">
                          {item.transactionId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                      {item.amountText}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end">
                        {getStatusBadge(item.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
