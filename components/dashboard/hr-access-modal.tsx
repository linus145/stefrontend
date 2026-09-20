'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2, CheckCircle2, AlertCircle, Building2,
  Sparkles, ArrowRight, X
} from 'lucide-react';
import { jobsService } from '@/services/jobs.service';

interface HrAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToJobs: () => void;
  isPremium: boolean;
}

export function HrAccessModal({
  isOpen,
  onClose,
  onGoToJobs,
  isPremium,
}: HrAccessModalProps) {
  const [stage, setStage] = useState<'checking' | 'granted' | 'restricted'>('checking');
  const [subStatus, setSubStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [compStatus, setCompStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [companyName, setCompanyName] = useState<string>('');

  // Position coordinates: sits above collapsed message tab, or beside it when opened
  const [bottomPx, setBottomPx] = useState<number>(64);
  const [rightPx, setRightPx] = useState<number>(32);

  // Track the floating message bar state in real-time
  useEffect(() => {
    if (!isOpen) return;

    const adaptToMessenger = () => {
      const messengerEl = document.getElementById('linkedin-messenger-card');
      if (messengerEl) {
        const h = messengerEl.offsetHeight || 48;
        const w = messengerEl.offsetWidth || 320;

        // When messenger is opened (> 90px tall), do NOT push popup up to the top.
        // Instead, position it to the left side of the messenger window at the bottom.
        if (h > 90) {
          setBottomPx(20);
          setRightPx(w + 48); // ~368px
        } else {
          // When messenger is collapsed (48px tall), sit directly above it
          setBottomPx(h + 12); // ~60px
          setRightPx(32);
        }
      } else {
        setBottomPx(24);
        setRightPx(32);
      }
    };

    adaptToMessenger();

    const messengerEl = document.getElementById('linkedin-messenger-card');
    let ro: ResizeObserver | null = null;
    if (messengerEl) {
      ro = new ResizeObserver(() => {
        adaptToMessenger();
      });
      ro.observe(messengerEl);
    }

    window.addEventListener('resize', adaptToMessenger);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', adaptToMessenger);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStage('checking');
      setSubStatus('checking');
      setCompStatus('checking');
      setCompanyName('');
      return;
    }

    let isMounted = true;

    const performChecks = async () => {
      setStage('checking');
      setSubStatus('checking');
      setCompStatus('checking');

      // Visual delay for natural feedback
      await new Promise((r) => setTimeout(r, 450));
      if (!isMounted) return;

      // Query Django backend for DB-verified company registration and active subscription
      let hasCompany = false;
      let registeredName = '';
      let hasActiveSub = isPremium;

      try {
        const res = await jobsService.checkCompany();
        if (res?.data?.has_company && res?.data?.company?.company_name) {
          hasCompany = true;
          registeredName = res.data.company.company_name;
        }
        if (res?.data?.has_active_subscription !== undefined) {
          hasActiveSub = Boolean(res.data.has_active_subscription);
        }
      } catch {
        hasCompany = false;
      }

      if (!isMounted) return;
      setCompanyName(registeredName);
      setCompStatus(hasCompany ? 'valid' : 'invalid');
      setSubStatus(hasActiveSub ? 'valid' : 'invalid');

      if (hasActiveSub && hasCompany) {
        setStage('granted');
        setTimeout(() => {
          if (isMounted) {
            window.open('/Hrtools', '_blank');
            onClose();
          }
        }, 800);
      } else {
        setStage('restricted');
      }
    };

    performChecks();

    return () => {
      isMounted = false;
    };
  }, [isOpen, isPremium, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        bottom: `${bottomPx}px`,
        right: `${rightPx}px`,
      }}
      className="fixed z-50 w-full max-w-[300px] rounded-sm bg-card border border-border shadow-[0_8px_30px_rgba(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] p-3 transition-all duration-300 ease-in-out select-none animate-in fade-in slide-in-from-bottom-2"
    >
      {/* Top Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2.5 right-2.5 p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        title="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Inline Status Row */}
      <div className="flex items-center gap-2 mb-2 pr-6">
        {stage === 'checking' && (
          <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
        )}
        {stage === 'granted' && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        )}
        {stage === 'restricted' && (
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        )}
        <span className="text-xs font-semibold text-foreground truncate">
          {stage === 'checking' && 'Checking HR Suite Access'}
          {stage === 'granted' && 'Access Approved'}
          {stage === 'restricted' && 'Company Profile Required'}
        </span>
      </div>

      {/* Verification Checklist */}
      <div className="space-y-1.5 rounded-sm bg-muted/40 border border-border/50 p-2 text-[11px]">
        {/* Subscription Check */}
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground">Subscription</span>
          </div>
          <div>
            {subStatus === 'checking' && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Checking...
              </span>
            )}
            {subStatus === 'valid' && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            )}
            {subStatus === 'invalid' && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle className="w-3 h-3" />
                Not Active
              </span>
            )}
          </div>
        </div>

        <div className="h-px bg-border/40 w-full" />

        {/* Company Profile Check */}
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground">Company</span>
          </div>
          <div>
            {compStatus === 'checking' && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Checking...
              </span>
            )}
            {compStatus === 'valid' && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[110px]" title={companyName}>
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{companyName || 'Registered'}</span>
              </span>
            )}
            {compStatus === 'invalid' && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle className="w-3 h-3" />
                Not Registered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {stage === 'restricted' && (
        <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={onGoToJobs}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group"
          >
            <span>Go to Jobs Section to Register</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}
