'use client';

import React, { useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveType: string;
  setLeaveType: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  isSubmittingLeave: boolean;
  balancesList: any[];
  onSubmit: (e: React.FormEvent) => void;
}

export function LeaveRequestModal({
  isOpen,
  onClose,
  leaveType,
  setLeaveType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  reason,
  setReason,
  isSubmittingLeave,
  balancesList,
  onSubmit
}: LeaveRequestModalProps) {
  const fallbackBalances = [
    { id: 'annual-leave', leave_type_name: 'Annual Leave', total_days: '18', used_days: '0', leave_type: 'annual-leave' },
    { id: 'sick-leave', leave_type_name: 'Sick Leave', total_days: '10', used_days: '0', leave_type: 'sick-leave' },
    { id: 'casual-leave', leave_type_name: 'Casual Leave', total_days: '7', used_days: '0', leave_type: 'casual-leave' },
    { id: 'maternity-paternity', leave_type_name: 'Maternity/Paternity Leave', total_days: '30', used_days: '0', leave_type: 'maternity-paternity' },
  ];

  const displayList = balancesList && balancesList.length > 0 ? balancesList : fallbackBalances;

  // Auto-select the first option when opening the modal if no selection exists
  useEffect(() => {
    if (isOpen && displayList.length > 0 && !leaveType) {
      setLeaveType(displayList[0].leave_type || displayList[0].id);
    }
  }, [isOpen, displayList, leaveType, setLeaveType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0a66c2]" />

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-850 dark:text-slate-200">Apply for Leave Request</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-slate-550 dark:text-slate-400 uppercase">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 transition-colors focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none"
            >
              {displayList.map((b: any) => (
                <option key={b.id} value={b.leave_type || b.id}>
                  {b.leave_type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold tracking-widest text-slate-550 dark:text-slate-400 uppercase">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 transition-colors focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold tracking-widest text-slate-550 dark:text-slate-400 uppercase">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 transition-colors focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-slate-550 dark:text-slate-400 uppercase">Reason for Leave</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide brief context for leave review..."
              className="w-full rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs px-3 py-2 transition-colors focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingLeave}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-[10px] uppercase tracking-widest rounded-sm px-6 cursor-pointer"
            >
              {isSubmittingLeave ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Submitting
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
