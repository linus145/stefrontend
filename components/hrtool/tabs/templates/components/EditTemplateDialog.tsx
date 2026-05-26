import React from 'react';
import { X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: { name: string; category: string; content: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; category: string; content: string }>>;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function EditTemplateDialog({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isPending
}: EditTemplateDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#121320] border border-slate-100 dark:border-slate-800 rounded-sm w-full max-w-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Edit2 className="h-4 w-4 text-[#0a66c2]" /> Edit Custom Document Template
        </h3>
        <p className="text-xs text-slate-500 mb-5">Refine your layout variables and formatting structure below.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Template Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Document Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full h-10 bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-sm px-3 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="PAYROLL">Payroll Related</option>
                <option value="OFFER_LETTER">Offer Letter</option>
                <option value="JOINING_LETTER">Joining Letter</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Template Content</label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              rows={10}
              className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-[#151624]/60"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              onClick={onClose}
              className="border border-slate-200 bg-transparent text-slate-650 rounded-sm text-xs font-bold py-2 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(form)}
              disabled={isPending || !form.name || !form.content}
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md rounded-sm text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1.5"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
