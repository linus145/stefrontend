import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Eye, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MONTHS } from '../templates.helpers';
import { DESIGN_THEMES, renderThemedDocument } from '../templates.designs';

interface SendTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sendingTemplate: any;
  employees: any[];
  selectedEmployeeId: string;
  onEmployeeSelect: (empId: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  isFetchingPayroll: boolean;
  customSubject: string;
  setCustomSubject: (subject: string) => void;
  parsedVariables: string[];
  templateVariables: Record<string, string>;
  onVariableChange: (name: string, value: string) => void;
  onSend: () => void;
  isPending: boolean;
  selectedDesign: string;
  onDesignChange: (designId: string) => void;
}

export function SendTemplateDialog({
  isOpen,
  onClose,
  sendingTemplate,
  employees,
  selectedEmployeeId,
  onEmployeeSelect,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  isFetchingPayroll,
  customSubject,
  setCustomSubject,
  parsedVariables,
  templateVariables,
  onVariableChange,
  onSend,
  isPending,
  selectedDesign,
  onDesignChange
}: SendTemplateDialogProps) {
  const [isRendered, setIsRendered] = useState(false);

  // Show skeleton briefly when dialog opens or design/employee changes
  useEffect(() => {
    if (isOpen && sendingTemplate) {
      setIsRendered(false);
      const t = requestAnimationFrame(() => setIsRendered(true));
      return () => cancelAnimationFrame(t);
    }
  }, [isOpen, sendingTemplate?.id, selectedDesign, selectedEmployeeId]);

  const themedDocument = React.useMemo(() => {
    if (!sendingTemplate) return null;
    return renderThemedDocument(selectedDesign, sendingTemplate.content, templateVariables);
  }, [selectedDesign, sendingTemplate, templateVariables]);

  if (!isOpen || !sendingTemplate) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121320] border border-slate-100 dark:border-slate-800 rounded-sm w-full max-w-5xl shadow-2xl p-6 relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left side: Form Inputs */}
        <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto custom-scrollbar pr-2 max-h-[80vh] transform-gpu">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#0a66c2]" /> Send Document to Employee
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a design, pick an employee, and fill the variables. Preview updates live on the right.
            </p>

            <div className="space-y-4">

              {/* ─── Design Theme Selector ──────────────────────────── */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="h-3 w-3" /> Select Template Design
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onDesignChange(theme.id)}
                      className={`relative text-left p-2.5 rounded-sm border-2 transition-all duration-200 cursor-pointer group ${
                        selectedDesign === theme.id
                          ? `${theme.previewBorder} bg-slate-50 dark:bg-slate-800/30 shadow-sm`
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#151624]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-3 w-8 rounded-sm ${theme.accentColor}`} />
                        {selectedDesign === theme.id && (
                          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center ml-auto">
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block leading-tight">{theme.name}</span>
                      <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">{theme.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Employee */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Target Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => onEmployeeSelect(e.target.value)}
                  className="w-full h-10 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id}) - {emp.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Month & Year (for Payroll Data fetching) */}
              {sendingTemplate.category === 'PAYROLL' && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      Payroll Month {isFetchingPayroll && <span className="h-2 w-2 rounded-full bg-[#0a66c2] animate-ping" />}
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => onMonthChange(e.target.value)}
                      className="w-full h-10 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Month --</option>
                      {MONTHS.map((m, idx) => (
                        <option key={idx} value={String(idx + 1)}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payroll Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => onYearChange(e.target.value)}
                      className="w-full h-10 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Email Subject Line */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Subject</label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Email Subject Line"
                  className="w-full text-xs h-10"
                />
              </div>

              {/* Dynamic Fields for parsed variables */}
              {parsedVariables.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-355 mb-3 uppercase tracking-wider">Document Variables</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parsedVariables.map((variable) => (
                      <div key={variable} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 capitalize tracking-wide">
                          {variable.replace(/_/g, ' ')}
                        </label>
                        {variable.includes('date') ? (
                          <Input
                            type="date"
                            value={templateVariables[variable] || ''}
                            onChange={(e) => onVariableChange(variable, e.target.value)}
                            className="w-full text-xs h-10"
                          />
                        ) : (
                          <Input
                            value={templateVariables[variable] || ''}
                            onChange={(e) => onVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                            className="w-full text-xs h-10"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-3 mt-6">
            <Button
              onClick={onClose}
              className="border border-slate-200 bg-transparent text-slate-600 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onSend}
              disabled={isPending || !selectedEmployeeId}
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md rounded-sm text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Send Document Email
            </Button>
          </div>
        </div>

        {/* Right side: Live Preview */}
        <div className="w-full md:w-1/2 flex flex-col bg-slate-50 dark:bg-[#151624]/60 border border-slate-150 dark:border-slate-850 rounded-sm p-6 max-h-[80vh]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[#0a66c2]" /> Dynamic Live Preview
            </span>
            <div className="flex items-center gap-2">
              {selectedEmployeeId && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-none text-[9px] rounded-sm font-bold px-2 py-0.5">
                  Target Verified
                </Badge>
              )}
              <Badge className="bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/40 shadow-none text-[8px] rounded-sm font-bold px-2 py-0.5">
                {DESIGN_THEMES.find(t => t.id === selectedDesign)?.name || 'Corporate Classic'}
              </Badge>
            </div>
          </div>

          {/* Scrollable Wrapper for Document */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 transform-gpu">
            {!isRendered ? (
              /* ── Live preview skeleton ─────────────────── */
              <div className="space-y-4 animate-pulse">
                <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-sm bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1">
                      <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2 w-20 rounded bg-slate-150 dark:bg-slate-800" />
                    </div>
                  </div>
                  <div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-44 rounded bg-slate-200 dark:bg-slate-700" />
                  {[1, 0.88, 0.75, 0.92, 0.65, 0.80].map((w, i) => (
                    <div key={i} className="h-2.5 rounded bg-slate-150 dark:bg-slate-800" style={{ width: `${w * 100}%` }} />
                  ))}
                </div>
                <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700 mt-3" />
                <div className="space-y-2">
                  {[0.9, 0.78, 0.60].map((w, i) => (
                    <div key={i} className="h-2.5 rounded bg-slate-150 dark:bg-slate-800" style={{ width: `${w * 100}%` }} />
                  ))}
                </div>
                <div className="flex justify-between items-end pt-5 mt-5 border-t border-slate-200 dark:border-slate-700">
                  <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex gap-10">
                    <div className="space-y-1">
                      <div className="h-3 w-18 rounded bg-slate-150 dark:bg-slate-800" />
                      <div className="h-px w-20 bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2 w-14 rounded bg-slate-100 dark:bg-slate-800/60" />
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="h-3 w-14 rounded bg-slate-150 dark:bg-slate-800 ml-auto" />
                      <div className="h-px w-20 bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2 w-10 rounded bg-slate-100 dark:bg-slate-800/60 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              themedDocument
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
