'use client';

import React, { useState } from 'react';
import { 
  Users, Check, X, Shield, RefreshCw, Filter, Trash2, 
  Clock, ArrowUpRight, CheckCircle2, CloudLightning, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: 'Engineering' | 'Sales' | 'Product';
  status: 'Active' | 'On Leave' | 'Archived';
  isSoftDeleted: boolean;
}

interface LeaveRequest {
  id: string;
  name: string;
  type: string;
  duration: string;
  reason: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Cooper', role: 'Software Architect', department: 'Engineering', status: 'Active', isSoftDeleted: false },
  { id: '2', name: 'Bob Smith', role: 'Account Executive', department: 'Sales', status: 'Active', isSoftDeleted: false },
  { id: '3', name: 'Clara Oswald', role: 'Product Lead', department: 'Product', status: 'On Leave', isSoftDeleted: false },
  { id: '4', name: 'Danny DeVito', role: 'ML Ops Engineer', department: 'Engineering', status: 'Archived', isSoftDeleted: true }, // soft deleted
  { id: '5', name: 'Eva Green', role: 'Marketing Manager', department: 'Sales', status: 'Archived', isSoftDeleted: true } // soft deleted
];

const INITIAL_LEAVES: LeaveRequest[] = [
  { id: 'l1', name: 'Alice Cooper', type: 'Medical Leave', duration: '3 Days (June 8 - June 11)', reason: 'Dental recovery' },
  { id: 'l2', name: 'Bob Smith', type: 'Casual Leave', duration: '1 Day (June 15)', reason: 'Family event' }
];

export function HRToolDemo() {
  const [scope, setScope] = useState<'All' | 'Engineering' | 'Sales' | 'Product'>('All');
  const [showSoftDeleted, setShowSoftDeleted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [activeLeavesCount, setActiveLeavesCount] = useState(1);

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesScope = scope === 'All' || emp.department === scope;
    if (showSoftDeleted) {
      return matchesScope;
    }
    return matchesScope && !emp.isSoftDeleted;
  });

  const handleSyncAttendance = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(`At ${time}`);
    }, 1500);
  };

  const handleLeaveAction = (id: string, action: 'approve' | 'reject') => {
    setLeaves(prev => prev.filter(req => req.id !== id));
    if (action === 'approve') {
      setActiveLeavesCount(prev => prev + 1);
      // Change status in employee list
      const targetRequest = leaves.find(l => l.id === id);
      if (targetRequest) {
        setEmployees(prev => prev.map(emp => {
          if (emp.name === targetRequest.name) {
            return { ...emp, status: 'On Leave' };
          }
          return emp;
        }));
      }
    }
  };

  const handleToggleRestore = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        return { ...emp, isSoftDeleted: !emp.isSoftDeleted, status: emp.isSoftDeleted ? 'Active' : 'Archived' };
      }
      return emp;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top HR Control Widget */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Multi-Tenant HR Suite
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Manage real-time attendance syncing, soft-deletion synchronizing filters, and leave approval lifecycles.
          </p>
        </div>
        
        {/* Attendance Sync Module */}
        <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-sm">
          <div className="space-y-0.5 text-right">
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Biometric Attendance Sync</span>
            <span className="text-[10px] font-semibold text-slate-650 dark:text-slate-350">Last synced: {lastSyncTime}</span>
          </div>
          <button
            onClick={handleSyncAttendance}
            disabled={isSyncing}
            className={`w-8 h-8 rounded-sm flex items-center justify-center border transition-all ${
              isSyncing 
                ? 'bg-slate-105 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700' 
                : 'bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50 hover:bg-purple-100'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Organization Directory & Soft Deletion Filters */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-5">
            
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-205 uppercase tracking-wide">Org Scoping</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Scoping dropdown */}
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-sm px-2 py-1 text-slate-650 dark:text-slate-350"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Product">Product</option>
                </select>

                {/* Soft-deletion toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-650 dark:text-slate-355">
                  <input
                    type="checkbox"
                    checked={showSoftDeleted}
                    onChange={(e) => setShowSoftDeleted(e.target.checked)}
                    className="rounded-sm text-purple-650 focus:ring-purple-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>Show Soft-Deleted</span>
                </label>
              </div>
            </div>

            {/* Employee Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Employee</th>
                    <th className="pb-3">Dept</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredEmployees.map(emp => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        key={emp.id}
                        className={`border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                          emp.isSoftDeleted ? 'opacity-50 bg-slate-50/50 dark:bg-slate-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5">
                          <div className="font-bold text-slate-850 dark:text-slate-200">{emp.name}</div>
                          <div className="text-[10px] text-slate-400">{emp.role}</div>
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400">
                          {emp.department}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-sm ${
                            emp.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' :
                            emp.status === 'On Leave' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleToggleRestore(emp.id)}
                            className={`p-1.5 rounded-sm transition-all inline-flex items-center gap-1 ${
                              emp.isSoftDeleted 
                                ? 'bg-indigo-50 dark:bg-indigo-955 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100/70'
                            }`}
                          >
                            {emp.isSoftDeleted ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-black uppercase">Restore</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-black uppercase">Soft-Del</span>
                              </>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No directory records found under selected scoping.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Manager Leave Approval Box & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time stats widgets */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-4 shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Headcount Scoped</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-baseline gap-1.5">
                <span>{employees.filter(e => !e.isSoftDeleted).length}</span>
                <span className="text-xs font-normal text-slate-400">Total</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-4 shadow-sm">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Active Leaves</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-baseline gap-1.5">
                <span>{activeLeavesCount}</span>
                <span className="text-xs font-normal text-slate-400">Approved</span>
              </div>
            </div>

          </div>

          {/* Leave approvals box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-855 dark:text-slate-350">
                  Manager Approvals Inbox
                </h4>
              </div>
              <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-650 dark:text-amber-450 px-2 py-0.5 rounded-sm font-bold">
                {leaves.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {leaves.map(req => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={req.id}
                    className="p-3.5 bg-slate-55 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{req.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{req.duration}</div>
                      </div>
                      <span className="text-[9px] bg-purple-50 dark:bg-purple-950 text-purple-650 dark:text-purple-400 px-2 py-0.5 rounded-sm font-semibold">
                        {req.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-505 dark:text-slate-400 italic">
                      "{req.reason}"
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleLeaveAction(req.id, 'approve')}
                        className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] font-bold flex items-center justify-center gap-1 hover:-translate-y-0.5 transition-all shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Leave
                      </button>
                      <button
                        onClick={() => handleLeaveAction(req.id, 'reject')}
                        className="h-8 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-605 dark:text-slate-455 hover:bg-slate-50 rounded-sm text-[10px] font-semibold transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {leaves.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-505 animate-bounce" />
                  <p className="font-semibold text-slate-605 dark:text-slate-400">All leave approvals processed!</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
