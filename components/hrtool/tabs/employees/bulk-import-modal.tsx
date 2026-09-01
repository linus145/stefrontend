'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { hrEmployeeService } from '@/services/hr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  Users,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: 'EMPLOYEE' | 'MANAGER';
}

interface ParsedEmployeeRow {
  employee_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  designation?: string;
  department?: string;
  employment_type?: string;
  salary?: number;
  address?: string;
  manager_email?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  pan_number?: string;
  aadhaar_number?: string;
  joining_date?: string;
  isValid: boolean;
  validationError?: string;
}

export function BulkImportModal({ open, onOpenChange, defaultRole = 'EMPLOYEE' }: BulkImportModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created_count: number;
    skipped_count: number;
    errors: string[];
  } | null>(null);

  const handleDownloadExcelTemplate = () => {
    const sampleData = [
      {
        "First Name": "Alex",
        "Last Name": "Morgan",
        "Email": "alex.morgan@company.com",
        "Phone": "+91 9876543210",
        "Role": defaultRole,
        "Designation": "Senior Software Engineer",
        "Department": "Engineering",
        "Employment Type": "FULL_TIME",
        "Salary": 85000,
        "Joining Date": "2026-01-15",
        "Bank Name": "HDFC Bank",
        "Account Number": "50100234567890",
        "IFSC Code": "HDFC0001234",
        "PAN Number": "ABCDE1234F",
        "Aadhaar Number": "123456789012"
      },
      {
        "First Name": "Priya",
        "Last Name": "Sharma",
        "Email": "priya.sharma@company.com",
        "Phone": "+91 9876543211",
        "Role": defaultRole,
        "Designation": "Product Designer",
        "Department": "Design",
        "Employment Type": "FULL_TIME",
        "Salary": 75000,
        "Joining Date": "2026-02-01",
        "Bank Name": "ICICI Bank",
        "Account Number": "000105009876",
        "IFSC Code": "ICIC0000001",
        "PAN Number": "XYZAB5678C",
        "Aadhaar Number": "987654321098"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, `sample_${defaultRole.toLowerCase()}_import_template.xlsx`);
    toast.success("Sample Excel (.xlsx) template downloaded!");
  };

  const handleDownloadCSVTemplate = () => {
    const sampleHeaders = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "role",
      "designation",
      "department",
      "employment_type",
      "salary",
      "joining_date",
      "bank_name",
      "account_number",
      "ifsc_code",
      "pan_number",
      "aadhaar_number"
    ];

    const sampleRow1 = [
      "Alex",
      "Morgan",
      "alex.morgan@company.com",
      "+91 9876543210",
      defaultRole,
      "Senior Software Engineer",
      "Engineering",
      "FULL_TIME",
      "85000",
      "2026-01-15",
      "HDFC Bank",
      "50100234567890",
      "HDFC0001234",
      "ABCDE1234F",
      "123456789012"
    ];

    const sampleRow2 = [
      "Priya",
      "Sharma",
      "priya.sharma@company.com",
      "+91 9876543211",
      defaultRole,
      "Product Designer",
      "Design",
      "FULL_TIME",
      "75000",
      "2026-02-01",
      "ICICI Bank",
      "000105009876",
      "ICIC0000001",
      "XYZAB5678C",
      "987654321098"
    ];

    const csvContent = [
      sampleHeaders.join(","),
      sampleRow1.join(","),
      sampleRow2.join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sample_${defaultRole.toLowerCase()}_import_template.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Sample CSV (.csv) template downloaded!");
  };

  const processRawRows = (rawJson: any[]): ParsedEmployeeRow[] => {
    const rows: ParsedEmployeeRow[] = [];

    for (const row of rawJson) {
      const rowObj: any = {};

      Object.keys(row).forEach((key) => {
        const normalizedKey = key.trim().toLowerCase().replace(/[\s_\-()]+/g, '');
        const val = row[key];

        if (normalizedKey.includes('manager') || normalizedKey.includes('reporting')) {
          rowObj.manager_email = String(val).trim();
        } else if (
          normalizedKey === 'workemail' ||
          normalizedKey === 'employeeemail' ||
          normalizedKey === 'empemail' ||
          normalizedKey === 'primaryemail' ||
          normalizedKey === 'email' ||
          normalizedKey === 'mail' ||
          (normalizedKey.includes('email') && !normalizedKey.includes('manager') && !normalizedKey.includes('reporting'))
        ) {
          rowObj.email = String(val).trim();
        } else if (normalizedKey.includes('empid') || normalizedKey === 'employeeid') {
          rowObj.employee_id = String(val).trim();
        } else if (normalizedKey.includes('firstname') || normalizedKey === 'first' || normalizedKey === 'fname') {
          rowObj.first_name = val;
        } else if (normalizedKey.includes('lastname') || normalizedKey === 'last' || normalizedKey === 'lname' || normalizedKey === 'surname') {
          rowObj.last_name = val;
        } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile') || normalizedKey.includes('contact')) {
          rowObj.phone = String(val);
        } else if (normalizedKey === 'role') {
          rowObj.role = String(val).toUpperCase();
        } else if (normalizedKey.includes('desig') || normalizedKey.includes('jobtitle') || normalizedKey.includes('title') || normalizedKey.includes('position')) {
          rowObj.designation = val;
        } else if (normalizedKey.includes('dept') || normalizedKey.includes('department')) {
          rowObj.department = val;
        } else if (normalizedKey.includes('type') || normalizedKey.includes('employment')) {
          rowObj.employment_type = String(val).toUpperCase();
        } else if (normalizedKey.includes('salary') || normalizedKey.includes('compensation') || normalizedKey.includes('ctc') || normalizedKey.includes('base')) {
          rowObj.salary = parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
        } else if (normalizedKey.includes('hire') || normalizedKey.includes('join') || normalizedKey.includes('doj')) {
          rowObj.joining_date = val;
        } else if (normalizedKey.includes('location') || normalizedKey.includes('address') || normalizedKey.includes('city')) {
          rowObj.address = val;
        } else if (normalizedKey.includes('bank') && !normalizedKey.includes('acc')) {
          rowObj.bank_name = val;
        } else if (normalizedKey.includes('acc') || normalizedKey.includes('account')) {
          rowObj.account_number = String(val).replace(/[\t\s]/g, '');
        } else if (normalizedKey.includes('ifsc')) {
          rowObj.ifsc_code = String(val).trim();
        } else if (normalizedKey.includes('pan')) {
          rowObj.pan_number = String(val).trim();
        } else if (normalizedKey.includes('aadhaar') || normalizedKey.includes('aadhar')) {
          rowObj.aadhaar_number = String(val).replace(/[\t\s]/g, '');
        }
      });

      const firstName = String(rowObj.first_name || '').trim();
      const lastName = String(rowObj.last_name || '').trim();
      const email = String(rowObj.email || '').trim().toLowerCase();

      // Skip completely blank rows
      if (!firstName && !email && !lastName) continue;

      let isValid = true;
      let validationError = '';

      if (!firstName) {
        isValid = false;
        validationError = 'Missing First Name';
      } else if (!email || !email.includes('@')) {
        isValid = false;
        validationError = 'Invalid or Missing Email';
      }

      rows.push({
        employee_id: rowObj.employee_id || '',
        first_name: firstName,
        last_name: lastName,
        email,
        phone: rowObj.phone || '',
        role: rowObj.role || defaultRole,
        designation: rowObj.designation || 'Team Member',
        department: rowObj.department || 'Operations',
        employment_type: rowObj.employment_type || 'FULL_TIME',
        salary: rowObj.salary || 0,
        address: rowObj.address || '',
        manager_email: rowObj.manager_email || '',
        bank_name: rowObj.bank_name || '',
        account_number: rowObj.account_number || '',
        ifsc_code: rowObj.ifsc_code || '',
        pan_number: rowObj.pan_number || '',
        aadhaar_number: rowObj.aadhaar_number || '',
        joining_date: rowObj.joining_date || '',
        isValid,
        validationError,
      });
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessingFile(true);
    setImportResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const parsed = processRawRows(rawJson);
      setParsedRows(parsed);

      if (parsed.length === 0) {
        toast.error("No valid employee rows found in file.");
      } else {
        toast.success(`Parsed ${parsed.length} rows from ${file.name}`);
      }
    } catch (err: any) {
      toast.error("Failed to parse spreadsheet: " + err.message);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const [importProgress, setImportProgress] = useState<{
    percent: number;
    current: number;
    total: number;
  } | null>(null);

  const pollTaskStatus = async (taskId: string, totalCount: number) => {
    const interval = setInterval(async () => {
      try {
        const res = await hrEmployeeService.getImportTaskStatus(taskId);
        const data = res?.data as any;

        if (data?.status === 'PROGRESS') {
          setImportProgress({
            percent: data.percent || Math.round(((data.current || 0) / totalCount) * 100),
            current: data.current || 0,
            total: data.total || totalCount,
          });
        } else if (data?.status === 'SUCCESS') {
          clearInterval(interval);
          setImportProgress(null);
          setIsSubmitting(false);
          setImportResult({
            created_count: data.created_count ?? totalCount,
            skipped_count: data.skipped_count ?? 0,
            errors: data.errors || [],
          });

          queryClient.invalidateQueries({ queryKey: ['employees'] });
          queryClient.invalidateQueries({ queryKey: ['active-managers-list'] });
          queryClient.invalidateQueries({ queryKey: ['departments'] });
          queryClient.invalidateQueries({ queryKey: ['designations'] });

          toast.success(`Successfully imported ${data.created_count ?? totalCount} ${defaultRole === 'MANAGER' ? 'managers' : 'employees'}!`);
        } else if (data?.status === 'FAILURE') {
          clearInterval(interval);
          setImportProgress(null);
          setIsSubmitting(false);
          toast.error("Background import task encountered an error: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        // Continue polling
      }
    }, 1200);
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid employee rows to import.");
      return;
    }

    setIsSubmitting(true);
    setImportResult(null);
    setImportProgress({ percent: 10, current: 0, total: validRows.length });

    try {
      const res = await hrEmployeeService.bulkImportEmployees({
        employees: validRows
      });

      const data = res?.data as any;
      if (data?.status === 'QUEUED' && data?.task_id) {
        toast.info("Import job queued in background. Processing records...");
        pollTaskStatus(data.task_id, validRows.length);
      } else {
        setImportProgress(null);
        setIsSubmitting(false);
        setImportResult({
          created_count: data?.created_count || validRows.length,
          skipped_count: data?.skipped_count || 0,
          errors: data?.errors || [],
        });

        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['active-managers-list'] });
        queryClient.invalidateQueries({ queryKey: ['departments'] });
        queryClient.invalidateQueries({ queryKey: ['designations'] });

        toast.success(`Successfully imported ${data?.created_count || validRows.length} ${defaultRole === 'MANAGER' ? 'managers' : 'employees'}!`);
      }
    } catch (err: any) {
      setImportProgress(null);
      setIsSubmitting(false);
      toast.error(err?.message || "Failed to import employee batch.");
    }
  };

  const handleReset = () => {
    setFileName('');
    setParsedRows([]);
    setImportResult(null);
    setImportProgress(null);
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
                <Users className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Bulk Import {defaultRole === 'MANAGER' ? 'Managers' : 'Employees'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Upload an Excel / CSV spreadsheet to seamlessly import and auto-provision all team member records.
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
          {/* Live Progress Bar during background import */}
          {importProgress && (
            <div className="p-5 rounded-xl bg-card border border-[#0a66c2]/30 shadow-md space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-[#0a66c2] animate-spin" />
                  <span className="text-xs font-bold text-foreground">
                    Processing Batch in Background ({importProgress.current} of {importProgress.total} records)
                  </span>
                </div>
                <span className="text-xs font-bold text-[#0a66c2]">
                  {importProgress.percent}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0a66c2] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, importProgress.percent)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Hashing authentication credentials and building employee directory profiles via Celery worker...
              </p>
            </div>
          )}

          {/* Success / Summary Alert */}
          {importResult && !importProgress && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Batch Import Completed
              </div>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{importResult.created_count}</strong> {defaultRole === 'MANAGER' ? 'managers' : 'employees'} created successfully.
                {importResult.skipped_count > 0 && ` (${importResult.skipped_count} skipped due to duplicates or formatting issues)`}
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
                  Close & View Directory
                </Button>
              </div>
            </div>
          )}

          {/* Upload Drop Area */}
          {!importResult && !importProgress && (
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
                      Click to browse or drop your Excel (.xlsx, .xls) or CSV spreadsheet here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: <strong className="text-foreground">.XLSX, .XLS, .CSV</strong> (Exported from Excel, Google Sheets, or legacy HRMS)
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
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Designation</th>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Salary</th>
                          <th className="py-2.5 px-3">Bank Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {parsedRows.map((row, i) => (
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
                              {row.first_name} {row.last_name}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">{row.email}</td>
                            <td className="py-2 px-3 text-muted-foreground">{row.phone || '-'}</td>
                            <td className="py-2 px-3">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                                {row.role}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">{row.designation}</td>
                            <td className="py-2 px-3 text-muted-foreground">{row.department}</td>
                            <td className="py-2 px-3 font-medium text-emerald-600">
                              {row.salary ? `₹${row.salary.toLocaleString('en-IN')}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-muted-foreground text-[10px]">
                              {row.bank_name ? `${row.bank_name} (${row.account_number ? '...' + row.account_number.slice(-4) : 'Acct'})` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <p className="text-xs text-muted-foreground">
                      Ready to import <strong className="text-foreground">{validCount}</strong> valid {defaultRole === 'MANAGER' ? 'manager' : 'employee'} records into database.
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
                            Importing Batch...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Import {validCount} {defaultRole === 'MANAGER' ? 'Managers' : 'Employees'}
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
