'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Clock, FileText, Target, Shield, Bell, Check, 
  AlertTriangle, ArrowRight, Sparkles, Send, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Timecard {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: 'Completed' | 'Active';
}

interface LeaveHistory {
  id: string;
  type: string;
  dates: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

export function EmployeePortalDemo() {
  // Check-in state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  
  // Leave requests history
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([
    { id: '1', type: 'Annual Leave', dates: 'July 1 - July 5', status: 'Approved', reason: 'Summer holiday' },
    { id: '2', type: 'Medical Leave', dates: 'May 12 (1 Day)', status: 'Approved', reason: 'Flu checkup' }
  ]);

  // Form states
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDates, setLeaveDates] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Timecard history
  const [timecards, setTimecards] = useState<Timecard[]>([
    { id: 't1', date: 'Yesterday', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8.5 hrs', status: 'Completed' },
    { id: 't2', date: 'June 3, 2026', checkIn: '08:45 AM', checkOut: '05:15 PM', hours: '8.5 hrs', status: 'Completed' }
  ]);

  // Password / Secure change
  const [secStatus, setSecStatus] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your May expense report has been approved.", time: "1h ago" },
    { id: 2, text: "New shift schedule updated for next week.", time: "4h ago" }
  ]);

  // Clock-in timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCheckedIn && checkInTime) {
      const startTime = new Date(checkInTime).getTime();
      timer = setInterval(() => {
        const diff = Date.now() - startTime;
        const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setElapsedTime(`${hrs}:${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn, checkInTime]);

  const handleClockToggle = () => {
    if (!isCheckedIn) {
      const now = new Date();
      setIsCheckedIn(true);
      setCheckInTime(now.toISOString());
      setElapsedTime('00:00:00');
      // Add active card to table
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newCard: Timecard = {
        id: 'active',
        date: 'Today',
        checkIn: timeStr,
        checkOut: '--',
        hours: 'Active',
        status: 'Active'
      };
      setTimecards(prev => [newCard, ...prev]);
    } else {
      setIsCheckedIn(false);
      setCheckInTime(null);
      // Finalize active card
      const checkoutStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTimecards(prev => prev.map(tc => {
        if (tc.id === 'active') {
          return {
            ...tc,
            checkOut: checkoutStr,
            hours: 'Logged',
            status: 'Completed'
          };
        }
        return tc;
      }));
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDates || !leaveReason) {
      alert("Please fill in all leave request fields.");
      return;
    }
    setIsSubmittingLeave(true);
    
    setTimeout(() => {
      const newRequest: LeaveHistory = {
        id: 'req-' + Date.now(),
        type: leaveType,
        dates: leaveDates,
        status: 'Pending',
        reason: leaveReason
      };
      setLeaveHistory(prev => [newRequest, ...prev]);
      setIsSubmittingLeave(false);
      setLeaveDates('');
      setLeaveReason('');
      
      // Add a notification about submission
      setNotifications(prev => [
        { id: Date.now(), text: `Leave request for ${leaveDates} successfully queued.`, time: "Just now" },
        ...prev
      ]);
    }, 1000);
  };

  const handleUpdateSecure = (e: React.FormEvent) => {
    e.preventDefault();
    setSecStatus("processing");
    setTimeout(() => {
      setSecStatus("success");
      setTimeout(() => setSecStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
            alt="Liam O'Connor"
            className="w-10 h-10 rounded-sm object-cover border border-blue-500/25"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Liam O'Connor <span className="text-[9px] bg-blue-105 dark:bg-blue-955 text-blue-700 dark:text-blue-450 px-2 py-0.5 rounded-sm font-bold">Principal Engineer</span>
            </h3>
            <p className="text-slate-505 dark:text-slate-400 text-xs mt-0.5">
              Access your workspace, register hours, file leave forms, and check professional milestone progress.
            </p>
          </div>
        </div>
        
        {/* Dynamic Shift Clock Widget */}
        <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-sm shadow-sm">
          {isCheckedIn && (
            <div className="space-y-0.5 text-right font-mono">
              <span className="block text-[8px] text-emerald-500 font-bold uppercase tracking-wider animate-pulse">● WORK SESSION ACTIVE</span>
              <span className="text-xs font-black text-slate-850 dark:text-slate-200">{elapsedTime}</span>
            </div>
          )}
          <button
            onClick={handleClockToggle}
            className={`h-9 px-4 rounded-sm font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm ${
              isCheckedIn
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-0.5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {isCheckedIn ? 'Clock Out' : 'Clock In Shift'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Register Hours & Leaves Request */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Submit Leave Request Form & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form */}
            <div className="bg-white dark:bg-slate-905 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-blue-500" /> File Leave Request
              </h4>

              <form onSubmit={handleLeaveSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-sm px-2.5 py-2 text-slate-700 dark:text-slate-300"
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Leave Dates</label>
                  <input
                    type="text"
                    placeholder="e.g. June 20 - June 22"
                    value={leaveDates}
                    onChange={(e) => setLeaveDates(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-sm px-2.5 py-2 text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Reason Description</label>
                  <textarea
                    placeholder="Specify leave reason..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    rows={2}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-sm px-2.5 py-2 text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400 rounded-sm text-xs font-bold flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  {isSubmittingLeave ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Leave History Tracker */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350 flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-teal-500" /> Leave Balance & History
              </h4>

              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-center bg-slate-50 dark:bg-slate-850/50 p-2 rounded-sm">
                  <span className="text-[8px] text-slate-400 font-bold block uppercase">Casual</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">5/8</span>
                </div>
                <div className="text-center bg-slate-50 dark:bg-slate-850/50 p-2 rounded-sm">
                  <span className="text-[8px] text-slate-400 font-bold block uppercase">Medical</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">4/5</span>
                </div>
                <div className="text-center bg-slate-50 dark:bg-slate-850/50 p-2 rounded-sm">
                  <span className="text-[8px] text-slate-400 font-bold block uppercase">Annual</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">14/20</span>
                </div>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {leaveHistory.map(item => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={item.id}
                      className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-850/30 flex justify-between items-center text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-slate-705 dark:text-slate-300">{item.dates}</div>
                        <div className="text-[9px] text-slate-400">{item.type} - "{item.reason}"</div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${
                        item.status === 'Approved' ? 'bg-emerald-105 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-450' :
                        item.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-955/50 text-amber-700 dark:text-amber-400' :
                        'bg-rose-100 dark:bg-rose-955/50 text-rose-700 dark:text-rose-455'
                      }`}>
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Timecard Log Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350">
              Logged Shift History (Timecards)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Check In</th>
                    <th className="pb-2">Check Out</th>
                    <th className="pb-2">Logged Hours</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timecards.map((card, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{card.date}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-450">{card.checkIn}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-450">{card.checkOut}</td>
                      <td className="py-2.5 font-bold text-slate-700 dark:text-slate-300">{card.hours}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${
                          card.status === 'Active' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-805 text-slate-500'
                        }`}>
                          {card.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Performance Goals & Notification Center */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Performance Milestone Goals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350 flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-amber-500" /> Active Performance Goals
            </h4>

            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Automate Core API Testing</span>
                  <span className="font-bold text-blue-600 dark:text-blue-450">80%</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-slate-800 h-2 rounded-sm overflow-hidden">
                  <div className="bg-blue-650 h-full rounded-sm" style={{ width: '80%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Submit Code Reviews (PRs)</span>
                  <span className="font-bold text-purple-600 dark:text-purple-450">50%</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-slate-800 h-2 rounded-sm overflow-hidden">
                  <div className="bg-purple-650 h-full rounded-sm" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Technical Documentation</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-455">100%</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-slate-800 h-2 rounded-sm overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-sm" style={{ width: '100%' }} />
                </div>
              </div>

            </div>
          </div>

          {/* Secure credentials & notifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            
            {/* Notification Center */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-850 dark:text-slate-350 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-500 animate-swing" /> Announcements
                </h4>
              </div>
              
              <div className="space-y-2">
                {notifications.map((item, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-sm">
                    <p className="text-slate-650 dark:text-slate-300">{item.text}</p>
                    <span className="text-[9px] text-slate-400 block mt-1">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials Panel */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-850 dark:text-slate-350 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" /> Security Controls
              </h4>

              <form onSubmit={handleUpdateSecure} className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Update Secret Token</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    required
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-sm px-2.5 py-1.5 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-8 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-sm text-[10px] font-bold transition-all"
                >
                  {secStatus === 'processing' ? 'Syncing...' : secStatus === 'success' ? '✓ Token Verified' : 'Submit Credentials'}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
