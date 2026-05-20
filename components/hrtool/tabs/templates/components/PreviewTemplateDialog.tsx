import React, { useState } from 'react';
import { X, Eye, Copy, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DESIGN_THEMES, renderThemedDocument } from '../templates.designs';

interface PreviewTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
  getCategoryLabel: (category: string) => string;
  getCategoryBadgeStyle: (category: string) => string;
}

export function PreviewTemplateDialog({
  isOpen,
  onClose,
  template,
  onCopy,
  copiedId,
  getCategoryLabel,
  getCategoryBadgeStyle
}: PreviewTemplateDialogProps) {
  const [previewDesign, setPreviewDesign] = useState('corporate');

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121320] border border-slate-100 dark:border-slate-800 rounded-md w-full max-w-3xl shadow-2xl p-6 relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">
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
          <Badge className={`text-[9px] font-bold mt-1 shadow-none border px-2 py-0.5 rounded-md ${getCategoryBadgeStyle(template.category)}`}>
            {getCategoryLabel(template.category)}
          </Badge>

          {/* Design switcher in preview */}
          <div className="flex items-center gap-1.5">
            <Palette className="h-3 w-3 text-slate-400" />
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

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#151624]/60 border border-slate-150 dark:border-slate-850 p-6 rounded-md leading-relaxed">
          {renderThemedDocument(previewDesign, template.content)}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 mt-auto">
          <Button
            onClick={() => onCopy(template.id, template.content)}
            className="border border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-350 rounded-md text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1"
          >
            {copiedId === template.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />} Copy layout content
          </Button>
          <Button
            onClick={onClose}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md rounded-md text-xs font-bold py-2 px-4 cursor-pointer"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
