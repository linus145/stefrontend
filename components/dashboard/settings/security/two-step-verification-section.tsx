'use client';

import React, { useState } from 'react';
import { Shield, ChevronDown, Check, ArrowRight, Mail, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TwoStepVerificationSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function TwoStepVerificationSection({ expanded, onToggle }: TwoStepVerificationSectionProps) {
  const { user, fetchProfile } = useAuth();
  const [setupMode2FA, setSetupMode2FA] = useState<'status' | 'setup'>('status');
  const [setupStep2FA, setSetupStep2FA] = useState<'secondary_email' | 'secondary_otp' | 'third_email' | 'third_otp'>('secondary_email');
  
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [thirdEmail, setThirdEmail] = useState('');
  const [secondaryOtp, setSecondaryOtp] = useState('');
  const [thirdOtp, setThirdOtp] = useState('');
  
  const [isSending2FA, setIsSending2FA] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const handleRequestSecondaryOTP = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!secondaryEmail) {
      toast.error('Please enter a secondary backup email.');
      return;
    }
    if (secondaryEmail === user?.email) {
      toast.error('Backup email cannot be the same as your primary account email.');
      return;
    }

    setIsSending2FA(true);
    try {
      await authService.requestSecondary2FAOTP(secondaryEmail);
      toast.success('Verification code sent!', {
        description: 'Please check your secondary backup email for the code.'
      });
      setSetupStep2FA('secondary_otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSending2FA(false);
    }
  };

  const handleVerifySecondaryOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secondaryOtp) {
      toast.error('Please enter the verification code.');
      return;
    }

    setIsVerifying2FA(true);
    try {
      await authService.verifySecondary2FAOTP(secondaryOtp);
      toast.success('Secondary email verified successfully!');
      setSetupStep2FA('third_email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleRequestThirdOTP = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!thirdEmail) {
      toast.error('Please enter a third backup email.');
      return;
    }
    if (thirdEmail === user?.email) {
      toast.error('Backup email cannot be the same as your primary account email.');
      return;
    }
    if (thirdEmail === secondaryEmail) {
      toast.error('Third email must be different from your secondary email.');
      return;
    }

    setIsSending2FA(true);
    try {
      await authService.requestThird2FAOTP(thirdEmail);
      toast.success('Verification code sent!', {
        description: 'Please check your third backup email for the code.'
      });
      setSetupStep2FA('third_otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSending2FA(false);
    }
  };

  const handleVerifyThirdOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thirdOtp) {
      toast.error('Please enter the verification code.');
      return;
    }

    setIsVerifying2FA(true);
    try {
      await authService.verifyThird2FAOTP(thirdOtp);
      toast.success('Two-step verification enabled successfully!');
      if (fetchProfile) await fetchProfile();
      setSetupMode2FA('status');
      setSetupStep2FA('secondary_email');
      setSecondaryEmail('');
      setThirdEmail('');
      setSecondaryOtp('');
      setThirdOtp('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = () => {
    toast('Disable Two-step verification?', {
      description: 'This will reduce your account security.',
      action: {
        label: 'Disable',
        onClick: async () => {
          setIsDisabling2FA(true);
          try {
            await authService.disable2FA();
            toast.success('Two-step verification has been disabled.');
            if (fetchProfile) await fetchProfile();
            // Reset inputs
            setSecondaryEmail('');
            setThirdEmail('');
            setSecondaryOtp('');
            setThirdOtp('');
            setSetupMode2FA('status');
            setSetupStep2FA('secondary_email');
          } catch (error: any) {
            toast.error('Failed to disable 2FA. Please try again.');
          } finally {
            setIsDisabling2FA(false);
          }
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    });
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
                <Shield className="w-4 h-4" />
             </div>
             <div>
                <h4 className="text-sm font-semibold text-foreground">Two-step verification</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Activate 2FA for enhanced account security</p>
             </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
       </button>
       
       {expanded && (
          <div className="p-4 mx-2 mb-4 bg-muted/20 rounded-sm animate-in fade-in slide-in-from-top-1 space-y-4">
             {user?.is_2fa_enabled ? (
                // Enabled State
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <div className="space-y-1">
                      <h5 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                         Status: <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">On</span>
                      </h5>
                      <p className="text-xs text-muted-foreground max-w-md">Two-step verification is active on your account. Backup verification codes will be sent to your primary and backup emails.</p>
                      <div className="pt-2 space-y-1">
                         <p className="text-[11px] text-foreground font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Secondary Backup: <span className="font-normal text-muted-foreground">{user?.secondary_email}</span>
                         </p>
                         <p className="text-[11px] text-foreground font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Third Backup: <span className="font-normal text-muted-foreground">{user?.third_email}</span>
                         </p>
                      </div>
                   </div>
                   {/* Animated Switch (ON state) */}
                   <div className="flex items-center shrink-0 pt-2 sm:pt-0">
                      <button
                         type="button"
                         onClick={handleDisable2FA}
                         disabled={isDisabling2FA}
                         className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary bg-emerald-500"
                      >
                         <span
                            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out translate-x-5"
                         />
                      </button>
                   </div>
                </div>
             ) : setupMode2FA === 'status' ? (
                // Disabled Status Mode
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <div>
                      <h5 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                         Status: <span className="text-xs font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">Off</span>
                      </h5>
                      <p className="text-xs text-muted-foreground max-w-md">Two-step verification adds an extra layer of security to your account by asking for a verification code when you sign in.</p>
                   </div>
                   {/* Animated Switch (OFF state) */}
                   <div className="flex items-center shrink-0 pt-2 sm:pt-0">
                      <button
                         type="button"
                         onClick={() => {
                            setSetupMode2FA('setup');
                            setSetupStep2FA('secondary_email');
                         }}
                         className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-primary bg-muted-foreground/30"
                      >
                         <span
                            className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"
                         />
                      </button>
                   </div>
                </div>
             ) : (
                // Sequential Setup Wizard Mode
                <div className="space-y-6">
                   {/* Stepper Header */}
                   <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                         <h5 className="text-sm font-bold text-foreground">Set up Two-step verification</h5>
                         <p className="text-xs text-muted-foreground mt-0.5">Please verify two backup emails, one after another.</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-bold text-[11px] px-2.5 py-0.5 rounded-sm">
                         <span>Step {setupStep2FA.startsWith('secondary') ? '1' : '2'} of 2</span>
                      </div>
                   </div>

                   {/* Stepper Indicator */}
                   <div className="grid grid-cols-2 gap-4 pb-2">
                      {/* Step 1 Indicator */}
                      <div className={cn(
                         "flex items-center gap-2.5 pb-2 border-b-2 transition-all",
                         setupStep2FA.startsWith('secondary') ? "border-primary" : "border-emerald-500"
                      )}>
                         <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0",
                            setupStep2FA.startsWith('secondary') 
                               ? "bg-primary text-primary-foreground" 
                               : "bg-emerald-500 text-white"
                         )}>
                            {setupStep2FA.startsWith('secondary') ? "1" : <Check className="w-3.5 h-3.5" />}
                         </div>
                         <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Secondary Email</p>
                            <p className="text-[10px] text-muted-foreground">
                               {setupStep2FA.startsWith('secondary') ? "Verifying..." : "Verified"}
                            </p>
                         </div>
                      </div>

                      {/* Step 2 Indicator */}
                      <div className={cn(
                         "flex items-center gap-2.5 pb-2 border-b-2 transition-all",
                         setupStep2FA.startsWith('third') ? "border-primary" : "border-transparent"
                      )}>
                         <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0",
                            setupStep2FA.startsWith('third') 
                               ? "bg-primary text-primary-foreground" 
                               : "bg-muted text-muted-foreground"
                         )}>
                            2
                         </div>
                         <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Third Email</p>
                            <p className="text-[10px] text-muted-foreground">
                               {setupStep2FA.startsWith('third') ? "Verifying..." : "Pending"}
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Step Forms */}
                   {setupStep2FA === 'secondary_email' && (
                      <form onSubmit={handleRequestSecondaryOTP} className="space-y-4 animate-in fade-in slide-in-from-right-1 duration-200">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Secondary Backup Email</label>
                            <div className="relative max-w-md">
                               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input 
                                  type="email"
                                  placeholder="backup1@email.com"
                                  value={secondaryEmail}
                                  onChange={(e) => setSecondaryEmail(e.target.value)}
                                  className="h-10 text-sm bg-background border-border pl-10 rounded-sm focus:ring-1 focus:ring-primary/40"
                                  required
                               />
                            </div>
                         </div>

                         <div className="flex justify-end gap-2.5 pt-2">
                            <Button 
                               type="button"
                               onClick={() => {
                                  setSetupMode2FA('status');
                                  setSecondaryEmail('');
                               }}
                               variant="ghost" 
                               className="h-9 px-4 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                               Cancel
                            </Button>
                            <Button 
                               type="submit"
                               disabled={isSending2FA}
                               className="h-9 px-5 rounded-sm bg-primary text-primary-foreground text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                               {isSending2FA ? 'Sending OTP...' : (
                                  <>
                                     Send Verification Code <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                               )}
                            </Button>
                         </div>
                      </form>
                   )}

                   {setupStep2FA === 'secondary_otp' && (
                      <form onSubmit={handleVerifySecondaryOTP} className="space-y-4 animate-in fade-in slide-in-from-right-1 duration-200">
                         <div>
                            <p className="text-xs text-muted-foreground">
                               We sent a code to <span className="font-semibold text-foreground">{secondaryEmail}</span>. Enter it below to verify.
                            </p>
                         </div>

                         <div className="space-y-1.5 max-w-xs">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Verification Code (OTP)</label>
                            <div className="relative">
                               <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input 
                                  type="text"
                                  maxLength={6}
                                  placeholder="6-digit code"
                                  value={secondaryOtp}
                                  onChange={(e) => setSecondaryOtp(e.target.value.replace(/\D/g, ''))}
                                  className="h-10 text-sm font-mono tracking-widest pl-10 bg-background border-border rounded-sm focus:ring-1 focus:ring-primary/40"
                                  required
                               />
                            </div>
                         </div>

                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <button
                               type="button"
                               onClick={(e) => handleRequestSecondaryOTP(e)}
                               disabled={isSending2FA}
                               className="text-xs text-primary hover:text-primary/80 font-semibold text-left transition-colors disabled:opacity-50 animate-pulse"
                            >
                               {isSending2FA ? 'Resending...' : 'Resend Code'}
                            </button>
                            <div className="flex gap-2.5 justify-end">
                               <Button 
                                  type="button"
                                  onClick={() => setSetupStep2FA('secondary_email')}
                                  variant="ghost" 
                                  className="h-9 px-4 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground"
                               >
                                  Back
                               </Button>
                               <Button 
                                  type="submit"
                                  disabled={isVerifying2FA}
                                  className="h-9 px-6 rounded-sm bg-primary text-primary-foreground text-xs font-bold transition-all shadow-sm"
                               >
                                  {isVerifying2FA ? 'Verifying...' : 'Verify Email'}
                               </Button>
                            </div>
                         </div>
                      </form>
                   )}

                   {setupStep2FA === 'third_email' && (
                      <form onSubmit={handleRequestThirdOTP} className="space-y-4 animate-in fade-in slide-in-from-right-1 duration-200">
                         <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-sm p-3 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                               Secondary backup email <span className="font-semibold">{secondaryEmail}</span> verified successfully!
                            </p>
                         </div>

                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Third Backup Email</label>
                            <div className="relative max-w-md">
                               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input 
                                  type="email"
                                  placeholder="backup2@email.com"
                                  value={thirdEmail}
                                  onChange={(e) => setThirdEmail(e.target.value)}
                                  className="h-10 text-sm bg-background border-border pl-10 rounded-sm focus:ring-1 focus:ring-primary/40"
                                  required
                               />
                            </div>
                         </div>

                         <div className="flex justify-end gap-2.5 pt-2">
                            <Button 
                               type="button"
                               onClick={() => {
                                  setSetupMode2FA('status');
                                  setSecondaryEmail('');
                                  setThirdEmail('');
                                  setSetupStep2FA('secondary_email');
                               }}
                               variant="ghost" 
                               className="h-9 px-4 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                               Cancel
                            </Button>
                            <Button 
                               type="submit"
                               disabled={isSending2FA}
                               className="h-9 px-5 rounded-sm bg-primary text-primary-foreground text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                               {isSending2FA ? 'Sending OTP...' : (
                                  <>
                                     Send Verification Code <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                               )}
                            </Button>
                         </div>
                      </form>
                   )}

                   {setupStep2FA === 'third_otp' && (
                      <form onSubmit={handleVerifyThirdOTP} className="space-y-4 animate-in fade-in slide-in-from-right-1 duration-200">
                         <div>
                            <p className="text-xs text-muted-foreground">
                               We sent a code to <span className="font-semibold text-foreground">{thirdEmail}</span>. Enter it below to activate Two-step verification.
                            </p>
                         </div>

                         <div className="space-y-1.5 max-w-xs">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Verification Code (OTP)</label>
                            <div className="relative">
                               <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                               <Input 
                                  type="text"
                                  maxLength={6}
                                  placeholder="6-digit code"
                                  value={thirdOtp}
                                  onChange={(e) => setThirdOtp(e.target.value.replace(/\D/g, ''))}
                                  className="h-10 text-sm font-mono tracking-widest pl-10 bg-background border-border rounded-sm focus:ring-1 focus:ring-primary/40"
                                  required
                               />
                            </div>
                         </div>

                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <button
                               type="button"
                               onClick={(e) => handleRequestThirdOTP(e)}
                               disabled={isSending2FA}
                               className="text-xs text-primary hover:text-primary/80 font-semibold text-left transition-colors disabled:opacity-50 animate-pulse"
                            >
                               {isSending2FA ? 'Resending...' : 'Resend Code'}
                            </button>
                            <div className="flex gap-2.5 justify-end">
                               <Button 
                                  type="button"
                                  onClick={() => setSetupStep2FA('third_email')}
                                  variant="ghost" 
                                  className="h-9 px-4 rounded-sm text-xs font-semibold text-muted-foreground hover:text-foreground"
                               >
                                  Back
                               </Button>
                               <Button 
                                  type="submit"
                                  disabled={isVerifying2FA}
                                  className="h-9 px-6 rounded-sm bg-primary text-primary-foreground text-xs font-bold transition-all shadow-sm"
                               >
                                  {isVerifying2FA ? 'Verifying...' : 'Verify & Enable 2FA'}
                               </Button>
                            </div>
                         </div>
                      </form>
                   )}
                </div>
             )}
          </div>
       )}
    </div>
  );
}
