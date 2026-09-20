'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Trash2, CheckCircle2, Plus } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';

interface EmployeesTableRowProps {
  employee: any;
  serialNumber: number;
  updateEmployeeMutation: UseMutationResult<any, any, any, any>;
  sendCredentialsMutation: UseMutationResult<any, any, any, any>;
  handleOpenSalaryModal: (emp: any) => void;
  setSelectedEmployeeId: (id: string) => void;
  setDeleteTarget: (target: { id: string; name: string } | null) => void;
}

export function EmployeesTableRow({
  employee,
  serialNumber,
  updateEmployeeMutation,
  sendCredentialsMutation,
  handleOpenSalaryModal,
  setSelectedEmployeeId,
  setDeleteTarget,
}: EmployeesTableRowProps) {
  return (
    <tr
      data-agent="employee-row"
      className="border-b border-border/40 hover:bg-muted/20 transition-colors group"
    >
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-bold text-muted-foreground/80 group-hover:text-[#0a66c2] transition-colors">
          {serialNumber}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/50 shadow-sm rounded-sm">
            <AvatarImage src={employee.avatar} className="rounded-sm" />
            <AvatarFallback className="bg-blue-500/5 text-[#0a66c2] font-semibold rounded-sm text-[10px]">
              {employee.first_name[0]}{employee.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span
              data-agent="employee-name"
              className="font-bold text-[13px] text-foreground group-hover:text-[#0a66c2] transition-colors"
            >
              {employee.first_name} {employee.last_name}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ID: {employee.employee_id}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          {employee.role === 'MANAGER' ? (
            <>
              <span className="text-[12px] font-semibold text-foreground">Manager</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {employee.department_detail?.name || 'No Department'}
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[12px] font-semibold text-foreground">
                  {employee.designation_detail?.title || 'Team Member'}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {employee.department_detail?.name || 'No Department'}
              </span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {employee.reporting_manager_detail ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-border/50 shadow-sm rounded-sm">
              <AvatarFallback className="bg-[#0a66c2]/10 text-[#0a66c2] font-bold rounded-sm text-[8px]">
                {employee.reporting_manager_detail.first_name[0]}{employee.reporting_manager_detail.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-foreground">
                {employee.reporting_manager_detail.first_name} {employee.reporting_manager_detail.last_name}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground font-semibold italic">Not Assigned</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-[#0a66c2]/60" /> {employee.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-[#0a66c2]/60" /> {employee.phone || 'No contact'}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={employee.employment_type || 'FULL_TIME'}
          disabled={updateEmployeeMutation.isPending}
          onChange={(e) => updateEmployeeMutation.mutate({ id: employee.id, employment_type: e.target.value })}
          className="h-7 w-[105px] bg-[#0a66c2]/5 hover:bg-[#0a66c2]/10 border border-[#0a66c2]/20 focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[10px] font-bold text-[#0a66c2] px-2 shadow-sm transition-all focus:outline-none cursor-pointer"
        >
          <option value="FULL_TIME">Permanent</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERN">Intern</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </td>

      {/* Salary Structure Configuration Column */}
      <td className="px-4 py-3">
        {employee.salary_structure_detail ? (
          <button
            type="button"
            onClick={() => handleOpenSalaryModal(employee)}
            title="Click to view or edit compensation profile"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-bold transition-all cursor-pointer group/badge"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>₹{Number(employee.salary_structure_detail.gross_salary || employee.salary || 0).toLocaleString('en-IN')}/mo</span>
          </button>
        ) : (
          <Button
            size="sm"
            onClick={() => handleOpenSalaryModal(employee)}
            className="h-7 text-[11px] font-bold bg-[#0a66c2] hover:bg-[#084e96] text-white !rounded-[6px] px-2.5 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Configure
          </Button>
        )}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedEmployeeId(employee.id)}
            data-agent="employee-details-btn"
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-[#0a66c2]/5 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all active:scale-95 border border-[#0a66c2]/10"
            title="View Details"
          >
            <User className="h-3 w-3" />
          </button>

          <button
            onClick={() => sendCredentialsMutation.mutate(employee.id)}
            disabled={sendCredentialsMutation.isPending}
            data-agent="employee-send-link-btn"
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-[#0a66c2]/5 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all active:scale-95 border border-[#0a66c2]/10 disabled:opacity-50"
            title="Send Email Link"
          >
            <Mail className="h-3 w-3" />
          </button>

          <button
            onClick={() => setDeleteTarget({ id: employee.id, name: `${employee.first_name} ${employee.last_name}` })}
            data-agent="employee-delete-btn"
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-red-500/5 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-500/10"
            title="Delete Employee"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}
