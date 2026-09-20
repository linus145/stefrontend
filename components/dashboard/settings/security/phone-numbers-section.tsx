'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';

interface PhoneNumbersSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export function PhoneNumbersSection({ expanded, onToggle }: PhoneNumbersSectionProps) {
  const { user, fetchProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [isSubmittingMobile, setIsSubmittingMobile] = useState(false);

  // Sync state if user data is loaded asynchronously
  useEffect(() => {
    if (user?.phone_number) {
      setPhoneNumber(user.phone_number);
    }
  }, [user?.phone_number]);

  const handleMobileNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !phoneNumber.trim()) {
      toast.error('Please enter a mobile number');
      return;
    }
    
    const clean = phoneNumber.replace(/[\s-]/g, '');
    if (!/^\+?[1-9]\d{7,14}$/.test(clean)) {
      toast.error('Please enter a valid phone number (e.g. +91 9876543210)');
      return;
    }

    setIsSubmittingMobile(true);
    try {
      await authService.updateMobileNumber(clean);
      if (fetchProfile) {
        await fetchProfile();
      }
      toast.success('Mobile number updated successfully');
      onToggle(); // Collapse the section upon success
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.data?.message || 'Failed to update mobile number');
    } finally {
      setIsSubmittingMobile(false);
    }
  };

  return (
    <div className="border-b border-border last:border-0">
       <button 
          onClick={onToggle}
          type="button"
          className="w-full flex items-center justify-between py-4 px-2 hover:bg-muted/30 rounded-sm transition-colors text-left cursor-pointer"
       >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2] shrink-0">
                <Smartphone className="w-4 h-4" />
             </div>
             <div>
                <h4 className="text-sm font-semibold text-foreground">Phone numbers</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                   {user?.phone_number ? `Current: ${user.phone_number}` : 'Add a mobile number to your account'}
                </p>
             </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
       </button>
       
       {expanded && (
          <div className="p-4 mx-2 mb-4 bg-muted/20 rounded-sm animate-in fade-in slide-in-from-top-1">
             <p className="text-sm text-muted-foreground mb-4">Adding a phone number helps you log in securely and recover your account.</p>
             <form onSubmit={handleMobileNumberSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md">
                <div className="flex-1">
                   <PhoneInput 
                      value={phoneNumber}
                      onChange={(val) => setPhoneNumber(val)}
                      defaultCountry="IN"
                      placeholder="98765 43210"
                      disabled={isSubmittingMobile}
                   />
                </div>
                <Button 
                   type="submit" 
                   disabled={isSubmittingMobile} 
                   className="h-10 text-xs font-semibold px-5 rounded-sm shrink-0 cursor-pointer bg-[#0a66c2] hover:bg-[#004182] text-white shadow-sm shadow-[#0a66c2]/20 transition-all disabled:opacity-60"
                >
                   {isSubmittingMobile ? 'Saving...' : (user?.phone_number ? 'Update Number' : 'Add Number')}
                </Button>
             </form>
          </div>
       )}
    </div>
  );
}
