'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PhoneNumbersSection } from './phone-numbers-section';
import { ChangePasswordSection } from './change-password-section';
import { TwoStepVerificationSection } from './two-step-verification-section';

export function SecurityTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6 mt-0">
      <div>
         <h3 className="text-2xl font-semibold text-foreground tracking-tight">Security & Login</h3>
         <p className="text-muted-foreground text-sm font-medium mt-1">Manage your password and secure your account.</p>
      </div>
      
      <Card className="rounded-sm border-border bg-card shadow-sm p-2 sm:p-4">
         <div className="flex flex-col">
            <PhoneNumbersSection 
               expanded={expandedSection === 'mobile'} 
               onToggle={() => setExpandedSection(prev => prev === 'mobile' ? null : 'mobile')}
            />
            
            <ChangePasswordSection 
               expanded={expandedSection === 'password'} 
               onToggle={() => setExpandedSection(prev => prev === 'password' ? null : 'password')}
            />
            
            <TwoStepVerificationSection 
               expanded={expandedSection === '2fa'} 
               onToggle={() => setExpandedSection(prev => prev === '2fa' ? null : '2fa')}
            />
         </div>
      </Card>
    </div>
  );
}
