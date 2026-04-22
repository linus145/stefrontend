'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Smartphone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SecurityTab() {
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
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingMobile, setIsSubmittingMobile] = useState(false);

  const handleMobileNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Please enter a mobile number');
      return;
    }
    
    setIsSubmittingMobile(true);
    try {
      await authService.updateMobileNumber(phoneNumber);
      toast.success('Mobile number updated successfully');
      setExpandedSection(null);
      // Optional: trigger a refetch of the user data if your auth context supports it.
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update mobile number');
    } finally {
      setIsSubmittingMobile(false);
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
      await authService.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      toast.success('Password updated successfully');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
      setExpandedSection(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-0">
      <div>
         <h3 className="text-2xl font-semibold text-foreground tracking-tight">Security & Login</h3>
         <p className="text-muted-foreground text-sm font-medium mt-1">Manage your password and secure your account.</p>
      </div>
      
      <Card className="rounded-lg border-border bg-card shadow-sm p-2 sm:p-4">
         <div className="flex flex-col">
            {/* Add mobile number Section */}
            <div className="border-b border-border last:border-0">
               <button 
                  onClick={() => setExpandedSection(prev => prev === 'mobile' ? null : 'mobile')}
                  className="w-full flex items-center justify-between py-4 px-2 hover:bg-muted/30 rounded-md transition-colors text-left"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Smartphone className="w-4 h-4" />
                     </div>
                     <div>
                        <h4 className="text-sm font-semibold text-foreground">Phone numbers</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Add a mobile number to your account</p>
                     </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedSection === 'mobile' && "rotate-180")} />
               </button>
               
               {expandedSection === 'mobile' && (
                  <div className="p-4 mx-2 mb-4 bg-muted/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                     <p className="text-sm text-muted-foreground mb-4">Adding a phone number helps you log in securely and recover your account.</p>
                     <form onSubmit={handleMobileNumberSubmit} className="flex gap-2 max-w-sm">
                        <Input 
                           type="tel" 
                           placeholder="Enter mobile number" 
                           className="h-10 text-sm bg-background" 
                           value={phoneNumber}
                           onChange={(e) => setPhoneNumber(e.target.value)}
                           required
                        />
                        <Button type="submit" disabled={isSubmittingMobile} className="h-10 text-xs px-4">
                           {isSubmittingMobile ? 'Saving...' : 'Add Number'}
                        </Button>
                     </form>
                  </div>
               )}
            </div>

            {/* Change Password Section */}
            <div className="border-b border-border last:border-0">
               <button 
                  onClick={() => setExpandedSection(prev => prev === 'password' ? null : 'password')}
                  className="w-full flex items-center justify-between py-4 px-2 hover:bg-muted/30 rounded-md transition-colors text-left"
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
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedSection === 'password' && "rotate-180")} />
               </button>
               
               {expandedSection === 'password' && (
                  <div className="p-4 sm:p-6 mx-2 mb-4 bg-muted/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                     <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div className="space-y-1.5 group">
                           <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">Current Password</label>
                           <div className="relative">
                              <Input 
                                 type={showPasswords.old ? "text" : "password"} 
                                 value={passwords.old_password} 
                                 onChange={(e) => setPasswords({...passwords, old_password: e.target.value})} 
                                 className="h-10 bg-background border-border rounded-lg pr-10 focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm" 
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
                                 className="h-10 bg-background border-border rounded-lg pr-10 focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm" 
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
                                 className="h-10 bg-background border-border rounded-lg pr-10 focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm" 
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
                        <Button 
                           type="submit" 
                           disabled={isSubmitting} 
                           className="w-full sm:w-auto rounded-lg bg-primary text-primary-foreground font-semibold text-xs px-6 h-10 shadow-sm hover:translate-y-[-1px] active:scale-95 transition-all mt-4"
                        >
                           {isSubmitting ? 'Updating...' : 'Save password'}
                        </Button>
                     </form>
                  </div>
               )}
            </div>

            {/* 2FA Section */}
            <div className="border-b border-border last:border-0">
               <button 
                  onClick={() => setExpandedSection(prev => prev === '2fa' ? null : '2fa')}
                  className="w-full flex items-center justify-between py-4 px-2 hover:bg-muted/30 rounded-md transition-colors text-left"
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
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedSection === '2fa' && "rotate-180")} />
               </button>
               
               {expandedSection === '2fa' && (
                  <div className="p-4 mx-2 mb-4 bg-muted/20 rounded-lg animate-in fade-in slide-in-from-top-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div>
                        <h5 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                           Status: <span className="text-muted-foreground font-normal">Off</span>
                        </h5>
                        <p className="text-sm text-muted-foreground max-w-md">Two-step verification adds an extra layer of security to your account by asking for a verification code when you sign in.</p>
                     </div>
                     <Button variant="outline" className="shrink-0 h-10 text-xs rounded-lg">Set up</Button>
                  </div>
               )}
            </div>

         </div>
      </Card>
    </div>
  );
}
