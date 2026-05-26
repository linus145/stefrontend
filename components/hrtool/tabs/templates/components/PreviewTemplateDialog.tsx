import React, { useState, useEffect } from 'react';
import { X, Eye, Copy, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DESIGN_THEMES, renderThemedDocument } from '../templates.designs';

interface PreviewTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  orgName?: string;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
  getCategoryLabel: (category: string) => string;
  getCategoryBadgeStyle: (category: string) => string;
}

export function PreviewTemplateDialog({
  isOpen,
  onClose,
  template,
  orgName,
  onCopy,
  copiedId,
  getCategoryLabel,
  getCategoryBadgeStyle
}: PreviewTemplateDialogProps) {
  const [previewDesign, setPreviewDesign] = useState('corporate');
  const [isRendered, setIsRendered] = useState(false);

  // Show skeleton briefly when dialog first opens or template changes
  useEffect(() => {
    if (isOpen && template) {
      setIsRendered(false);
      const t = requestAnimationFrame(() => setIsRendered(true));
      return () => cancelAnimationFrame(t);
    }
  }, [isOpen, template?.id, previewDesign]);

  const previewVars = React.useMemo(() => ({
    organization_name: orgName || 'B2Linq Technologies Inc',
    candidate_name: 'John Doe',
    employee_name: 'John Doe',
    employee_id: 'EMP-2026-99',
    joining_date: '2026-06-01',
    annual_salary: '₹12,00,000',
    basic_salary: '₹50,000',
    hra: '₹20,000',
    workplace_mode: 'Office (Full-Time)',
    reporting_manager: 'Jane Smith',
    pay_period: 'May 2026',
    month: 'May',
    year: '2026',
    net_salary: '₹85,000',
    gross_salary: '₹1,00,000',
    tax_deductions: '₹10,000',
    pf_deductions: '₹4,000',
    esi_deductions: '₹1,000',
    total_deductions: '₹15,000',
    tax_amount: '₹10,000',
  }), [orgName]);

  const themedDocument = React.useMemo(() => {
    if (!template) return null;
    return renderThemedDocument(previewDesign, template.content, previewVars);
  }, [previewDesign, template, previewVars]);

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121320] border border-slate-100 dark:border-slate-800 rounded-sm w-full max-w-3xl shadow-2xl p-6 relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#0a66c2]" /> Previewing: {template.name}
        </h3>
        
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <Badge className={`text-[9px] font-bold mt-1 shadow-none border px-2 py-0.5 rounded-sm ${getCategoryBadgeStyle(template.category)}`}>
            {getCategoryLabel(template.category)}
          </Badge>

          {/* Design switcher in preview */}
          <div className="flex items-center gap-1.5">
            <Palette className="h-3 w-3 text-slate-450" />
            <div className="flex gap-1">
              {DESIGN_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setPreviewDesign(theme.id)}
                  title={theme.name}
                  className={`h-5 w-8 rounded-sm transition-all duration-150 cursor-pointer ${theme.accentColor} ${
                    previewDesign === theme.id
                      ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900 scale-110'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#151624]/60 border border-slate-150 dark:border-slate-850 p-6 rounded-sm leading-relaxed transform-gpu min-h-[300px]">
          {!isRendered ? (
            /* ── Document skeleton shimmer ───────────────────── */
            <div className="space-y-4 animate-pulse">
              {/* Header block */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-sm bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1">
                    <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-24 rounded bg-slate-150 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-700 ml-auto" />
                  <div className="h-2 w-32 rounded bg-slate-150 dark:bg-slate-800 ml-auto" />
                </div>
              </div>
              {/* Body lines */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2 pt-1">
                  {[1, 0.9, 0.8, 1, 0.7, 0.85, 0.6].map((w, i) => (
                    <div key={i} className="h-2.5 rounded bg-slate-150 dark:bg-slate-800" style={{ width: `${w * 100}%` }} />
                  ))}
                </div>
              </div>
              {/* Section header */}
              <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700 mt-4" />
              <div className="space-y-2">
                {[0.95, 0.88, 0.75].map((w, i) => (
                  <div key={i} className="h-2.5 rounded bg-slate-150 dark:bg-slate-800" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
              {/* Footer */}
              <div className="flex justify-between items-end pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex gap-12">
                  <div className="space-y-1">
                    <div className="h-3 w-20 rounded bg-slate-150 dark:bg-slate-800" />
                    <div className="h-px w-24 bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-3 w-16 rounded bg-slate-150 dark:bg-slate-800 ml-auto" />
                    <div className="h-px w-24 bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-12 rounded bg-slate-100 dark:bg-slate-800/60 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            themedDocument
          )}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 mt-auto">
          <Button
            onClick={() => onCopy(template.id, template.content)}
            className="border border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-350 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1"
          >
            {copiedId === template.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} Copy layout content
          </Button>
          <Button
            onClick={onClose}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
