'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Terminal, Play, ClipboardCheck, Sparkles, Send,
  Briefcase, Landmark, UserPlus, Cpu, RefreshCw, CheckCircle2,
  AlertCircle, Loader2, ArrowRight, Check, ExternalLink,
  FileText, Building2, MapPin, DollarSign, Users, Award,
  Sun, Moon
} from 'lucide-react';

interface SimulatedStep {
  log: string;
  type: 'info' | 'success' | 'warning';
}

interface PromptConfig {
  title: string;
  icon: React.ReactNode;
  userPrompt: string;
  thoughts: string;
  agentName: string;
  logs: SimulatedStep[];
}

const PROMPTS: PromptConfig[] = [
  {
    title: "Post a Job",
    icon: <Briefcase className="w-3.5 h-3.5" />,
    userPrompt: "Post a job for a Senior React Engineer in Bangalore, hybrid, ₹25L/year.",
    thoughts: "Parsing request parameters. Initializing Sourcing Agent and ATS Coordinator...",
    agentName: "ATS Publisher Agent",
    logs: [
      { log: "[INFO] Parse intent: CREATE_JOB_POST", type: 'info' },
      { log: "[INFO] Job Specs: Title='Senior React Engineer', Loc='Bangalore', Salary='₹25L/yr'", type: 'info' },
      { log: "[INFO] Activating LLM Sourcing Agent to construct standard JD parameters...", type: 'info' },
      { log: "[SUCCESS] JD outline generated and validated successfully.", type: 'success' },
      { log: "[INFO] Contacting Careers API & publishing to B2linq global portal...", type: 'info' },
      { log: "[INFO] Distributing live posting to LinkedIn, Glassdoor & active boards...", type: 'info' },
      { log: "[SUCCESS] Published Live! ID: JOB-28472", type: 'success' }
    ]
  },
  {
    title: "Run Payroll",
    icon: <Landmark className="w-3.5 h-3.5" />,
    userPrompt: "Execute monthly payroll run for the Engineering department.",
    thoughts: "Retrieving salary structures and tax adjustments. Invoking Ledger Integration Gateway...",
    agentName: "Bank Settlement Agent",
    logs: [
      { log: "[INFO] Parse intent: RUN_PAYROLL", type: 'info' },
      { log: "[INFO] Matching active department profiles: [Engineering]", type: 'info' },
      { log: "[INFO] Fetching 15 employee bank ledger account VPAs...", type: 'info' },
      { log: "[INFO] Applying TDS deductions and Professional Tax regulations...", type: 'info' },
      { log: "[INFO] Launching bank ledger API batch connection gateway...", type: 'info' },
      { log: "[SUCCESS] Transferred ₹18,42,000 successfully to 15 bank accounts.", type: 'success' },
      { log: "[INFO] Auto-compiling PDF payslips and sending to employee hubs...", type: 'info' },
      { log: "[SUCCESS] Monthly payroll run execution completed.", type: 'success' }
    ]
  },
  {
    title: "Onboard Employee",
    icon: <UserPlus className="w-3.5 h-3.5" />,
    userPrompt: "Onboard our new Front-End Engineer David Miller.",
    thoughts: "Initializing HRMS sync pipeline. Auto-generating NDA and security packets...",
    agentName: "Onboarding Coordinator",
    logs: [
      { log: "[INFO] Parse intent: ONBOARD_EMPLOYEE", type: 'info' },
      { log: "[INFO] Profile data: David Miller, Role='Senior FE Engineer'", type: 'info' },
      { log: "[INFO] Formulating personalized welcome packet & handbook access index...", type: 'info' },
      { log: "[INFO] Auto-compiling legal NDA & workspace safety documents...", type: 'info' },
      { log: "[INFO] Provisioning corporate workspace email: dmiller@b2linq.com...", type: 'info' },
      { log: "[INFO] Syncing credentials and data into HRMS portal employee roster...", type: 'info' },
      { log: "[SUCCESS] NDA package dispatched. Workspace access fully provisioned.", type: 'success' }
    ]
  },
  {
    title: "More Agentic Automation",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    userPrompt: "Show me additional autonomous agents and HR management tools.",
    thoughts: "Querying active system agent registry and loading daemon states...",
    agentName: "Registry Orchestrator",
    logs: [
      { log: "[INFO] Requesting active system agent registry...", type: 'info' },
      { log: "[INFO] Scanning background cooperative daemons...", type: 'info' },
      { log: "[SUCCESS] Discovered 3 additional operational modules:", type: 'success' },
      { log: "  - Sourcing & Hiring Agent (Active)", type: 'info' },
      { log: "  - HRMS Workspace Agent (Awaiting)", type: 'info' },
      { log: "  - HR Management & Security Agent (Active)", type: 'info' },
      { log: "[SUCCESS] Agent registry load completed.", type: 'success' }
    ]
  }
];

export function InteractiveChatAgent() {
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [inputValue, setInputValue] = useState(PROMPTS[0].userPrompt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<SimulatedStep[]>([]);
  const [currentThought, setCurrentThought] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [agentName, setAgentName] = useState(PROMPTS[0].agentName);
  const [isDark, setIsDark] = useState(true);
  
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const startSimulation = (idx: number) => {
    if (isProcessing) return;
    
    const config = PROMPTS[idx];
    setSelectedPromptIdx(idx);
    setInputValue(config.userPrompt);
    setIsProcessing(true);
    setVisibleLogs([]);
    setCurrentThought("");
    setShowResult(false);
    setAgentName(config.agentName);

    // 1. Simulate thought processing
    setTimeout(() => {
      setCurrentThought(config.thoughts);
      
      // 2. Play CLI Logs one by one
      let currentLogIdx = 0;
      const logInterval = setInterval(() => {
        if (currentLogIdx < config.logs.length) {
          const logItem = config.logs[currentLogIdx];
          if (logItem) {
            setVisibleLogs(prev => [...prev, logItem]);
          }
          currentLogIdx++;
        } else {
          clearInterval(logInterval);
          // 3. Show Final Success Card
          setTimeout(() => {
            setShowResult(true);
            setIsProcessing(false);
          }, 600);
        }
      }, 700);
    }, 800);
  };

  useEffect(() => {
    // Initial run
    startSimulation(0);
  }, []);

  // Smooth scroll the chat logs container locally
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleLogs, currentThought, showResult]);

  const stepCount = visibleLogs.length;

  // Theme Class Mappings
  const bgMain = isDark 
    ? 'bg-zinc-900 border-zinc-700 text-white shadow-2xl' 
    : 'bg-white border-zinc-300 text-zinc-900 shadow-xl';
  const textHeading = isDark ? 'text-white' : 'text-zinc-900';
  const textDesc = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const bgConsole = isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-300/80';
  const borderSep = isDark ? 'border-zinc-850' : 'border-zinc-200';
  const bgItem = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-350';
  const textBody = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const bgInput = isDark 
    ? 'bg-zinc-900 border-zinc-700 text-zinc-500' 
    : 'bg-white border-zinc-300 text-zinc-800';

  return (
    <div className={`w-full border rounded-sm p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ${bgMain}`}>
      
      {/* Accent gradients */}
      {isDark && <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] bg-indigo-500/10 -z-10" />}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${textHeading}`}>
            <Bot className="w-4 h-4 text-indigo-500 animate-pulse" /> Autonomous Agent Chat Console
          </h3>
          <p className="text-xs text-slate-500">Click a preset flow or query the AI agents to watch them execute work live.</p>
        </div>

        {/* Controls & Theme selection */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0 select-none">
          {/* Light/Dark Mode Selector Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`h-8 px-3 rounded-sm flex items-center gap-1.5 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              isDark 
                ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white' 
                : 'bg-zinc-50 border-zinc-300 text-zinc-650 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title="Toggle theme view"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* HUD Stats */}
          <div className={`flex items-center gap-3 border rounded-sm px-3.5 py-1.5 text-[10px] font-bold shadow-inner ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-300 text-zinc-500'
          }`}>
            <div className={`flex items-center gap-1 border-r pr-2.5 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <span className="text-indigo-500 font-black">Agent OS</span> Online
            </div>
            <div className="flex items-center gap-1">
              <span className="text-emerald-500 font-black">API Core</span> Active
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Prompts pills */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => startSimulation(idx)}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm border text-xs font-bold transition-all duration-300 cursor-pointer ${
              selectedPromptIdx === idx
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 dark:text-indigo-300 shadow-sm'
                : isDark 
                  ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
            } disabled:opacity-50`}
          >
            {p.icon}
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Grid: Left Simulator, Right Chat Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT SIDE: REAL APPLICATION SIMULATOR (7 cols) */}
        <div className={`lg:col-span-7 border rounded-sm p-5 sm:p-6 min-h-[380px] max-h-[380px] overflow-hidden shadow-inner flex flex-col justify-between relative transition-colors duration-500 ${bgConsole}`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${borderSep}`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex items-center justify-center text-[7px] font-black text-slate-500">•</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedPromptIdx === 0 && "B2Linq Job Manager"}
                {selectedPromptIdx === 1 && "B2Linq Payroll Ledger"}
                {selectedPromptIdx === 2 && "B2Linq Onboarding Portal"}
                {selectedPromptIdx === 3 && "B2Linq System Registry"}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">localhost:3000/dashboard</span>
          </div>

          {/* Simulator Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            
            {/* 1. JOB POSTING SIMULATOR */}
            {selectedPromptIdx === 0 && (
              <div className="space-y-4">
                {!showResult ? (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-800'}`}>Create New Job Opening</h4>
                      {stepCount >= 3 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded text-indigo-400 bg-indigo-500/10 animate-pulse">
                          Agent Typing JD...
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="space-y-1">
                        <span className="text-slate-500 block uppercase font-bold">Role Title</span>
                        <div className={`h-9 px-3 border rounded-sm flex items-center font-semibold truncate ${
                          isDark ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        }`}>
                          {stepCount >= 2 ? "Senior React Engineer" : ""}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block uppercase font-bold">Location</span>
                        <div className={`h-9 px-3 border rounded-sm flex items-center font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        }`}>
                          {stepCount >= 2 ? "Bangalore (Hybrid)" : ""}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block uppercase font-bold">Department</span>
                        <div className={`h-9 px-3 border rounded-sm flex items-center font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        }`}>
                          {stepCount >= 2 ? "Engineering" : ""}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block uppercase font-bold">Budget Plan</span>
                        <div className={`h-9 px-3 border rounded-sm flex items-center font-semibold ${
                          isDark ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        }`}>
                          {stepCount >= 2 ? "₹25,00,000 / year" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block uppercase font-bold text-[10px]">AI Generated Description Preview</span>
                      <div className={`border rounded-sm p-3 text-[9px] font-mono min-h-20 leading-relaxed overflow-hidden ${
                        isDark ? 'bg-slate-900 border-slate-850 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                      }`}>
                        {stepCount >= 4 ? (
                          <>
                            <span className="text-indigo-500 dark:text-indigo-400 font-bold block">## JD Summary</span>
                            We are seeking a Senior React Architect to orchestrate Frontend workflows, tune dynamic virtual list grids, and optimize browser rendering loops...
                          </>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 h-14 text-slate-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                            <span>Awaiting agent parameter extraction...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center space-y-4 animate-in zoom-in-95 duration-400">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/5">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${textHeading}`}>Job Successfully Posted!</h4>
                      <p className="text-[10px] text-slate-500">The agent completed JD generation and distributed the post live.</p>
                    </div>

                    <div className={`max-w-md mx-auto p-4 border rounded-sm text-left flex items-start gap-3 shadow-md relative overflow-hidden ${bgItem}`}>
                      <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-500 border-l border-b border-slate-200 dark:border-slate-850 text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        Posted Live
                      </div>
                      <div className="w-8 h-8 rounded-sm bg-indigo-500/5 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className={`text-xs font-bold block truncate ${textHeading}`}>Senior React Engineer</span>
                        <div className="flex flex-wrap gap-2 text-[9px] text-slate-400">
                          <span>Bangalore (Hybrid)</span>
                          <span>•</span>
                          <span>₹25,00,000 / year</span>
                        </div>
                        <div className={`flex gap-4 text-[9px] pt-1.5 border-t mt-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                          <span className="text-[#0a66c2] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
                            LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                          <span className="text-slate-500 hover:text-slate-650 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer">
                            Glassdoor <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. PAYROLL SIMULATOR */}
            {selectedPromptIdx === 1 && (
              <div className="space-y-4">
                {!showResult ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${isDark ? 'text-slate-355' : 'text-slate-800'}`}>Processing Department: Engineering</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded text-amber-500 bg-amber-500/10 animate-pulse">
                        Ledger Verification...
                      </span>
                    </div>

                    <div className={`border rounded-sm overflow-hidden shadow-inner ${isDark ? 'border-slate-850 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                      <table className="w-full text-[10px] text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-slate-500 font-bold uppercase text-[9px] ${isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                            <th className="p-2.5 pl-3">Employee</th>
                            <th className="p-2.5">Net Salary</th>
                            <th className="p-2.5">Bank Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-850/40' : 'divide-slate-200/50'}`}>
                          {/* Row 1 */}
                          <tr className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            <td className="p-2.5 pl-3 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>Sarah Chen</span>
                            </td>
                            <td className="p-2.5 font-bold">₹2,50,000</td>
                            <td className="p-2.5">
                              {stepCount >= 3 ? (
                                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                                  <Check className="w-3 h-3 stroke-[2.5]" /> Settled
                                </span>
                              ) : (
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin text-slate-400" /> Verifying VPA
                                </span>
                              )}
                            </td>
                          </tr>
                          {/* Row 2 */}
                          <tr className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            <td className="p-2.5 pl-3 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>Alex Rivera</span>
                            </td>
                            <td className="p-2.5 font-bold">₹1,80,000</td>
                            <td className="p-2.5">
                              {stepCount >= 5 ? (
                                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                                  <Check className="w-3 h-3 stroke-[2.5]" /> Settled
                                </span>
                              ) : stepCount >= 3 ? (
                                <span className="text-amber-500 flex items-center gap-1 animate-pulse">
                                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> Transferring
                                </span>
                              ) : (
                                <span className="text-slate-400">Pending</span>
                              )}
                            </td>
                          </tr>
                          {/* Row 3 */}
                          <tr className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            <td className="p-2.5 pl-3 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>David Miller</span>
                            </td>
                            <td className="p-2.5 font-bold">₹1,50,000</td>
                            <td className="p-2.5">
                              {stepCount >= 7 ? (
                                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                                  <Check className="w-3 h-3 stroke-[2.5]" /> Settled
                                </span>
                              ) : stepCount >= 5 ? (
                                <span className="text-amber-500 flex items-center gap-1 animate-pulse">
                                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> Transferring
                                </span>
                              ) : (
                                <span className="text-slate-400">Pending</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center space-y-4 animate-in zoom-in-95 duration-400">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/5">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${textHeading}`}>Payroll Disbursed!</h4>
                      <p className="text-[10px] text-slate-500">The Bank Settlement Agent completed the batch IMPS settlement run.</p>
                    </div>

                    <div className={`max-w-xs mx-auto p-4 border rounded-sm text-left space-y-3 shadow-md ${bgItem}`}>
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider pb-1.5 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'}`}>
                        <Landmark className="w-4 h-4 text-emerald-500" />
                        <span>Execution Receipt</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px]">
                        <div>
                          <span className="text-slate-500 block font-semibold">Total Sent</span>
                          <span className="text-emerald-500 font-bold block mt-0.5">₹18,42,000</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold">Audited Status</span>
                          <span className={`font-bold block mt-0.5 ${textHeading}`}>TDS Filed</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold">Settlements</span>
                          <span className={`font-bold block mt-0.5 ${textHeading}`}>15 Accounts</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block font-semibold">Batch Code</span>
                          <span className={`font-mono text-[9px] block mt-0.5 ${textHeading}`}>PTY-9284-EN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. ONBOARDING SIMULATOR */}
            {selectedPromptIdx === 2 && (
              <div className="space-y-4">
                {!showResult ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-800'}`}>Employee Onboarding Pipeline</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded text-purple-400 bg-purple-500/10 animate-pulse">
                        Syncing HRMS...
                      </span>
                    </div>

                    <div className={`p-4 border rounded-sm space-y-2.5 ${isDark ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">1. Sync employee data structures</span>
                        {stepCount >= 2 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3.5]" />
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">2. Generate security NDA packet</span>
                        {stepCount >= 4 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3.5]" />
                        ) : stepCount >= 2 ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-800 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">3. Provision B2linq email login</span>
                        {stepCount >= 6 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3.5]" />
                        ) : stepCount >= 4 ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-slate-800 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center space-y-4 animate-in zoom-in-95 duration-400">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/5">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${textHeading}`}>David Miller Onboarded!</h4>
                      <p className="text-[10px] text-slate-500">The Onboarding Coordinator completed credentials provisioning and NDA dispatch.</p>
                    </div>

                    <div className={`max-w-xs mx-auto p-4 border rounded-sm text-left flex items-start gap-3 shadow-md relative overflow-hidden ${bgItem}`}>
                      <div className="absolute top-0 right-0 bg-purple-500/10 text-purple-550 border-l border-b border-slate-200 dark:border-slate-850 text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        EMP Active
                      </div>
                      <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/25 font-bold shrink-0 mt-0.5 text-xs">
                        DM
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className={`text-xs font-bold block truncate ${textHeading}`}>David Miller</span>
                        <span className="text-[9.5px] text-slate-400 font-semibold block truncate animate-pulse">Senior FE Engineer</span>
                        <span className="text-[9.5px] text-[#8c74f5] font-mono block truncate">dmiller@b2linq.com</span>
                        <span className="text-[8.5px] text-slate-500 block pt-1 uppercase font-bold tracking-wider">ID: EMP-2940</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MORE AUTONOMOUS TASKS BOXES */}
            {selectedPromptIdx === 3 && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                <div className={`flex items-center justify-between border-b pb-2 mb-1 ${borderSep}`}>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-slate-350' : 'text-slate-850'}`}>Cooperative Agent OS Stack</h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded text-indigo-400 bg-indigo-500/10">
                    Background Daemons
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[260px] overflow-y-auto no-scrollbar pr-0.5">
                  {/* Card 1: Hiring/Sourcing */}
                  <div className={`p-3 border rounded-sm flex items-start gap-2.5 shadow-sm transition-all duration-300 ${bgItem}`}>
                    <div className="w-8 h-8 rounded-sm bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold truncate ${textHeading}`}>Talent Sourcing & Screen Agent</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[9px] text-slate-450 mt-0.5 leading-relaxed">
                        Actively filters resume repositories, maps professional metrics, and orchestrates live custom technical assessments.
                      </p>
                    </div>
                  </div>

                  {/* Card 2: HR Tool */}
                  <div className={`p-3 border rounded-sm flex items-start gap-2.5 shadow-sm transition-all duration-300 ${bgItem}`}>
                    <div className="w-8 h-8 rounded-sm bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0 mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold truncate ${textHeading}`}>HRMS & Attendance Sync Daemon</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                      <p className="text-[9px] text-slate-450 mt-0.5 leading-relaxed">
                        Coordinates self-service check-ins, tracks employee leaves, and registers manager sign-offs in real-time.
                      </p>
                    </div>
                  </div>

                  {/* Card 3: HR Management */}
                  <div className={`p-3 border rounded-sm flex items-start gap-2.5 shadow-sm transition-all duration-300 ${bgItem}`}>
                    <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold truncate ${textHeading}`}>HR Management & Security Auditor</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-[9px] text-slate-455 mt-0.5 leading-relaxed">
                        Audits ledger transactions, aligns multi-tenant scope definitions, and regulates GDPR/compliance access control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Footer stats / helper */}
          <div className={`border-t pt-3 mt-4 shrink-0 flex justify-between items-center text-[9px] font-semibold ${borderSep} ${textMuted}`}>
            <span>Security context: organization_scope_active</span>
            <span>B2linq Platform API v2.4</span>
          </div>

        </div>

        {/* RIGHT SIDE: CHAT CONSOLE AND CLI LOGS (5 cols) */}
        <div className={`lg:col-span-5 border rounded-sm p-4 min-h-[380px] max-h-[380px] overflow-hidden shadow-inner relative flex flex-col justify-between transition-colors duration-500 ${bgConsole}`}>
          
          {/* Chat logs area */}
          <div ref={chatContainerRef} className="space-y-4 overflow-y-auto pr-1 flex-1 no-scrollbar text-xs">
            
            {/* User message block */}
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-sm bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold shrink-0 text-[10px]">
                U
              </div>
              <div className={`flex-1 border rounded-sm p-3 font-medium ${bgItem} ${textBody}`}>
                {inputValue}
              </div>
            </div>

            {/* Agent Thought block */}
            {currentThought && (
              <div className="flex gap-2.5 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-7 h-7 rounded-sm bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5 animate-pulse">
                    <span>{agentName}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
                  </div>
                  <div className={`border rounded-sm p-3 italic font-medium leading-relaxed ${bgItem} ${textBody}`}>
                    "{currentThought}"
                  </div>
                </div>
              </div>
            )}

            {/* Simulated log line inputs */}
            {visibleLogs.length > 0 && (
              <div className="flex gap-2.5 items-start animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-sm bg-slate-900/10 border border-slate-700/20 flex items-center justify-center text-slate-500 shrink-0">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <div className={`flex-1 border rounded-sm p-3 font-mono text-[10px] space-y-1.5 ${bgItem} ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {visibleLogs.map((logItem, idx) => (
                    <div key={idx} className={
                      logItem?.type === 'success' ? 'text-emerald-500 font-semibold' :
                      logItem?.type === 'warning' ? 'text-amber-500 font-medium' : isDark ? 'text-slate-400' : 'text-slate-600'
                    }>
                      {logItem?.log}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-center gap-1 text-indigo-500 font-semibold mt-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Agent working...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Typing Area (Input text display) */}
          <div className={`border-t pt-3 mt-3 flex items-center gap-2 relative ${borderSep}`}>
            <input
              type="text"
              readOnly
              value={inputValue}
              className={`flex-1 h-10 px-4 border rounded-sm text-xs focus:outline-none placeholder:text-slate-600 font-medium select-none ${bgInput}`}
            />
            <button
              onClick={() => startSimulation(selectedPromptIdx)}
              disabled={isProcessing}
              className="w-10 h-10 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
