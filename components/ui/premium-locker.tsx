'use client';

import React from 'react';
import { Lock, Sparkles, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

interface PremiumLockerProps {
  title: string;
  description: string;
  features: string[];
  backPath?: string;
}

export function PremiumLocker({ title, description, features, backPath = '/recruiter' }: PremiumLockerProps) {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-xl w-full bg-card/60 dark:bg-slate-900/40 backdrop-blur-xl border border-border/80 rounded-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0a66c2]/40 to-transparent" />

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Glowing Lock Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#0a66c2]/20 dark:bg-[#0a66c2]/10 blur-xl rounded-full scale-125 animate-pulse" />
            <div className="h-16 w-16 rounded-sm bg-gradient-to-br from-[#0a66c2]/10 to-[#0a66c2]/20 border border-[#0a66c2]/30 flex items-center justify-center text-[#0a66c2] relative">
              <Lock className="w-7 h-7" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-500 animate-bounce" />
            </div>
          </div>

          {/* Heading Info */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Unlock {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features Checklist */}
          <div className="w-full bg-slate-50/50 dark:bg-slate-900/20 border border-border/40 rounded-sm p-4 sm:p-5 text-left space-y-3.5">
            <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Included Premium Features
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-350">
              {features.map((feat, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#0a66c2] dark:text-blue-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <Link href="/recruiter" className="w-full sm:w-auto shrink-0 order-2 sm:order-1">
              <Button
                variant="outline"
                className="w-full h-11 px-6 font-bold text-xs rounded-sm border-border hover:bg-muted text-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Back
              </Button>
            </Link>

            <Link href="/dashboard?section=premium" className="w-full order-1 sm:order-2">
              <Button
                className="w-full h-11 px-6 font-bold text-xs rounded-sm bg-gradient-to-r from-[#0a66c2] to-indigo-600 hover:from-[#084e96] hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
              >
                Upgrade Plan <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
