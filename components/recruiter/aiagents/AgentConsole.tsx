'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, Loader2, CheckCircle2, Play, MessageSquare, 
  Send, Sliders, ChevronRight, Terminal, HelpCircle, User, Zap, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentConsole() {
  const [mode, setMode] = useState<'ACT' | 'PLAN'>('ACT');
  const [selectedAgent, setSelectedAgent] = useState('recruitment-bot');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  
  // Chat state for PLAN mode
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { 
      sender: 'bot', 
      text: "Welcome to Plan Mode! 👋 I am your hiring strategy assistant. How can I help you plan your next campaign, draft interview questions, or plan candidate criteria today?" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  const agents = [
    {
      id: 'recruitment-bot',
      name: 'Recruitment Copilot',
      role: 'Sourcing & Screening',
      desc: 'Autonomously crawls candidate networks, indexes talent feeds, and ranks matching candidates.',
      color: 'bg-indigo-500',
    },
    {
      id: 'job-poster',
      name: 'Auto-Poster Agent',
      role: 'Job Distribution',
      desc: 'Optimizes job postings for SEO and instantly propagates them to integrated hiring platforms.',
      color: 'bg-emerald-500',
    },
    {
      id: 'comms-agent',
      name: 'Comms Coordinator',
      role: 'Scheduling & Outreach',
      desc: 'Coordinates calendars, fires email threads, and manages screening invitations automatically.',
      color: 'bg-amber-500',
    }
  ];

  // Simulated Agent Execution sequence
  const handleExecuteAgent = () => {
    setIsExecuting(true);
    setExecutionStep(0);
    setExecutionLogs([
      "Initializing AI Agent Execution Engine...",
      "Configuring neural matching criteria for selected role..."
    ]);

    const steps = [
      { text: "Scanning talent network and live feeds for matches...", delay: 1500 },
      { text: "Crawling connection profiles and compiling candidates...", delay: 3000 },
      { text: "Running LLM-based profile screening and evaluations...", delay: 4500 },
      { text: "Found 12 matching candidates with score > 85%!", delay: 6000 },
      { text: "Drafting auto-outreach notifications & scheduling links...", delay: 7500 },
      { text: "Outreach dispatched successfully! Invites sent out.", delay: 9000 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setExecutionStep(idx + 1);
        setExecutionLogs(prev => [...prev, step.text]);
        if (idx === steps.length - 1) {
          setIsExecuting(false);
        }
      }, step.delay);
    });
  };

  // Bot chat reply logic
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setIsBotTyping(true);

    // Simulated planning replies based on keywords
    setTimeout(() => {
      let botReply = "I have reviewed your request. Let's build a structured strategy for this: \n\n1. Target the top candidate networks with focused skills.\n2. Filter profiles by verified workspace experience.\n3. Trigger conversational pre-screening rounds to evaluate aptitudes automatically.\n\nWould you like me to generate specific interview rounds for this role?";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('react') || lower.includes('frontend') || lower.includes('developer') || lower.includes('engineer')) {
        botReply = "Here is a customized planning structure for a Senior Frontend role:\n\n• **Core Evaluation**: React hook architectures, Next.js hydration, and state managers.\n• **Interview Strategy**: Round 1 (Technical MCQ) → Round 2 (System Design) → Round 3 (Conversational HR Screening).\n• **Sourcing Targets**: Target profiles with 4+ years of active TypeScript/React project history.";
      } else if (lower.includes('interview') || lower.includes('questions') || lower.includes('test')) {
        botReply = "Certainly! Let's plan your pre-screening questions:\n\n1. *'Explain the optimization strategies you use to handle heavy state updates in high-volume applications.'*\n2. *'How do you approach server-side versus client-side rendering decisions?'*\n\nI can directly configure these inside the AI Interviews round selector for you!";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setIsBotTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-[#1A1D27] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col min-h-[560px] shadow-2xl">
      {/* Mode Control Header */}
      <div className="p-5 border-b border-slate-800/60 bg-[#151821] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>Agent Workspace Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Switch between autonomous agent executions and bot planning.</p>
        </div>

        {/* Tab Switcher - Pill Style */}
        <div className="flex bg-[#0F111A] p-1 rounded-xl border border-slate-800/80 w-fit shrink-0">
          <button
            onClick={() => setMode('ACT')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              mode === 'ACT' 
                ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>ACT (Autonomous Agent)</span>
          </button>
          <button
            onClick={() => setMode('PLAN')}
            className={cn(
              "px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              mode === 'PLAN' 
                ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>PLAN (Conversational Bot)</span>
          </button>
        </div>
      </div>

      {/* ACT Mode Workspace */}
      {mode === 'ACT' && (
        <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
          {/* Controls Side */}
          <div className="flex-1 space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Select Agent to Deploy</label>
              <div className="grid grid-cols-1 gap-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => !isExecuting && setSelectedAgent(agent.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left w-full disabled:opacity-50",
                      selectedAgent === agent.id 
                        ? "border-indigo-500/80 bg-indigo-500/[0.03]" 
                        : "border-slate-800 bg-[#13151D] hover:border-slate-700"
                    )}
                    disabled={isExecuting}
                  >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md", agent.color)}>
                      {agent.id === 'recruitment-bot' && <Bot className="w-5 h-5" />}
                      {agent.id === 'job-poster' && <Sliders className="w-5 h-5" />}
                      {agent.id === 'comms-agent' && <Mail className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {agent.name}
                        {selectedAgent === agent.id && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded">Selected</span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{agent.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Sliders */}
            <div className="bg-[#13151D] border border-slate-800/60 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Agent Hyperparameters</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1.5">
                    <span>Target Match Threshold</span>
                    <span className="text-indigo-400">85%</span>
                  </div>
                  <input type="range" min="70" max="95" defaultValue="85" disabled={isExecuting} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-semibold mb-1.5">
                    <span>Max Crawling Depth</span>
                    <span className="text-indigo-400">3rd Connections</span>
                  </div>
                  <input type="range" min="1" max="3" defaultValue="3" disabled={isExecuting} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Console Execution Side */}
          <div className="w-full lg:w-[380px] bg-[#0C0E14] border border-slate-800/80 rounded-xl flex flex-col overflow-hidden min-h-[300px]">
            {/* Header */}
            <div className="bg-[#11131C] px-4 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-300 font-mono">autonomous-terminal.sh</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
            </div>

            {/* Display Logs */}
            <div className="flex-1 p-4 font-mono text-[10px] text-slate-300 space-y-2 overflow-y-auto custom-scrollbar flex flex-col justify-end min-h-[220px]">
              {executionLogs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-10 space-y-3 font-sans">
                  <Bot className="w-10 h-10 text-slate-700 animate-bounce" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-400">Agent Dormant</h5>
                    <p className="text-[10px] mt-0.5">Click the execute button to deploy autonomous cycles.</p>
                  </div>
                </div>
              ) : (
                executionLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start animate-in fade-in duration-200">
                    <span className="text-indigo-400 select-none shrink-0">&gt;</span>
                    <span className={cn(idx === executionLogs.length - 1 ? "text-emerald-400 font-bold" : "text-slate-300")}>{log}</span>
                  </div>
                ))
              )}
              {isExecuting && (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse mt-3 font-sans font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent executing step {executionStep}/6...</span>
                </div>
              )}
            </div>

            {/* Action footer */}
            <div className="p-3 bg-[#11131C] border-t border-slate-800/80 shrink-0">
              <button
                onClick={handleExecuteAgent}
                disabled={isExecuting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-md shadow-indigo-600/10"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Task Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Trigger Autonomous Cycle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN Mode Workspace (Conversational Bot) */}
      {mode === 'PLAN' && (
        <div className="flex-1 p-6 flex flex-col h-[480px] animate-in fade-in duration-300">
          {/* Chat box */}
          <div className="flex-1 bg-[#10121A] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col mb-4">
            {/* Thread List */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-200",
                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm",
                    msg.sender === 'user' 
                      ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400" 
                      : "bg-[#1A1D27] border-slate-800 text-slate-300"
                  )}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "p-3.5 rounded-xl text-xs leading-relaxed",
                    msg.sender === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-[#1A1D27] text-slate-200 border border-slate-800/50 rounded-tl-none whitespace-pre-wrap"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isBotTyping && (
                <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1D27] border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  </div>
                  <div className="bg-[#1A1D27] text-slate-400 border border-slate-800/50 p-3 rounded-xl rounded-tl-none text-xs font-medium">
                    Planning bot is formulating strategy...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Prompt Input Form */}
          <div className="flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="e.g. Plan a sourcing strategy for a Senior Node developer..."
              disabled={isBotTyping}
              className="flex-1 bg-[#10121A] border border-slate-800/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={isBotTyping || !inputMessage.trim()}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/10 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
