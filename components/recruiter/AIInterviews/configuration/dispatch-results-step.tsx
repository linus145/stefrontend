'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DispatchResultsStepProps {
  orchestrationResults: any[];
  onBack?: () => void;
}

export function DispatchResultsStep({
  orchestrationResults,
  onBack
}: DispatchResultsStepProps) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">✓</div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Orchestration Complete</h2>
        <p className="text-sm text-muted-foreground">The AI agents have been dispatched. Candidate invitations are active.</p>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Invite Links</p>
        </div>
        <div className="divide-y divide-border">
          {orchestrationResults.map((result) => (
            <div key={result.appId} className="px-6 py-5 space-y-3 group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{result.candidateName}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[400px]">{result.inviteLink}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.inviteLink);
                    toast.success('Invite link copied');
                  }}
                  className="px-4 py-2 rounded-sm bg-muted border border-border text-[10px] font-bold hover:bg-[#0a66c2] hover:text-white transition-all active:scale-95 whitespace-nowrap"
                >
                  Copy Invite
                </button>
              </div>
              {result.examUrl && (
                <div className="flex items-center justify-between gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-sm px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-emerald-600">Active Exam Link</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[350px]">{result.examUrl}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.examUrl);
                      toast.success('Exam link copied');
                    }}
                    className="px-4 py-2 rounded-sm bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition-all active:scale-95 whitespace-nowrap"
                  >
                    Copy Exam Link
                  </button>
                </div>
              )}
              {result.examCredentials && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-sm px-4 py-3">
                  <p className="text-[10px] font-bold text-amber-600 mb-2">Exam Credentials</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between group/cred bg-black/5 p-2 rounded-sm border border-amber-600/10">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Username</p>
                        <p className="text-xs font-mono font-bold mt-0.5">{result.examCredentials.username}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(result.examCredentials.username);
                          toast.success('Username copied');
                        }}
                        className="p-1.5 rounded-sm hover:bg-amber-600/10 text-amber-600 transition-all"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between group/cred bg-black/5 p-2 rounded-sm border border-amber-600/10">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Password</p>
                        <p className="text-xs font-mono font-bold mt-0.5">{result.examCredentials.password}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(result.examCredentials.password);
                          toast.success('Password copied');
                        }}
                        className="p-1.5 rounded-sm hover:bg-amber-600/10 text-amber-600 transition-all"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            data-agent="return-to-pipeline-button"
            className="px-12 py-4 rounded-sm bg-[#0a66c2] text-white font-bold text-sm shadow-xl shadow-[#0a66c2]/20 hover:bg-[#004182] transition-all active:scale-95"
          >
            Return to Pipeline
          </button>
          <a
            href="/interview/exam"
            target="_blank"
            data-agent="open-exam-portal-button"
            className="px-8 py-4 rounded-sm border border-border text-sm font-bold hover:bg-muted transition-all active:scale-95"
          >
            Open Exam Portal →
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground font-medium italic">Candidates have also been notified via their registered email.</p>
      </div>
    </motion.div>
  );
}
