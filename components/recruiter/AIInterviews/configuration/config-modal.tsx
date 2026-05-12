'use client';

import React, { useState } from 'react';
import { 
  X, Plus, Trash2, BrainCircuit, Timer, 
  Settings2, ChevronRight, CheckCircle2, 
  Code2, Users2, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import { useQuery } from '@tanstack/react-query';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type RoundType = 'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'SYSTEM_DESIGN';

interface RoundConfig {
  id: string;
  type: RoundType;
  difficulty: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  max_questions: number;
  timer_seconds: number;
}

export function InterviewConfigModal({ isOpen, onClose, onSuccess }: ConfigModalProps) {
  const [step, setStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rounds, setRounds] = useState<RoundConfig[]>([
    { id: '1', type: 'TECHNICAL', difficulty: 'MID', max_questions: 5, timer_seconds: 600 }
  ]);

  // Fetch recruiter's jobs
  const { data: jobsResponse, isLoading: jobsLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => jobsService.getMyJobs('active'),
    enabled: isOpen
  });

  // Fetch applications for selected job
  const { data: appsResponse, isLoading: appsLoading } = useQuery({
    queryKey: ['job-applications', selectedJobId],
    queryFn: () => jobsService.getJobApplications(selectedJobId),
    enabled: !!selectedJobId && isOpen
  });

  const jobs = jobsResponse?.data || [];
  const applications = appsResponse?.data || [];

  const addRound = () => {
    const newRound: RoundConfig = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'TECHNICAL',
      difficulty: 'MID',
      max_questions: 5,
      timer_seconds: 600
    };
    setRounds([...rounds, newRound]);
  };

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter(r => r.id !== id));
    }
  };

  const updateRound = (id: string, updates: Partial<RoundConfig>) => {
    setRounds(rounds.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleConfigure = async () => {
    if (selectedApplicationIds.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Orchestrate for each selected candidate
      const promises = selectedApplicationIds.map(appId => 
        aiInterviewsService.configureInterview({
          job_application_id: appId,
          rounds: rounds.map(({ type, difficulty, max_questions, timer_seconds }) => ({
            type, difficulty, max_questions, timer_seconds
          }))
        })
      );

      await Promise.all(promises);
      toast.success(`Interviews orchestrated for ${selectedApplicationIds.length} candidate(s)!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to orchestrate interviews.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-card border border-border rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Settings2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Orchestrate AI Interview</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-70">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-sm hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Job Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      Select Job Position
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {jobsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-14 bg-muted animate-pulse rounded-sm" />
                        ))
                      ) : jobs.length > 0 ? (
                        jobs.map((job: any) => (
                          <button
                            key={job.id}
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setSelectedApplicationIds([]);
                            }}
                            className={cn(
                              "w-full p-4 rounded-sm border text-left transition-all flex items-center justify-between group",
                              selectedJobId === job.id 
                                ? "bg-blue-500/5 border-blue-500 text-blue-500" 
                                : "bg-background border-border hover:border-blue-500/30"
                            )}
                          >
                            <span className="text-sm font-semibold">{job.title}</span>
                            {selectedJobId === job.id && <CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" />}
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No active jobs found.</p>
                      )}
                    </div>
                  </div>

                  {/* Candidate Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      <Users2 className="w-4 h-4" />
                      Select Candidates
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {!selectedJobId ? (
                         <div className="flex flex-col items-center justify-center h-40 border border-dashed border-border rounded-sm opacity-50">
                            <Users2 className="w-8 h-8 mb-2" />
                            <p className="text-xs font-medium">Select a job first</p>
                         </div>
                      ) : appsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-14 bg-muted animate-pulse rounded-sm" />
                        ))
                      ) : applications.length > 0 ? (
                        applications.map((app: any) => (
                          <label
                            key={app.id}
                            className={cn(
                              "w-full p-4 rounded-sm border cursor-pointer transition-all flex items-center gap-3",
                              selectedApplicationIds.includes(app.id)
                                ? "bg-emerald-500/5 border-emerald-500 text-emerald-500"
                                : "bg-background border-border hover:border-emerald-500/30"
                            )}
                          >
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={selectedApplicationIds.includes(app.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedApplicationIds([...selectedApplicationIds, app.id]);
                                else setSelectedApplicationIds(selectedApplicationIds.filter(id => id !== app.id));
                              }}
                            />
                            <div className={cn(
                              "w-4 h-4 rounded-sm border flex items-center justify-center transition-all",
                              selectedApplicationIds.includes(app.id) ? "bg-emerald-500 border-emerald-500" : "bg-muted border-border"
                            )}>
                              {selectedApplicationIds.includes(app.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-semibold">{app.user_name}</p>
                               <p className="text-[10px] opacity-70">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No applications found for this job.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <BrainCircuit className="w-4 h-4" />
                    Interview Rounds Configuration
                  </div>
                  <button 
                    onClick={addRound}
                    className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Round
                  </button>
                </div>

                <div className="space-y-4">
                  {rounds.map((round, index) => (
                    <motion.div 
                      key={round.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-sm border border-border bg-muted/20 space-y-4 relative group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Round Type</label>
                          <select 
                            value={round.type}
                            onChange={(e) => updateRound(round.id, { type: e.target.value as RoundType })}
                            className="w-full bg-background border border-border rounded-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="TECHNICAL">Technical Interview</option>
                            <option value="CODING">Live Coding Session</option>
                            <option value="HR">HR / Cultural Round</option>
                            <option value="SYSTEM_DESIGN">System Design</option>
                            <option value="BEHAVIORAL">Behavioral / EQ</option>
                          </select>
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Difficulty</label>
                          <select 
                            value={round.difficulty}
                            onChange={(e) => updateRound(round.id, { difficulty: e.target.value as any })}
                            className="w-full bg-background border border-border rounded-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="ENTRY">Entry Level</option>
                            <option value="MID">Mid Level</option>
                            <option value="SENIOR">Senior Level</option>
                            <option value="LEAD">Lead / Architect</option>
                          </select>
                        </div>

                        <div className="w-32 space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Questions</label>
                          <input 
                            type="number"
                            value={round.max_questions}
                            onChange={(e) => updateRound(round.id, { max_questions: parseInt(e.target.value) })}
                            className="w-full bg-background border border-border rounded-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="w-32 space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timer (Sec)</label>
                          <input 
                            type="number"
                            value={round.timer_seconds}
                            onChange={(e) => updateRound(round.id, { timer_seconds: parseInt(e.target.value) })}
                            className="w-full bg-background border border-border rounded-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {rounds.length > 1 && (
                          <button 
                            onClick={() => removeRound(round.id)}
                            className="mt-6 p-2 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between">
          <button 
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="px-6 py-2.5 rounded-sm border border-border text-sm font-semibold hover:bg-muted transition-all active:scale-95"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={() => step === 1 ? setStep(2) : handleConfigure()}
            disabled={(step === 1 && (!selectedJobId || selectedApplicationIds.length === 0)) || isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 rounded-sm bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Next: Configure Rounds' : 'Orchestrate & Send Invites'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
