'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Phone, User, KeyRound, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeePersonalTabProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  designations: any[];
  departments: any[];
  managers: any[];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export function EmployeePersonalTab({
  formData,
  handleChange,
  designations,
  departments,
  managers,
  showPassword,
  setShowPassword,
}: EmployeePersonalTabProps) {
  return (
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

      {/* Portal Role */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portal Role</label>
        {formData.role === 'MANAGER' ? (
          <Input
            value="Manager"
            disabled
            className="rounded-sm bg-muted text-muted-foreground font-semibold text-sm cursor-not-allowed h-10"
          />
        ) : (
          <select
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            data-agent="employee-role-select"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
          </select>
        )}
      </div>

      {/* Designation */}
      {formData.role !== 'MANAGER' && (
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
      )}

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

      {/* Reporting Manager */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reporting Manager</label>
        <select
          id="reporting_manager"
          value={formData.reporting_manager || ''}
          disabled={formData.role === 'MANAGER'}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-sm border border-input px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
            formData.role === 'MANAGER'
              ? "bg-muted text-muted-foreground cursor-not-allowed font-medium select-none"
              : "bg-white"
          )}
          data-agent="employee-reporting-manager-select"
        >
          <option value="">{formData.role === 'MANAGER' ? 'Not Applicable (Self Manager)' : 'Select Manager'}</option>
          {managers.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.first_name} {m.last_name} ({m.employee_id || 'MGR'})
            </option>
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
            <KeyRound className="h-4 w-4 text-[#0a66c2]" /> Portal Access Credentials
          </h4>
          <p className="text-[10px] text-muted-foreground mt-1">
            Set the employee&apos;s login password and send it via email. The password will be included in the credentials email.
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Enter new password" 
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
