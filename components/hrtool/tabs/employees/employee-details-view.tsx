'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOrgService, hrEmployeeService } from '@/services/hr';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  User, Shield, FileText, Calendar, Building, Globe, MapPin,
  Phone, Mail, CheckCircle2, AlertCircle, Briefcase, Loader2, Save, ArrowLeft,
  Landmark, CreditCard, Eye, EyeOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EmployeeDetailsViewProps {
  employeeId: string;
  onBack: () => void;
}

export function EmployeeDetailsView({ employeeId, onBack }: EmployeeDetailsViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'personal' | 'statutory'>('personal');
  const [showPassword, setShowPassword] = useState(false);

  // Fetch full details from backend
  const { data: detailRes, isLoading: detailsLoading } = useQuery({
    queryKey: ['employee-detail', employeeId],
    queryFn: () => hrEmployeeService.getEmployeeDetail(employeeId),
    enabled: !!employeeId,
  });

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
  const employee = detailRes?.data;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    salary: '',
    employment_type: 'FULL_TIME',
    address: '',
    status: 'ACTIVE',
    designation: '',
    employee_id: '',
    department: '',

    // Aadhaar
    aadhaar_number: '',
    aadhaar_enrollment_no: '',
    aadhaar_verified: false,

    // PAN
    pan_number: '',
    pan_verified: false,

    // Joining details
    joining_date: '',
    probation_period: '3 Months',
    confirmation_date: '',

    // Bank Details
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    branch_name: '',
    password: '',
    portal_username: '',
  });

  // Sync state with details when loaded
  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        salary: employee.salary ? parseFloat(employee.salary).toString() : '0',
        employment_type: employee.employment_type || 'FULL_TIME',
        address: employee.address || '',
        status: employee.status || 'ACTIVE',
        designation: employee.designation || '',
        employee_id: employee.employee_id || '',
        department: employee.department || '',

        // Aadhaar
        aadhaar_number: employee.aadhaar_detail?.aadhaar_number || '',
        aadhaar_enrollment_no: employee.aadhaar_detail?.enrollment_no || '',
        aadhaar_verified: employee.aadhaar_detail?.verified || false,

        // PAN
        pan_number: employee.pan_detail?.pan_number || '',
        pan_verified: employee.pan_detail?.verified || false,

        // Joining details
        joining_date: employee.joining_detail?.joining_date || employee.joining_date || '',
        probation_period: employee.joining_detail?.probation_period || '3 Months',
        confirmation_date: employee.joining_detail?.confirmation_date || '',

        // Bank Details
        bank_name: employee.bank_detail?.bank_name || '',
        account_number: employee.bank_detail?.account_number || '',
        ifsc_code: employee.bank_detail?.ifsc_code || '',
        account_holder_name: employee.bank_detail?.account_holder_name || '',
        branch_name: employee.bank_detail?.branch_name || '',
        password: '',
        portal_username: employee.portal_username || '',
      });
    }
  }, [employee]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => hrEmployeeService.updateEmployee(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-detail', employeeId] });
      toast.success('Employee profile and bank details updated successfully.');
      onBack();
    },
    onError: () => toast.error('Failed to update employee details.'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      salary: formData.salary ? parseFloat(formData.salary) : 0,
      employment_type: formData.employment_type,
      address: formData.address,
      status: formData.status,
      designation: formData.designation || null,
      department: formData.department || null,
      employee_id: formData.employee_id,
      password: formData.password || undefined,
      portal_username: formData.portal_username || undefined,
      aadhaar_detail: {
        aadhaar_number: formData.aadhaar_number,
        enrollment_no: formData.aadhaar_enrollment_no,
        verified: formData.aadhaar_verified,
      },
      pan_detail: {
        pan_number: formData.pan_number,
        verified: formData.pan_verified,
      },
      joining_detail: {
        joining_date: formData.joining_date || null,
        probation_period: formData.probation_period,
        confirmation_date: formData.confirmation_date || null,
      },
      bank_detail: {
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        account_holder_name: formData.account_holder_name,
        branch_name: formData.branch_name,
      }
    };
    updateMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="h-10 px-4 border-border hover:bg-blue-50/30 text-muted-foreground font-bold text-xs rounded-sm gap-2 shadow-sm transition-all"
          data-agent="employee-back-btn"
        >
          <ArrowLeft className="h-4 w-4 text-[#0a66c2]" /> Back
        </Button>
      </div>

      {detailsLoading ? (
        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-sm h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-[#0a66c2] animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Fetching full employee profile...</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-sm shadow-xl overflow-hidden">
            {/* Header section in card */}
            <div className="bg-muted/30 p-6 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <Avatar className="h-16 w-16 border border-border/60 shadow-md rounded-sm">
                  <AvatarImage src={employee?.avatar} className="rounded-sm" />
                  <AvatarFallback className="bg-blue-500/10 text-[#0a66c2] font-bold text-lg rounded-sm">
                    {formData.first_name[0] || 'N'}{formData.last_name[0] || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {formData.first_name} {formData.last_name}
                    </h3>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {formData.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-[#0a66c2]/80 mt-0.5">
                    {employee?.designation_detail?.title || 'Team Member'} • {employee?.department_detail?.name || 'Operations'}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    ID: {employee?.employee_id || 'TEMP'}
                  </p>
                </div>
              </div>

              {/* Tab Selector */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Employee ID */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Employee ID</label>
                    <Input id="employee_id" value={formData.employee_id} onChange={handleChange} required className="rounded-sm bg-white" placeholder="e.g. EMP-101" data-agent="employee-id-input" />
                  </div>

                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Name</label>
                    <Input id="first_name" value={formData.first_name} onChange={handleChange} required className="rounded-sm bg-white" data-agent="employee-first-name-input" />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <Input id="last_name" value={formData.last_name} onChange={handleChange} required className="rounded-sm bg-white" data-agent="employee-last-name-input" />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="rounded-sm pl-10 bg-white" data-agent="employee-email-input" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={formData.phone} onChange={handleChange} className="rounded-sm pl-10 bg-white" data-agent="employee-phone-input" />
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Salary (Monthly)</label>
                    <Input id="salary" type="number" value={formData.salary} onChange={handleChange} className="rounded-sm bg-white" data-agent="employee-salary-input" />
                  </div>

                  {/* Employment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Employment Type</label>
                    <select
                      id="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-type-select"
                    >
                      <option value="FULL_TIME">Permanent</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-status-select"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ON_BOARDING">On Boarding</option>
                      <option value="EXITED">Exited</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Designation</label>
                    <select
                      id="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-designation-select"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Department</label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      data-agent="employee-department-select"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Physical Address</label>
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      data-agent="employee-address-textarea"
                    />
                  </div>

                  {/* Portal Access Credentials */}
                  <Card className="border-border/40 bg-card/10 rounded-sm shadow-sm sm:col-span-2 mt-4 animate-in fade-in duration-300">
                    <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <User className="h-4 w-4 text-[#0a66c2]" /> Portal Access Credentials
                      </h4>
                    </CardHeader>
                    <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portal Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="portal_username"
                            value={formData.portal_username} 
                            onChange={handleChange} 
                            className="rounded-sm pl-10 bg-white font-semibold text-xs text-foreground" 
                            placeholder="e.g. emp_john123"
                            data-agent="employee-portal-username-input"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Set / Reset Password</label>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={handleChange} 
                            className="rounded-sm pr-10 bg-white" 
                            placeholder="Enter new password to update" 
                            data-agent="employee-password-reset-input" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
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
              )}
            </CardContent>

            {/* Footer inside card */}
            <div className="p-6 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="rounded-sm h-10 px-5 text-xs font-bold border-border"
                data-agent="employee-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[#0a66c2] text-white hover:bg-[#004182] rounded-sm h-10 px-8 text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                data-agent="employee-submit-button"
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
