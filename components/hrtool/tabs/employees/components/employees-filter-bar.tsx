'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RefreshCw, Calendar, Download, Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeesFilterBarProps {
  defaultRole: 'EMPLOYEE' | 'MANAGER';
  setIsAddModalOpen: (open: boolean) => void;
  setIsBulkImportOpen: (open: boolean) => void;
  handleExportData: () => void;
  isExporting: boolean;
  handleResetFilters: () => void;
  handleApplyFilters: () => void;
  searchInput: string;
  setSearchInput: (val: string) => void;
  filterInput: string;
  setFilterInput: (val: string) => void;
  designationInput: string;
  setDesignationInput: (val: string) => void;
  departmentInput: string;
  setDepartmentInput: (val: string) => void;
  orderingInput: string;
  handleSortChange: (order: string) => void;
  startDateInput: string;
  setStartDateInput: (val: string) => void;
  endDateInput: string;
  setEndDateInput: (val: string) => void;
  departments: any[];
  designations: any[];
}

export function EmployeesFilterBar({
  defaultRole,
  setIsAddModalOpen,
  setIsBulkImportOpen,
  handleExportData,
  isExporting,
  handleResetFilters,
  handleApplyFilters,
  searchInput,
  setSearchInput,
  filterInput,
  setFilterInput,
  designationInput,
  setDesignationInput,
  departmentInput,
  setDepartmentInput,
  orderingInput,
  handleSortChange,
  startDateInput,
  setStartDateInput,
  endDateInput,
  setEndDateInput,
  departments,
  designations,
}: EmployeesFilterBarProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {defaultRole === 'MANAGER' ? 'Managers' : 'Employees'}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            {defaultRole === 'MANAGER'
              ? 'Manage leadership team, oversight, and departmental managers'
              : 'Manage team member directory, profiles, and departmental assignments'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              data-agent="add-employee-button"
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm rounded-sm h-10 w-10 p-0 transition-all flex items-center justify-center cursor-pointer"
              aria-label={defaultRole === 'MANAGER' ? 'Add Manager' : 'Add Employee'}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-popover text-popover-foreground border border-border text-[11px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                {defaultRole === 'MANAGER' ? 'Add Manager' : 'Add Employee'}
              </div>
            </div>
          </div>

          {/* Bulk Import / Add CSV/Excel */}
          <div className="relative group">
            <Button
              type="button"
              onClick={() => setIsBulkImportOpen(true)}
              data-agent="bulk-import-employee-button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-sm h-10 w-10 p-0 transition-all flex items-center justify-center cursor-pointer"
              aria-label={defaultRole === 'MANAGER' ? 'Bulk Add Managers' : 'Bulk Add Employees'}
            >
              <UploadCloud className="h-4 w-4" />
            </Button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-popover text-popover-foreground border border-border text-[11px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                {defaultRole === 'MANAGER' ? 'Bulk Add Managers (CSV/Excel)' : 'Bulk Add Employees (CSV/Excel)'}
              </div>
            </div>
          </div>

          {/* Download / Export Data */}
          <div className="relative group">
            <Button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              data-agent="export-employee-data-button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-sm h-10 w-10 p-0 transition-all flex items-center justify-center cursor-pointer"
              aria-label={defaultRole === 'MANAGER' ? 'Download Manager Data' : 'Download Employee Data'}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-popover text-popover-foreground border border-border text-[11px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                {defaultRole === 'MANAGER' ? 'Download Manager Data (CSV)' : 'Download Employee Data (CSV)'}
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleResetFilters}
            variant="outline"
            data-agent="reset-employee-filters-button"
            className="border-border text-muted-foreground hover:bg-red-50/20 hover:text-red-600 hover:border-red-200 shadow-sm rounded-sm text-[11px] font-semibold px-4 h-10 transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Filters
          </Button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyFilters();
        }}
        className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full"
      >
        {/* Search Filter */}
        <div className="relative flex-1 w-full max-w-sm">
          <Input
            placeholder="Search directory..."
            className="pr-10 pl-3.5 h-10 bg-background border border-border text-foreground ring-offset-background focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-sm font-medium placeholder:text-muted-foreground/60 shadow-sm transition-all"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            data-agent="employee-search-input"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a66c2]/60 hover:text-[#0a66c2] transition-colors z-10 cursor-pointer"
            title="Click to search"
            data-agent="employee-search-button"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Dropdowns & Date Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
          {/* Employment Type Selector Dropdown */}
          <div className="relative w-36">
            <select
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              data-agent="employee-type-filter"
              className="h-10 w-full bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">All Types</option>
              <option value="FULL_TIME" className="bg-background text-foreground">Permanent</option>
              <option value="CONTRACT" className="bg-background text-foreground">Contract</option>
              <option value="INTERN" className="bg-background text-foreground">Intern</option>
              <option value="ON_LEAVE" className="bg-background text-foreground">On Leave</option>
              <option value="TERMINATED" className="bg-background text-foreground">Terminated</option>
            </select>
          </div>

          {/* Designation Filter Dropdown */}
          <div className="relative w-40">
            <select
              value={designationInput}
              onChange={(e) => setDesignationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              data-agent="employee-designation-filter"
              className="h-10 w-full bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">All Designations</option>
              {designations.map((d: any) => (
                <option key={d.id} value={d.id} className="bg-background text-foreground">{d.title}</option>
              ))}
            </select>
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative w-40">
            <select
              value={departmentInput}
              onChange={(e) => setDepartmentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilters();
              }}
              data-agent="employee-department-filter"
              className="h-10 w-full bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-[11px] font-bold px-3 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-background text-foreground">All Departments</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id} className="bg-background text-foreground">{d.name}</option>
              ))}
            </select>
          </div>

          {/* Sort / Ordering */}
          <DropdownMenu>
            <DropdownMenuTrigger data-agent="employee-sort-trigger" className="h-10 px-4 flex items-center justify-center gap-2 rounded-sm text-[11px] font-bold border border-border bg-background hover:bg-muted text-foreground transition-all outline-none whitespace-nowrap shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-[#0a66c2]" />
              {orderingInput === '-created_at' ? 'Newest' : 'Oldest'}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border-border/50 bg-card/95 backdrop-blur-md shadow-xl min-w-[160px]">
              <DropdownMenuItem
                onClick={() => handleSortChange('-created_at')}
                data-agent="employee-sort-newest-btn"
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", orderingInput === '-created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange('created_at')}
                data-agent="employee-sort-oldest-btn"
                className={cn("text-xs font-semibold py-2.5 cursor-pointer focus:bg-[#0a66c2]/10", orderingInput === 'created_at' ? "text-[#0a66c2] bg-[#0a66c2]/5" : "")}
              >
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date range filters */}
          <div className="flex items-center gap-2">
            <div className="relative w-32">
              <span className="absolute -top-2.5 left-2 bg-background px-1 text-[9px] font-bold text-muted-foreground z-10">Start Date</span>
              <Input
                type="date"
                className="h-10 bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-xs font-medium shadow-sm transition-all relative"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                data-agent="employee-start-date-input"
              />
            </div>
            <span className="text-muted-foreground/50 font-medium">-</span>
            <div className="relative w-32">
              <span className="absolute -top-2.5 left-2 bg-background px-1 text-[9px] font-bold text-muted-foreground z-10">End Date</span>
              <Input
                type="date"
                className="h-10 bg-background border border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#0a66c2]/50 focus-visible:border-[#0a66c2]/50 rounded-sm text-xs font-medium shadow-sm transition-all relative"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
                data-agent="employee-end-date-input"
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
