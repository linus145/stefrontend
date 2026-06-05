'use client';

import React, { useState } from 'react';
import { 
  Briefcase, Video, Users, UserCheck, Play, Sparkles, 
  ArrowRight, Shield, Layers, HelpCircle, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import sub-demo components
import { RecruiterDemo } from './recruiter-demo';
import { InterviewDemo } from './interview-demo';
import { HRToolDemo } from './hr-tool-demo';
import { EmployeePortalDemo } from './employee-portal-demo';

type DashboardTab = 'recruiter' | 'interview' | 'hr' | 'employee';

interface DashboardMeta {
  id: DashboardTab;
  title: string;
  description: string;
  coreModule: string;
  features: string;
  ctaText: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  accentBorder: string;
}

const DASHBOARD_METAS: DashboardMeta[] = [
  {
    id: 'recruiter',
    title: 'Recruiter Dashboard',
    description: 'A centralized command center for talent acquisition. Manage job postings, track applicant pipelines, deploy autonomous agents, and evaluate comprehensive AI-driven candidate scorecards.',
    coreModule: 'Talent orchestration',
    features: 'Agents & Scorecards',
    ctaText: 'Enter Recruiter Dashboard',
    icon: Briefcase,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    accentBorder: 'hover:border-emerald-500/50'
  },
  {
    id: 'interview',
    title: 'Interview Pipeline',
    description: 'A technical evaluation center housing real-time voice call transcripts, AI-driven dynamic testing question banks, and custom circular score radial metrics. Screen candidates with complete domain integrity.',
    coreModule: 'Ai screenings',
    features: 'JSON Logs',
    ctaText: 'Enter Interview Pipeline',
    icon: Video,
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    accentBorder: 'hover:border-indigo-500/50'
  },
  {
    id: 'hr',
    title: 'HR Tool Dashboard',
    description: 'A modern multi-tenant administration workspace supporting real-time shift models attendance trackers, soft-deletion synchronizing filters, manager leave approval dashboards, and granular organizational scoping.',
    coreModule: 'Attendance sync',
    features: 'Admin controls',
    ctaText: 'Enter HR Dashboard',
    icon: Users,
    colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    accentBorder: 'hover:border-purple-500/50'
  },
  {
    id: 'employee',
    title: 'Employee Portal',
    description: 'A dedicated self-service workspace for employees. Log shift timings, submit leave requests, monitor performance goals, update secure credentials, and review real-time notifications.',
    coreModule: 'Employee portal',
    features: 'Timecards & Leaves',
    ctaText: 'Enter Employee Portal',
    icon: UserCheck,
    colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    accentBorder: 'hover:border-blue-500/50'
  }
];

export function DemoShell() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('recruiter');

  const activeMeta = DASHBOARD_METAS.find(meta => meta.id === activeTab)!;

  const renderActiveDemo = () => {
    switch (activeTab) {
      case 'recruiter':
        return <RecruiterDemo />;
      case 'interview':
        return <InterviewDemo />;
      case 'hr':
        return <HRToolDemo />;
      case 'employee':
        return <EmployeePortalDemo />;
      default:
        return <RecruiterDemo />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-sm px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Layers className="w-4 h-4 text-indigo-500 animate-pulse" /> Platform Demonstrator
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight leading-none transition-colors duration-300">
          Experience our <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-700 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">workspaces in action.</span>
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed transition-colors duration-300">
          Interact with simulated pipelines, AI evaluations, timecards, and approvals. Switch dashboards using the selectors below to explore the functional behavior of each workspace.
        </p>
      </div>

      {/* Grid: Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DASHBOARD_METAS.map((meta) => {
          const Icon = meta.icon;
          const isSelected = activeTab === meta.id;

          return (
            <div
              key={meta.id}
              onClick={() => setActiveTab(meta.id)}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-sm shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-indigo-500 dark:border-indigo-400 shadow-md ring-1 ring-indigo-500/20'
                  : `border-slate-200/80 dark:border-slate-800/80 ${meta.accentBorder} hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              {/* Top Row: Icon & Selector State Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-sm border ${meta.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </span>
                )}
              </div>

              {/* Title & Short Details */}
              <div className="space-y-1.5 mb-4">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {meta.title}
                </h3>
                <p className="text-[11px] text-black dark:text-white font-bold">
                  Module: {meta.coreModule}
                </p>
              </div>

              {/* Card Footer Features list */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  {meta.features}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Demo <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace Frame */}
      <div className="bg-slate-100/40 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/80 rounded-sm p-2.5 sm:p-5 shadow-inner relative">
        
        {/* Frame Title Header bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-800 rounded-sm px-5 py-4 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Laptop className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {activeMeta.title} Preview Workspace
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {activeMeta.description}
            </p>
          </div>

          <a
            href={
              activeMeta.id === 'recruiter' ? '/recruiter' : 
              activeMeta.id === 'interview' ? '/recruiter/AIInterviews' : 
              activeMeta.id === 'hr' ? '/Hrtools' : 
              '/employee/dashboard'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-sm bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-sm shrink-0 w-full md:w-auto"
          >
            {activeMeta.ctaText} <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Demo Sub-dashboard container viewport */}
        <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/50 rounded-sm p-3 sm:p-6 shadow-sm relative overflow-hidden transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderActiveDemo()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
