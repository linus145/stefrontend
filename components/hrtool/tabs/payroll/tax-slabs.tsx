'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface TaxSlabsProps {
  taxConfigs: any;
  taxForm: {
    slab_name: string;
    percentage: string;
    min_amount: string;
    max_amount: string;
  };
  setTaxForm: (form: any) => void;
  isTaxModalOpen: boolean;
  setIsTaxModalOpen: (open: boolean) => void;
  onTaxSubmit: (data: any) => void;
  taxPending: boolean;
}

export function TaxSlabs({
  taxConfigs,
  taxForm,
  setTaxForm,
  isTaxModalOpen,
  setIsTaxModalOpen,
  onTaxSubmit,
  taxPending
}: TaxSlabsProps) {
  
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-medium">Income tax bracket configurations</h3>
          <p className="text-xs text-slate-500 font-medium">Configure progressive tax bracket thresholds for statutory compliance withholding.</p>
        </div>
        <Button 
          onClick={() => {
            setTaxForm({
              slab_name: '',
              percentage: '',
              min_amount: '',
              max_amount: ''
            });
            setIsTaxModalOpen(true);
          }}
          data-agent="payroll-tax-add-btn"
          className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-sm rounded-md text-xs font-bold py-2 px-3 flex items-center gap-1 cursor-pointer transition-all duration-300"
        >
          <Plus className="h-4 w-4" /> Add tax slab bracket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {taxConfigs?.data?.results?.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 font-semibold tracking-wide bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-850 rounded-md">
            No custom tax config slabs set. Falling back to default structures.
          </div>
        ) : (
          taxConfigs?.data?.results?.map((slab: any) => (
            <Card key={slab.id} className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/40 rounded-md shadow-sm">
              <CardHeader className="pb-2 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-semibold">{slab.slab_name}</CardTitle>
                  <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] dark:bg-[#0a66c2]/20 dark:text-[#3b8fd9] border-none font-bold text-[10px] rounded-md shadow-none border">
                    {slab.percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800/30 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Minimum threshold:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">${parseFloat(slab.min_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Maximum threshold:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">
                    {slab.max_amount ? `$${parseFloat(slab.max_amount).toLocaleString()}` : 'No upper limit (Infinity)'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tax Slab addition Modal */}
      {isTaxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800/80 rounded-md w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsTaxModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">Configure custom tax slab bracket</h3>
            <p className="text-xs text-slate-500 mb-5">Create progressive income tax bracket intervals for local tax regulations withholding.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide">Slab name</label>
                <input 
                  type="text" 
                  value={taxForm.slab_name}
                  onChange={(e) => setTaxForm({...taxForm, slab_name: e.target.value})}
                  data-agent="payroll-tax-slab-name-input"
                  placeholder="e.g. Higher bracket tier"
                  className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 tracking-wide">Withholding tax %</label>
                <input 
                  type="number" 
                  value={taxForm.percentage}
                  onChange={(e) => setTaxForm({...taxForm, percentage: e.target.value})}
                  data-agent="payroll-tax-percentage-input"
                  placeholder="e.g. 25"
                  className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 tracking-wide">Min income range ($)</label>
                  <input 
                    type="number" 
                    value={taxForm.min_amount}
                    onChange={(e) => setTaxForm({...taxForm, min_amount: e.target.value})}
                    data-agent="payroll-tax-min-amount-input"
                    placeholder="e.g. 10000"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 tracking-wide">Max income range ($)</label>
                  <input 
                    type="number" 
                    value={taxForm.max_amount}
                    onChange={(e) => setTaxForm({...taxForm, max_amount: e.target.value})}
                    data-agent="payroll-tax-max-amount-input"
                    placeholder="Leave empty for infinity"
                    className="w-full bg-[#f8fafc] dark:bg-[#151624] border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  onClick={() => setIsTaxModalOpen(false)}
                  className="border border-slate-200 bg-transparent text-slate-600 rounded-md text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const parsedData: any = {
                      slab_name: taxForm.slab_name,
                      percentage: parseFloat(taxForm.percentage),
                      min_amount: parseFloat(taxForm.min_amount)
                    };
                    if (taxForm.max_amount) {
                      parsedData.max_amount = parseFloat(taxForm.max_amount);
                    }
                    onTaxSubmit(parsedData);
                  }}
                  disabled={taxPending}
                  data-agent="payroll-tax-modal-save-btn"
                  className="bg-[#0a66c2] hover:bg-[#084e96] text-white shadow-md shadow-blue-500/15 rounded-md text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  Save bracket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
