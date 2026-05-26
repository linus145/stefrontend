'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { hrOrgService, hrEmployeeService } from '@/services/hr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, User, Shield, FileText, Calendar, Building, Globe, MapPin, 
  Phone, Mail, CheckCircle2, AlertCircle, Briefcase, Loader2, Save, Landmark, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'personal' | 'statutory'>('personal');

  const { data: designationsRes } = useQuery({
    queryKey: ['designations'],
    queryFn: () => hrOrgService.getDesignations(),
  });

  const { data: departmentsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrOrgService.getDepartments(),
  });

  const designations = designationsRes?.data?.results || [];
  const departments = departmentsRes?.data?.results || [];
  
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    salary: '',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    address: '',
    designation: '',
    department: '',
    
    // Aadhaar
    aadhaar_number: '',
    aadhaar_enrollment_no: '',
    aadhaar_verified: false,
    
    // PAN
    pan_number: '',
    pan_verified: false,
    
    // Onboarding
    joining_date: new Date().toISOString().split('T')[0],
    probation_period: '3 Months',
    confirmation_date: '',
    
    // Bank Details
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    branch_name: '',
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: any) => hrEmployeeService.addManualEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Employee created successfully');
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to create employee')
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setNewEmployee(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setNewEmployee(prev => ({ ...prev, [id]: checked }));
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.first_name || !newEmployee.email) {
      toast.error('First name and email are required');
      return;
    }

    const payload = {
      first_name: newEmployee.first_name,
      last_name: newEmployee.last_name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      salary: newEmployee.salary ? parseFloat(newEmployee.salary) : 0,
      employment_type: newEmployee.employment_type,
      status: newEmployee.status,
      address: newEmployee.address,
      designation: newEmployee.designation || null,
      department: newEmployee.department || null,
      aadhaar_detail: {
        aadhaar_number: newEmployee.aadhaar_number,
        enrollment_no: newEmployee.aadhaar_enrollment_no,
        verified: newEmployee.aadhaar_verified,
      },
      pan_detail: {
        pan_number: newEmployee.pan_number,
        verified: newEmployee.pan_verified,
      },
      joining_detail: {
        joining_date: newEmployee.joining_date || null,
        probation_period: newEmployee.probation_period,
        confirmation_date: newEmployee.confirmation_date || null,
      },
      bank_detail: {
        bank_name: newEmployee.bank_name,
        account_number: newEmployee.account_number,
        ifsc_code: newEmployee.ifsc_code,
        account_holder_name: newEmployee.account_holder_name,
        branch_name: newEmployee.branch_name,
      }
    };

    createEmployeeMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <Button 
          type="button"
          onClick={() => onOpenChange(false)}
          variant="outline" 
          className="h-10 px-4 border-border hover:bg-blue-50/30 text-muted-foreground font-bold text-xs rounded-sm gap-2 shadow-sm transition-all"
          data-agent="employee-back-btn"
        >
          <ArrowLeft className="h-4 w-4 text-[#0a66c2]" /> Back 
        </Button>
      </div>

      <form onSubmit={handleCreateEmployee} className="space-y-6">
        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-sm shadow-xl overflow-hidden">
          {/* Symmetrical Header & Tab Selector */}
          <div className="bg-muted/30 p-6 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-[#0a66c2]">Add New Employee</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Onboard a new employee by providing their personal profile, statutory info, and salary bank details.
              </CardDescription>
            </div>

            <div className="flex items-center bg-muted/50 p-1 rounded-[6px] border border-border/20 h-9">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={cn(
                  "px-4 py-1 rounded-[6px] text-[10px] font-bold transition-all whitespace-nowrap h-full flex items-center gap-1",
                  activeTab === 'personal'
                    ? "bg-white text-[#0a66c2] shadow-sm border border-border/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/30"
                )}
                data-agent="employee-tab-personal-btn"
              >
                <User className="h-3 w-3" /> Personal Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('statutory')}
                className={cn(
                  "px-4 py-1 rounded-[6px] text-[10px] font-bold transition-all whitespace-nowrap h-full flex items-center gap-1",
                  activeTab === 'statutory'
                    ? "bg-white text-[#0a66c2] shadow-sm border border-border/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/30"
                )}
                data-agent="employee-tab-statutory-btn"
              >
                <Shield className="h-3 w-3" /> Statutory & Onboarding
              </button>
            </div>
          </div>
          
          <CardContent className="p-6">
            {activeTab === 'personal' ? (
              /* Personal Details Section */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="first_name">First Name</label>
                    <Input id="first_name" value={newEmployee.first_name} onChange={handleInputChange} required className="rounded-sm bg-white" placeholder="First Name" data-agent="employee-first-name-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="last_name">Last Name</label>
                    <Input id="last_name" value={newEmployee.last_name} onChange={handleInputChange} className="rounded-sm bg-white" placeholder="Last Name" data-agent="employee-last-name-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="email">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={newEmployee.email} onChange={handleInputChange} required className="rounded-sm pl-10 bg-white" placeholder="john.doe@company.com" data-agent="employee-email-input" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="phone">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={newEmployee.phone} onChange={handleInputChange} className="rounded-sm pl-10 bg-white" placeholder="+91 XXXXX XXXXX" data-agent="employee-phone-input" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="salary">Salary (Monthly)</label>
                    <Input id="salary" type="number" value={newEmployee.salary} onChange={handleInputChange} className="rounded-sm bg-white" placeholder="0" data-agent="employee-salary-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="employment_type">Employment Type</label>
                    <select
                      id="employment_type"
                      value={newEmployee.employment_type}
                      onChange={handleInputChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-type-select"
                    >
                      <option value="FULL_TIME">Permanent</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={newEmployee.status}
                      onChange={handleInputChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-status-select"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ON_BOARDING">On Boarding</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="designation">Designation</label>
                    <select
                      id="designation"
                      value={newEmployee.designation}
                      onChange={handleInputChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-designation-select"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="department">Department</label>
                    <select
                      id="department"
                      value={newEmployee.department}
                      onChange={handleInputChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-department-select"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="address">Physical Address</label>
                    <textarea
                      id="address"
                      value={newEmployee.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      placeholder="Residential address"
                      data-agent="employee-address-textarea"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Statutory, Bank, and Onboarding Cards Section */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Statutory Details Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Aadhaar */}
                  <Card className="border-border/40 bg-card rounded-sm shadow-sm">
                    <CardHeader className="py-2.5 px-4 border-b border-border/30 bg-muted/10 flex flex-row items-center justify-between">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-[#0a66c2]" /> Aadhaar Details
                      </h5>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="aadhaar_verified"
                          checked={newEmployee.aadhaar_verified}
                          onChange={(e) => handleCheckboxChange('aadhaar_verified', e.target.checked)}
                          className="h-3.5 w-3.5 text-[#0a66c2] border-border rounded cursor-pointer"
                          data-agent="employee-aadhaar-verified-checkbox"
                        />
                        <label htmlFor="aadhaar_verified" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">Verified</label>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="aadhaar_number">Aadhaar Number</label>
                        <Input id="aadhaar_number" value={newEmployee.aadhaar_number} onChange={handleInputChange} placeholder="XXXX XXXX XXXX" maxLength={14} className="rounded-sm bg-white" data-agent="employee-aadhaar-number-input" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="aadhaar_enrollment_no">Enrollment No (Optional)</label>
                        <Input id="aadhaar_enrollment_no" value={newEmployee.aadhaar_enrollment_no} onChange={handleInputChange} placeholder="Enrollment No" className="rounded-sm bg-white" data-agent="employee-aadhaar-enrollment-input" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* PAN */}
                  <Card className="border-border/40 bg-card rounded-sm shadow-sm">
                    <CardHeader className="py-2.5 px-4 border-b border-border/30 bg-muted/10 flex flex-row items-center justify-between">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#0a66c2]" /> PAN Details
                      </h5>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="pan_verified"
                          checked={newEmployee.pan_verified}
                          onChange={(e) => handleCheckboxChange('pan_verified', e.target.checked)}
                          className="h-3.5 w-3.5 text-[#0a66c2] border-border rounded cursor-pointer"
                          data-agent="employee-pan-verified-checkbox"
                        />
                        <label htmlFor="pan_verified" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">Verified</label>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="pan_number">PAN Number</label>
                        <Input id="pan_number" value={newEmployee.pan_number} onChange={handleInputChange} placeholder="ABCDE1234F" maxLength={10} className="rounded-sm bg-white" data-agent="employee-pan-number-input" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bank Details Section */}
                <Card className="border-border/40 bg-card rounded-sm shadow-sm">
                  <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-[#0a66c2]" /> Bank Account Details
                    </h4>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="bank_name">Bank Name</label>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="bank_name" value={newEmployee.bank_name} onChange={handleInputChange} placeholder="Bank Name" className="rounded-sm bg-white pl-10" data-agent="employee-bank-name-input" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="account_number">Account Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="account_number" value={newEmployee.account_number} onChange={handleInputChange} placeholder="Account Number" className="rounded-sm bg-white pl-10" data-agent="employee-bank-account-input" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="ifsc_code">IFSC / Routing Code</label>
                      <Input id="ifsc_code" value={newEmployee.ifsc_code} onChange={handleInputChange} placeholder="IFSC Code" className="rounded-sm bg-white" data-agent="employee-bank-ifsc-input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="account_holder_name">Account Holder Name</label>
                      <Input id="account_holder_name" value={newEmployee.account_holder_name} onChange={handleInputChange} placeholder="Holder Name" className="rounded-sm bg-white" data-agent="employee-bank-holder-input" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="branch_name">Branch Location / Address</label>
                      <Input id="branch_name" value={newEmployee.branch_name} onChange={handleInputChange} placeholder="Branch Location" className="rounded-sm bg-white" data-agent="employee-bank-branch-input" />
                    </div>
                  </CardContent>
                </Card>

                {/* Onboarding Timeline Section */}
                <Card className="border-border/40 bg-card rounded-sm shadow-sm">
                  <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#0a66c2]" /> Onboarding & Timeline
                    </h4>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="joining_date">Date Joined</label>
                      <Input id="joining_date" type="date" value={newEmployee.joining_date} onChange={handleInputChange} className="rounded-sm bg-white" data-agent="employee-joining-date-input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="probation_period">Probation Period</label>
                      <Input id="probation_period" value={newEmployee.probation_period} onChange={handleInputChange} placeholder="e.g. 3 Months" className="rounded-sm bg-white" data-agent="employee-probation-input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="confirmation_date">Confirmation Date</label>
                      <Input id="confirmation_date" type="date" value={newEmployee.confirmation_date} onChange={handleInputChange} className="rounded-sm bg-white" data-agent="employee-confirmation-date-input" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Actions (Always visible at the bottom) */}
            <div className="p-6 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-3 -mx-6 -mb-6 mt-6 rounded-b-sm">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="rounded-sm h-10 px-5 text-xs font-bold border-border bg-white"
                data-agent="employee-cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="bg-[#0a66c2] text-white hover:bg-[#004182] rounded-sm h-10 px-8 text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
                data-agent="employee-submit-button"
              >
                {createEmployeeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Add Employee</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
