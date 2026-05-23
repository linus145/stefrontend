'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, ChevronDown, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChangePasswordSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function ChangePasswordSection({ expanded, onToggle }: ChangePasswordSectionProps) {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [password2FARequired, setPassword2FARequired] = useState(false);
  const [passwordSecondaryOtp, setPasswordSecondaryOtp] = useState('');
  const [passwordThirdOtp, setPasswordThirdOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResendPasswordOTPs = async () => {
    setIsSubmitting(true);
    try {
      const res = await authService.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      if (res.status === '2fa_required') {
        toast.success('Verification codes resent successfully!', {
          description: 'Please check both backup emails for the new OTP codes.'
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend verification codes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      };

      if (password2FARequired) {
        if (!passwordSecondaryOtp || !passwordThirdOtp) {
          toast.error('Please enter both verification codes.');
          setIsSubmitting(false);
          return;
        }
        payload.secondary_otp = passwordSecondaryOtp;
        payload.third_otp = passwordThirdOtp;
      }

      const res = await authService.changePassword(payload);
      
      if (res.status === '2fa_required') {
        setPassword2FARequired(true);
        toast.success('Verification codes sent!', {
          description: 'A 2FA check is required. Please check both backup emails for the OTP codes.'
        });
      } else {
        toast.success('Password updated successfully');
        setPasswords({ old_password: '', new_password: '', confirm_password: '' });
        setPassword2FARequired(false);
        setPasswordSecondaryOtp('');
        setPasswordThirdOtp('');
        onToggle(); // Collapse section on success
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-border last:border-0">
       <button 
          onClick={onToggle}
          type="button"
          className="w-full flex items-center justify-between py-4 px-2 hover:bg-muted/30 rounded-sm transition-colors text-left"
       >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Lock className="w-4 h-4" />
             </div>
             <div>
                <h4 className="text-sm font-semibold text-foreground">Change password</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a unique password to protect your account</p>
             </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
       </button>
       
       {expanded && (
          <div className="p-4 sm:p-6 mx-2 mb-4 bg-muted/20 rounded-sm animate-in fade-in slide-in-from-top-1">
             <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-1.5 group">
                   <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Current Password</label>
                   <div className="relative">
                      <Input 
                         type={showPasswords.old ? "text" : "password"} 
                         value={passwords.old_password} 
                         onChange={(e) => setPasswords({...passwords, old_password: e.target.value})} 
                         className="h-10 bg-background border-border rounded-sm pr-10 focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm" 
                         placeholder="Enter current password"
                         required
                      />
                      <button 
                         type="button" 
                         onClick={() => setShowPasswords(prev => ({...prev, old: !prev.old}))}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                         {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                   </div>
                </div>
                <div className="space-y-1.5 group">
                   <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">New Password</label>
                   <div className="relative">
                      <Input 
                         type={showPasswords.new ? "text" : "password"} 
                         value={passwords.new_password} 
                         onChange={(e) => setPasswords({...passwords, new_password: e.target.value})} 
                         className="h-10 bg-background border-border rounded-sm pr-10 focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm" 
                         placeholder="Enter new password"
                         required
                      />
                      <button 
                         type="button" 
                         onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                         {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                   </div>
                </div>
                <div className="space-y-1.5 group">
                   <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Confirm New Password</label>
                   <div className="relative">
                      <Input 
                         type={showPasswords.confirm ? "text" : "password"} 
                         value={passwords.confirm_password} 
                         onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})} 
                         className="h-10 bg-background border-border rounded-sm pr-10 focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm" 
                         placeholder="Confirm new password"
                         required
                      />
                      <button 
                         type="button" 
                         onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                         {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                   </div>
                </div>
                {password2FARequired && (
                   <div className="pt-4 border-t border-border mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm p-3 flex items-center gap-2">
                         <Shield className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                         <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                            Two-step verification is active. Verification codes have been sent to your backup emails to authorize this change.
                         </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5 block">Secondary Email Code (OTP)</label>
                            {user?.secondary_email && (
                               <p className="text-[10px] text-muted-foreground ml-0.5 truncate leading-tight">
                                  Sent to: <span className="font-semibold text-foreground">{user.secondary_email}</span>
                               </p>
                            )}
                            <div className="relative">
                               <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input 
                                  type="text"
                                  maxLength={6}
                                  placeholder="6-digit code"
                                  value={passwordSecondaryOtp}
                                  onChange={(e) => setPasswordSecondaryOtp(e.target.value.replace(/\D/g, ''))}
                                  className="h-10 text-sm font-mono tracking-widest pl-10 bg-background border-border rounded-sm focus:ring-1 focus:ring-primary/40"
                                  required
                               />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5 block">Third Email Code (OTP)</label>
                            {user?.third_email && (
                               <p className="text-[10px] text-muted-foreground ml-0.5 truncate leading-tight">
                                  Sent to: <span className="font-semibold text-foreground">{user.third_email}</span>
                               </p>
                            )}
                            <div className="relative">
                               <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input 
                                  type="text"
                                  maxLength={6}
                                  placeholder="6-digit code"
                                  value={passwordThirdOtp}
                                  onChange={(e) => setPasswordThirdOtp(e.target.value.replace(/\D/g, ''))}
                                  className="h-10 text-sm font-mono tracking-widest pl-10 bg-background border-border rounded-sm focus:ring-1 focus:ring-primary/40"
                                  required
                               />
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-start">
                         <button
                            type="button"
                            onClick={handleResendPasswordOTPs}
                            disabled={isSubmitting}
                            className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors disabled:opacity-50"
                         >
                            {isSubmitting ? 'Resending...' : 'Resend Codes'}
                         </button>
                      </div>
                   </div>
                )}

                <Button 
                   type="submit" 
                   disabled={isSubmitting} 
                   className="w-full sm:w-auto rounded-sm bg-primary text-primary-foreground font-semibold text-xs px-6 h-10 shadow-sm hover:translate-y-[-1px] active:scale-95 transition-all mt-4"
                >
                   {isSubmitting ? 'Updating...' : (password2FARequired ? 'Verify & Save Password' : 'Save password')}
                </Button>
             </form>
          </div>
       )}
    </div>
  );
}
