'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeesTableRow } from './employees-table-row';
import { UseMutationResult } from '@tanstack/react-query';

interface EmployeesTableProps {
  isLoading: boolean;
  employees: any;
  page: number;
  updateEmployeeMutation: UseMutationResult<any, any, any, any>;
  sendCredentialsMutation: UseMutationResult<any, any, any, any>;
  handleOpenSalaryModal: (emp: any) => void;
  setSelectedEmployeeId: (id: string) => void;
  setDeleteTarget: (target: { id: string; name: string } | null) => void;
}

export function EmployeesTable({
  isLoading,
  employees,
  page,
  updateEmployeeMutation,
  sendCredentialsMutation,
  handleOpenSalaryModal,
  setSelectedEmployeeId,
  setDeleteTarget,
}: EmployeesTableProps) {
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto rounded-sm border border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] uppercase bg-muted/50 text-muted-foreground font-bold border-b border-border/40">
            <tr>
              <th className="px-3 py-3 w-12 text-center">#</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3 w-[140px]">Type</th>
              <th className="px-4 py-3">Salary Structure</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-border/40 animate-pulse">
                <td className="px-3 py-3 text-center">
                  <Skeleton className="h-3 w-4 mx-auto" />
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-sm" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </td>
                <td className="px-4 py-3 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-16" />
                </td>
                <td className="px-4 py-3 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-8 w-full rounded-sm" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-7 w-24 rounded-sm" />
                </td>
                <td className="px-4 py-3 flex justify-end">
                  <Skeleton className="h-7 w-7 rounded-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-sm border border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="text-[11px] uppercase bg-muted/50 text-muted-foreground font-bold border-b border-border/40">
          <tr>
            <th className="px-3 py-3 w-12 text-center">#</th>
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Manager</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3 w-[125px]">Type</th>
            <th className="px-4 py-3">Salary Structure</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees?.data?.results?.map((employee: any, index: number) => {
            const serialNumber = (page - 1) * 10 + index + 1;
            return (
              <EmployeesTableRow
                key={employee.id}
                employee={employee}
                serialNumber={serialNumber}
                updateEmployeeMutation={updateEmployeeMutation}
                sendCredentialsMutation={sendCredentialsMutation}
                handleOpenSalaryModal={handleOpenSalaryModal}
                setSelectedEmployeeId={setSelectedEmployeeId}
                setDeleteTarget={setDeleteTarget}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
