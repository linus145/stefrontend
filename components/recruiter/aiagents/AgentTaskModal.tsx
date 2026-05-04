'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, CheckCircle2, ArrowRight, X, Briefcase, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiAgentService } from '@/services/ai-agents.service';

interface AgentTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

export function AgentTaskModal({ isOpen, onClose, candidateName }: AgentTaskModalProps) {
  const [taskType, setTaskType] = useState<'post_job' | 'schedule_interview' | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!taskType) return;
    
    setStatus('running');
    try {
      const data = await aiAgentService.executeTask({
        task_type: taskType,
        payload: { candidate_name: candidateName, title: 'Senior Developer' }
      });
      
      setResult(data);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const resetState = () => {
    setTaskType(null);
    setStatus('idle');
    setResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#F5F3FF] to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-[#7C3AED]/10">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Agentic Task</h2>
              <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">AI Copilot Execution</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-slate-600">
                Select an autonomous task for the AI to perform {candidateName ? `for ${candidateName}` : 'in the background'}.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setTaskType('post_job')}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    taskType === 'post_job' 
                      ? "border-[#7C3AED] bg-[#F5F3FF]" 
                      : "border-slate-100 bg-white hover:border-[#7C3AED]/30 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    taskType === 'post_job' ? "bg-[#7C3AED] text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Auto-Post Job Listing</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      AI agent will optimize the JD and publish to 3+ major job boards automatically.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setTaskType('schedule_interview')}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    taskType === 'schedule_interview' 
                      ? "border-[#7C3AED] bg-[#F5F3FF]" 
                      : "border-slate-100 bg-white hover:border-[#7C3AED]/30 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    taskType === 'schedule_interview' ? "bg-[#7C3AED] text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Schedule Interview</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Agent will draft and send an email proposing times based on your calendar.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleExecute}
                  disabled={!taskType}
                  className="flex items-center gap-2 px-6 py-3 bg-[#7C3AED] text-white text-sm font-bold rounded-xl hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#7C3AED]/20"
                >
                  Run Agent <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {status === 'running' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#F5F3FF] border-t-[#7C3AED] animate-spin" />
                <Bot className="w-6 h-6 text-[#7C3AED] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Agent is working...</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Executing autonomous task securely.</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Task Completed</h3>
              <p className="text-sm text-slate-600 font-medium px-4">
                {result?.message || "The AI agent has successfully completed the assigned task."}
              </p>
              
              {result?.details && (
                <div className="w-full mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}

              <button
                onClick={handleClose}
                className="mt-6 px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors w-full"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
