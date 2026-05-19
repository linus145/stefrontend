'use client';

import React from 'react';
import { Key, X, EyeOff, Eye, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPortalUsername: string;
  setNewPortalUsername: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isSubmittingCredentials: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CredentialsModal({
  isOpen,
  onClose,
  newPortalUsername,
  setNewPortalUsername,
  newPassword,
  setNewPassword,
  showPassword,
  setShowPassword,
  isSubmittingCredentials,
  onSubmit
}: CredentialsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-850 dark:text-slate-200 flex items-center gap-1.5 font-sans">
            <Key className="h-4 w-4 text-amber-500" /> Update Account Credentials
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-slate-550 dark:text-slate-400 uppercase">Portal Username</label>
            <input
              type="text"
              required
              value={newPortalUsername}
              onChange={(e) => setNewPortalUsername(e.target.value)}
              placeholder="Enter unique portal username"
              className="w-full rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 transition-colors focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-semibold"
            />
            <p className="text-[9px] text-slate-450 dark:text-slate-500">Must be unique. You can use this to login to your employee portal.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-slate-550 dark:text-slate-400 uppercase">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password to change"
                className="w-full rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 pr-10 transition-colors focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 dark:text-slate-550 dark:hover:text-white transition-colors outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-450 dark:text-slate-500">Leave blank if you do not wish to change your password.</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingCredentials}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-sm px-6 cursor-pointer"
            >
              {isSubmittingCredentials ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
