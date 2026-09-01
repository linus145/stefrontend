'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Shield, FileText, Calendar, Landmark, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmployeeStatutoryTabProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
}

export function EmployeeStatutoryTab({
  formData,
  handleChange,
  handleCheckboxChange,
}: EmployeeStatutoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Aadhaar Details Card */}
      <Card className="border-border/40 bg-card rounded-sm shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#0a66c2]" /> Aadhaar Details (UID)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aadhaar_verified"
                checked={formData.aadhaar_verified}
                onChange={(e) => handleCheckboxChange('aadhaar_verified', e.target.checked)}
                className="h-4 w-4 text-[#0a66c2] border-border rounded cursor-pointer"
                data-agent="employee-aadhaar-verified-checkbox"
              />
              <label htmlFor="aadhaar_verified" className="text-[11px] font-bold text-muted-foreground cursor-pointer select-none uppercase tracking-wide">
                Verified
              </label>
              {formData.aadhaar_verified ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aadhaar Number (12 Digits)</label>
            <Input id="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} placeholder="XXXX XXXX XXXX" maxLength={14} className="rounded-sm bg-white" data-agent="employee-aadhaar-number-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Enrollment Number (Optional)</label>
            <Input id="aadhaar_enrollment_no" value={formData.aadhaar_enrollment_no} onChange={handleChange} placeholder="Enrollment No" className="rounded-sm bg-white" data-agent="employee-aadhaar-enrollment-input" />
          </div>
        </CardContent>
      </Card>

      {/* PAN Details Card */}
      <Card className="border-border/40 bg-card rounded-sm shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#0a66c2]" /> PAN Details
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pan_verified"
                checked={formData.pan_verified}
                onChange={(e) => handleCheckboxChange('pan_verified', e.target.checked)}
                className="h-4 w-4 text-[#0a66c2] border-border rounded cursor-pointer"
                data-agent="employee-pan-verified-checkbox"
              />
              <label htmlFor="pan_verified" className="text-[11px] font-bold text-muted-foreground cursor-pointer select-none uppercase tracking-wide">
                Verified
              </label>
              {formData.pan_verified ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-1.5 max-w-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PAN Number</label>
            <Input id="pan_number" value={formData.pan_number} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} className="rounded-sm bg-white" data-agent="employee-pan-number-input" />
          </div>
        </CardContent>
      </Card>

      {/* Bank Details Card */}
      <Card className="border-border/40 bg-card rounded-sm shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Landmark className="h-4 w-4 text-[#0a66c2]" /> Bank Account Details
          </h4>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bank Name</label>
            <div className="relative">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="e.g. State Bank of India" className="rounded-sm bg-white pl-10" data-agent="employee-bank-name-input" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="account_number" value={formData.account_number} onChange={handleChange} placeholder="Account Number" className="rounded-sm bg-white pl-10" data-agent="employee-bank-account-input" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">IFSC / Routing Code</label>
            <Input id="ifsc_code" value={formData.ifsc_code} onChange={handleChange} placeholder="IFSC Code" className="rounded-sm bg-white" data-agent="employee-bank-ifsc-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Holder Name</label>
            <Input id="account_holder_name" value={formData.account_holder_name} onChange={handleChange} placeholder="Holder Name" className="rounded-sm bg-white" data-agent="employee-bank-holder-input" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch Location / Address</label>
            <Input id="branch_name" value={formData.branch_name} onChange={handleChange} placeholder="Branch Location" className="rounded-sm bg-white" data-agent="employee-bank-branch-input" />
          </div>
        </CardContent>
      </Card>

      {/* Joining & Onboarding details */}
      <Card className="border-border/40 bg-card rounded-sm shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#0a66c2]" /> Onboarding & Joining Details
          </h4>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date Joined</label>
            <Input id="joining_date" type="date" value={formData.joining_date} onChange={handleChange} className="rounded-sm bg-white" data-agent="employee-joining-date-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Probation Period</label>
            <Input id="probation_period" value={formData.probation_period} onChange={handleChange} placeholder="e.g. 3 Months" className="rounded-sm bg-white" data-agent="employee-probation-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirmation Date</label>
            <Input id="confirmation_date" type="date" value={formData.confirmation_date} onChange={handleChange} className="rounded-sm bg-white" data-agent="employee-confirmation-date-input" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
