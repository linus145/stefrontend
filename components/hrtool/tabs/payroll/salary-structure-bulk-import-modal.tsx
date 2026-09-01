'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Check,
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { hrPayrollService } from '@/services/hr';

interface SalaryStructureBulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencySymbol?: string;
}

interface ParsedStructureRow {
  employee_id: string;
  employee_name: string;
  email: string;
  basic_salary: number;
  hra: number;
  overtime_rate: number;
  tax_percentage: number;
  pf_percentage: number;
  esi_percentage: number;
  status: string;
  isValid: boolean;
  validationError?: string;
}

export function SalaryStructureBulkImportModal({
  open,
  onOpenChange,
  currencySymbol = '₹',
}: SalaryStructureBulkImportModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStructureRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created_count: number;
    updated_count: number;
    total_processed: number;
    skipped_count: number;
    errors: string[];
  } | null>(null);

  const handleDownloadExcelTemplate = () => {
    const sampleData = [
      {
        "Employee ID": "EMP1001",
        "Employee Name": "Aarav Kumar",
        "Work Email": "aarav.kumar@company.com",
        "Basic Monthly Salary": 45000,
        "HRA Allowance": 18000,
        "Overtime Hourly Rate": 250,
        "Tax Percentage": 10,
        "PF Percentage": 12,
        "ESI Percentage": 1.75,
        "Status": "ACTIVE"
      },
      {
        "Employee ID": "EMP1002",
        "Employee Name": "Sneha Sharma",
        "Work Email": "sneha.sharma@company.com",
        "Basic Monthly Salary": 60000,
        "HRA Allowance": 24000,
        "Overtime Hourly Rate": 350,
        "Tax Percentage": 15,
        "PF Percentage": 12,
        "ESI Percentage": 1.75,
        "Status": "ACTIVE"
      },
      {
        "Employee ID": "EMP1003",
        "Employee Name": "Rohan Patel",
        "Work Email": "rohan.patel@company.com",
        "Basic Monthly Salary": 35000,
        "HRA Allowance": 14000,
        "Overtime Hourly Rate": 200,
        "Tax Percentage": 10,
        "PF Percentage": 12,
        "ESI Percentage": 1.75,
        "Status": "ACTIVE"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary_Structures");

    // Auto-fit column widths
    const maxProps = Object.keys(sampleData[0]).map(key => ({
      wch: Math.max(key.length + 4, 16)
    }));
    ws['!cols'] = maxProps;

    XLSX.writeFile(wb, "salary_structures_template.xlsx");
    toast.success("Excel template (.xlsx) downloaded successfully!");
  };

  const handleDownloadCSVTemplate = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Work Email",
      "Basic Monthly Salary",
      "HRA Allowance",
      "Overtime Hourly Rate",
      "Tax Percentage",
      "PF Percentage",
      "ESI Percentage",
      "Status"
    ];

    const sampleRows = [
      ['"EMP1001"', '"Aarav Kumar"', '"aarav.kumar@company.com"', "45000", "18000", "250", "10", "12", "1.75", '"ACTIVE"'],
      ['"EMP1002"', '"Sneha Sharma"', '"sneha.sharma@company.com"', "60000", "24000", "350", "15", "12", "1.75", '"ACTIVE"'],
      ['"EMP1003"', '"Rohan Patel"', '"rohan.patel@company.com"', "35000", "14000", "200", "10", "12", "1.75", '"ACTIVE"']
    ];

    const csvContent = "\uFEFF" + [headers.join(','), ...sampleRows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "salary_structures_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV template (.csv) downloaded successfully!");
  };

  const normalizeKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').trim();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileName(file.name);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawJson.length === 0) {
        toast.error("The selected file is empty.");
        setIsProcessingFile(false);
        return;
      }

      const parsed: ParsedStructureRow[] = rawJson.map((row) => {
        const normalized: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          normalized[normalizeKey(key)] = value;
        }

        const employee_id = String(
          normalized.employee_id ||
          normalized.employee_code ||
          normalized.empid ||
          normalized.id ||
          ''
        ).trim();

        const employee_name = String(
          normalized.employee_name ||
          normalized.name ||
          normalized.full_name ||
          ''
        ).trim();

        const email = String(
          normalized.work_email ||
          normalized.email ||
          normalized.employee_email ||
          ''
        ).trim().toLowerCase();

        const rawBasic = String(normalized.basic_monthly_salary || normalized.basic_salary || normalized.basic || 0).replace(/,/g, '').trim();
        const rawHra = String(normalized.hra_allowance || normalized.hra || 0).replace(/,/g, '').trim();
        const rawOt = String(normalized.overtime_hourly_rate || normalized.overtime_rate || normalized.ot_rate || 0).replace(/,/g, '').trim();
        const rawTax = String(normalized.tax_percentage || normalized.tax || 10).replace(/,/g, '').trim();
        const rawPf = String(normalized.pf_percentage || normalized.pf || 12).replace(/,/g, '').trim();
        const rawEsi = String(normalized.esi_percentage || normalized.esi || 1.75).replace(/,/g, '').trim();
        const status = String(normalized.status || 'ACTIVE').trim().toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

        const basic_salary = isNaN(Number(rawBasic)) ? 0 : Number(rawBasic);
        const hra = isNaN(Number(rawHra)) ? 0 : Number(rawHra);
        const overtime_rate = isNaN(Number(rawOt)) ? 0 : Number(rawOt);
        const tax_percentage = isNaN(Number(rawTax)) ? 10 : Number(rawTax);
        const pf_percentage = isNaN(Number(rawPf)) ? 12 : Number(rawPf);
        const esi_percentage = isNaN(Number(rawEsi)) ? 1.75 : Number(rawEsi);

        let isValid = true;
        let validationError = '';

        if (!employee_id && !email) {
          isValid = false;
          validationError = 'Employee ID or Work Email is required';
        } else if (basic_salary < 0) {
          isValid = false;
          validationError = 'Basic salary cannot be negative';
        }

        return {
          employee_id,
          employee_name,
          email,
          basic_salary,
          hra,
          overtime_rate,
          tax_percentage,
          pf_percentage,
          esi_percentage,
          status,
          isValid,
          validationError,
        };
      });

      setParsedRows(parsed);
      const validCount = parsed.filter(r => r.isValid).length;
      if (validCount === 0) {
        toast.error("No valid salary structure rows found. Please check column headers.");
      } else {
        toast.success(`Parsed ${parsed.length} rows (${validCount} valid).`);
      }
    } catch (err: any) {
      toast.error("Failed to parse spreadsheet: " + err.message);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid salary structure rows to import.");
      return;
    }

    setIsSubmitting(true);
    setImportResult(null);

    try {
      const res = await hrPayrollService.bulkImportSalaryStructures({
        structures: validRows
      });

      const data = res?.data as any;
      setImportResult({
        created_count: data?.created_count || 0,
        updated_count: data?.updated_count || 0,
        total_processed: data?.total_processed || validRows.length,
        skipped_count: data?.skipped_count || 0,
        errors: data?.errors || [],
      });

      queryClient.invalidateQueries({ queryKey: ['payroll-structures'] });
      toast.success(`Successfully configured ${data?.total_processed || validRows.length} salary structures!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to import salary structures.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFileName('');
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[95vw] !max-w-5xl sm:!max-w-5xl md:!max-w-5xl lg:!max-w-5xl max-h-[92vh] flex flex-col p-6 gap-4 bg-background border border-border/80 shadow-2xl rounded-xl">
        <DialogHeader className="border-b border-border/40 pb-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-[#0a66c2]/10 text-[#0a66c2]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Bulk Import Salary Structures
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Upload an Excel / CSV file to batch configure compensation profiles, tax ratios, and statutory deductions.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadExcelTemplate}
                className="text-xs font-semibold gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Template (.xlsx)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadCSVTemplate}
                className="text-xs font-semibold gap-1.5 border-[#0a66c2]/30 text-[#0a66c2] hover:bg-[#0a66c2]/5"
              >
                <Download className="w-3.5 h-3.5" /> Template (.csv)
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Modal Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {/* Success / Summary Alert */}
          {importResult && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Batch Import Completed
              </div>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{importResult.total_processed}</strong> salary structures processed ({importResult.created_count} created, {importResult.updated_count} updated).
                {importResult.skipped_count > 0 && ` (${importResult.skipped_count} skipped due to missing employee matches or errors)`}
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 space-y-1">
                  <p className="font-semibold">Import Notes:</p>
                  <ul className="list-disc list-inside space-y-0.5 max-h-28 overflow-y-auto">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    handleReset();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4"
                >
                  Close & View Structures
                </Button>
              </div>
            </div>
          )}

          {/* Upload Drop Area */}
          {!importResult && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {parsedRows.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-[#0a66c2] hover:bg-[#0a66c2]/5 transition-all rounded-xl p-10 text-center cursor-pointer space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-foreground">
                      Click to browse or drop your Salary Structures spreadsheet (.xlsx, .xls, .csv)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported columns: <strong className="text-foreground">Employee ID / Email, Basic Salary, HRA, Overtime Rate, Tax %, PF %, ESI %</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File Header Info */}
                  <div className="flex items-center justify-between bg-card border border-border/70 p-3 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {parsedRows.length} total rows parsed • <span className="text-emerald-600 font-semibold">{validCount} valid</span>
                          {invalidCount > 0 && <span className="text-red-500 font-semibold"> • {invalidCount} invalid</span>}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-xs text-muted-foreground hover:text-red-600 h-8 gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>

                  {/* Live Preview Table */}
                  <div className="border border-border rounded-lg overflow-x-auto overflow-y-auto max-h-[440px] bg-card/30">
                    <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                      <thead className="bg-muted/70 text-[11px] font-bold text-muted-foreground sticky top-0 border-b border-border z-10 backdrop-blur-sm">
                        <tr>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Employee ID</th>
                          <th className="py-2.5 px-3">Name / Email</th>
                          <th className="py-2.5 px-3">Basic Monthly</th>
                          <th className="py-2.5 px-3">HRA</th>
                          <th className="py-2.5 px-3">Gross</th>
                          <th className="py-2.5 px-3">OT Rate</th>
                          <th className="py-2.5 px-3">Tax %</th>
                          <th className="py-2.5 px-3">PF %</th>
                          <th className="py-2.5 px-3">ESI %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {parsedRows.map((row, i) => {
                          const gross = row.basic_salary + row.hra;
                          return (
                            <tr key={i} className={`hover:bg-muted/30 transition-colors ${!row.isValid ? 'bg-red-500/5' : ''}`}>
                              <td className="py-2 px-3">
                                {row.isValid ? (
                                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 py-0 font-medium">
                                    <Check className="w-2.5 h-2.5" /> Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-600 border-red-500/30 gap-1 py-0 font-medium" title={row.validationError}>
                                    <X className="w-2.5 h-2.5" /> {row.validationError}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-2 px-3 font-semibold text-foreground">
                                {row.employee_id || '-'}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">
                                {row.employee_name ? `${row.employee_name} (${row.email || 'No email'})` : (row.email || '-')}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                                {currencySymbol}{row.basic_salary.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                                {currencySymbol}{row.hra.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 font-bold text-[#0a66c2]">
                                {currencySymbol}{gross.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">
                                {currencySymbol}{row.overtime_rate}/hr
                              </td>
                              <td className="py-2 px-3 text-muted-foreground font-semibold">
                                {row.tax_percentage}%
                              </td>
                              <td className="py-2 px-3 text-muted-foreground font-semibold">
                                {row.pf_percentage}%
                              </td>
                              <td className="py-2 px-3 text-muted-foreground font-semibold">
                                {row.esi_percentage}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <p className="text-xs text-muted-foreground">
                      Ready to configure <strong className="text-foreground">{validCount}</strong> salary structures in database.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="text-xs h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSubmitting || validCount === 0}
                        onClick={handleExecuteImport}
                        className="bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold h-9 px-5 gap-1.5 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Configuring...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Import {validCount} Structures
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
