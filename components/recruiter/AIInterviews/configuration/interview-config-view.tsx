'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, BrainCircuit } from 'lucide-react';

type RoundType = 'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'SYSTEM_DESIGN';

interface RoundConfig {
  id: string;
  title: string;
  type: RoundType;
  difficulty: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  round_category: 'CODING' | 'NON_CODING';
  question_format: string;
  programming_language: string;
  max_questions: number;
  timer_seconds: number;
  questions?: { text: string; marks: number; ideal_answer?: string }[];
}

interface InterviewConfigViewProps {
  initialApplicationId?: string;
  initialSessionId?: string;
  onBack?: () => void;
}

// Fallback constants in case metadata query is still loading
const DEFAULT_ROUNDS = [{ label: "Technical Screening", value: "TECHNICAL_SCREENING" }];
const DEFAULT_TIERS = [{ label: "Technical Screen", value: "TECHNICAL" }];
const DEFAULT_LEVELS = [{ label: "Mid Level", value: "MID" }];
const DEFAULT_CATEGORIES = [{ label: "Non-Coding", value: "NON_CODING" }, { label: "Coding", value: "CODING" }];
const DEFAULT_FORMATS = [{ label: "Text / Typing Answer", value: "TEXT" }];
const DEFAULT_LANGS = [{ label: "Python", value: "PYTHON" }];

export function InterviewConfigView({ initialApplicationId, initialSessionId, onBack }: InterviewConfigViewProps) {
  const [step, setStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rounds, setRounds] = useState<RoundConfig[]>([
    { id: '1', title: 'TECHNICAL_SCREENING', type: 'TECHNICAL', difficulty: 'MID', round_category: 'NON_CODING', question_format: 'TEXT', programming_language: '', max_questions: 5, timer_seconds: 600, questions: [] }
  ]);

  // Fetch recruiter's jobs
  const { data: jobsResponse, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => jobsService.getMyJobs(),
  });

  const jobs = jobsResponse?.data || [];

  // Fetch pipeline sessions to sync data
  const { data: sessionsResponse, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['ai-interview-sessions'],
    queryFn: aiInterviewsService.getSessions
  });

  const pipelineSessions = sessionsResponse?.data || [];
  const activeJobIds = new Set(pipelineSessions.map((s: any) => s.job_id));
  const filteredJobs = jobs.filter((j: any) => activeJobIds.has(j.id));

  // Fetch applications for selected job - only those in INTERVIEW status
  const { data: appsResponse, isLoading: appsLoading } = useQuery({
    queryKey: ['job-applications', selectedJobId, 'INTERVIEW'],
    queryFn: () => jobsService.getJobApplications(selectedJobId, 'INTERVIEW'),
    enabled: !!selectedJobId
  });

  // Fetch interview metadata (designations, tiers, levels)
  const { data: metadataResponse } = useQuery({
    queryKey: ['interview-metadata'],
    queryFn: aiInterviewsService.getMetadata
  });

  const metadata = metadataResponse?.data || {
    designations: DEFAULT_ROUNDS,
    strategy_tiers: DEFAULT_TIERS,
    difficulty_levels: DEFAULT_LEVELS,
    question_formats: DEFAULT_FORMATS,
    programming_languages: DEFAULT_LANGS
  };

  const applications = appsResponse?.data || [];

  // Auto-select initial application if provided
  React.useEffect(() => {
    const init = async () => {
      if (initialApplicationId && jobs.length > 0) {
        try {
          // Fetch application detail to get jobId
          const response = await jobsService.getApplicationDetail(initialApplicationId);
          if (response.data && response.data.job) {
            const jobId = typeof response.data.job === 'object' ? (response.data.job as any).id : response.data.job;
            setSelectedJobId(jobId);

            // The applications for this job will be fetched by the useQuery
            // Once they are fetched, we will select the candidate in the next render cycle or below
          }
        } catch (error) {
          console.error("Failed to fetch application detail:", error);
        }
      }
    };
    init();
  }, [initialApplicationId, jobs.length]);

  // Handle selecting the candidate once applications are loaded
  React.useEffect(() => {
    if (initialApplicationId && applications.length > 0) {
      if (applications.find((a: any) => a.id === initialApplicationId)) {
        if (!selectedApplicationIds.includes(initialApplicationId)) {
          setSelectedApplicationIds([initialApplicationId]);
        }
      }
    }
  }, [initialApplicationId, applications]);

  // If reconfiguring an existing session, fetch its data and jump to step 2
  React.useEffect(() => {
    if (!initialSessionId) return;
    const loadSession = async () => {
      try {
        const res = await aiInterviewsService.getSessionDetail(initialSessionId);
        if (res.status === 'success' && res.data) {
          const detail = res.data;
          // Pre-fill rounds from existing session
          if (detail.rounds && detail.rounds.length > 0) {
            setRounds(detail.rounds.map((rnd: any, idx: number) => ({
              id: rnd.id || String(idx + 1),
              title: rnd.designation || 'TECHNICAL_SCREENING',
              type: (rnd.strategy_tier || 'TECHNICAL') as RoundType,
              difficulty: rnd.difficulty || 'MID',
              round_category: rnd.round_category || 'NON_CODING',
              question_format: rnd.question_format || 'TEXT',
              programming_language: rnd.programming_language || '',
              max_questions: rnd.max_questions || 5,
              timer_seconds: rnd.timer_seconds || 600,
              questions: rnd.questions?.map((q: any) => ({ 
                text: q.question_text || q.text || q, 
                marks: q.marks || 10,
                ideal_answer: q.ideal_answer 
              })) || [],
            })));
          }
          // Auto-select the candidate if we have it from initialApplicationId
          if (initialApplicationId) {
            setSelectedApplicationIds([initialApplicationId]);
          }
          // Jump directly to Architecture step
          setStep(2);
        }
      } catch {
        // If session load fails, stay on step 1 (fresh flow)
      }
    };
    loadSession();
  }, [initialSessionId]);

  const addRound = () => {
    const newRound: RoundConfig = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      type: 'TECHNICAL',
      difficulty: 'MID',
      round_category: 'NON_CODING',
      question_format: 'TEXT',
      programming_language: '',
      max_questions: 5,
      timer_seconds: 600,
      questions: []
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

  const handleGenerateQuestions = async (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round || selectedApplicationIds.length === 0) {
      toast.error("Please select a candidate first to generate tailored questions.");
      return;
    }

    if (!round.title) {
      toast.error("Please select a Round Designation first.");
      return;
    }

    const toastId = toast.loading("AI is analyzing resume and architecting questions...");
    setIsGenerating(true);

    try {
      const response = await aiInterviewsService.generateQuestions({
        application_id: selectedApplicationIds[0],
        type: round.type,
        designation: round.title,
        difficulty: round.difficulty,
        round_category: round.round_category,
        question_format: round.question_format,
        programming_language: round.programming_language,
        count: round.max_questions
      });

      if (response.status === 'success' && response.data?.task_id) {
        const taskId = response.data.task_id;
        let attempts = 0;
        const maxAttempts = 30; // Max 60 seconds polling

        while (attempts < maxAttempts) {
          attempts++;
          // Wait 2 seconds between polls
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const statusResponse = await aiInterviewsService.checkTaskStatus(taskId);
          const taskData = statusResponse.data;

          if (taskData?.status === 'SUCCESS' && taskData?.questions?.length > 0) {
            updateRound(roundId, {
              questions: taskData.questions.map((q: any) => ({
                text: typeof q === 'object' ? q.question : q,
                ideal_answer: typeof q === 'object' ? q.ideal_answer : undefined,
                marks: 10
              }))
            });
            toast.success(`AI generated ${taskData.questions.length} questions.`, { id: toastId });
            return;
          } 
          
          if (taskData?.status === 'FAILURE' || statusResponse.status === 'error') {
            toast.error(statusResponse.message || "AI failed to generate questions.", { id: toastId });
            return;
          }
        }
        
        toast.error("Question generation timed out. Please try again.", { id: toastId });
      } else if (response.status === 'success' && response.data?.questions?.length > 0) {
        // Fallback for synchronous response
        updateRound(roundId, {
          questions: response.data.questions.map((q: any) => ({
            text: typeof q === 'object' ? q.question : q,
            ideal_answer: typeof q === 'object' ? q.ideal_answer : undefined,
            marks: 10
          }))
        });
        toast.success(`AI generated ${response.data.questions.length} questions.`, { id: toastId });
      } else if (response.status === 'error') {
        toast.error(response.message || "AI failed to generate questions.", { id: toastId });
      } else {
        toast.error("AI returned no questions. Try adjusting settings.", { id: toastId });
      }
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "AI engine encountered an error. Check your API key.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const [orchestrationResults, setOrchestrationResults] = useState<any[]>([]);

  const handleConfigure = async () => {
    if (selectedApplicationIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const results = [];
      for (const appId of selectedApplicationIds) {
        const response = await aiInterviewsService.configureInterview({
          job_application_id: appId,
          rounds: rounds.map(({ title, type, difficulty, round_category, question_format, programming_language, max_questions, timer_seconds, questions }) => ({
            title,
            type,
            difficulty,
            round_category,
            question_format,
            programming_language,
            max_questions,
            timer_seconds,
            questions: questions?.map(q => ({
              text: q.text,
              marks: q.marks,
              ideal_answer: q.ideal_answer
            })) || []
          }))
        });

        if (response.status === 'success') {
          const app = applications.find((a: any) => a.id === appId);
          results.push({
            appId,
            candidateName: app ? `${app.applicant.first_name} ${app.applicant.last_name}` : 'Candidate',
            inviteLink: `${window.location.origin}/interview/start/${response.data.invite_token}`,
            examUrl: response.data.exam_url || '',
            examToken: response.data.exam_token || '',
            examCredentials: response.data.exam_credentials || null,
          });
        }
      }

      setOrchestrationResults(results);
      toast.success(`Interviews orchestrated for ${results.length} candidate(s)!`);
      setStep(3);
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to orchestrate interviews.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-border pb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Configuration Workspace</h1>
          <p className="text-sm font-medium text-blue-600 mt-2 opacity-80">Architect multi-round AI agents and security protocols</p>
        </div>

        <div className="flex items-center gap-12">
          {[
            { n: 1, label: 'Candidates' },
            { n: 2, label: 'Architecture' },
            { n: 3, label: 'Dispatch' }
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => step > s.n && setStep(s.n)}
              disabled={step <= s.n && step !== s.n}
              className={cn(
                "flex items-center gap-3 transition-all relative group",
                step === s.n ? "opacity-100" : "opacity-40 hover:opacity-100"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all",
                step === s.n ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "border-border"
              )}>
                {s.n}
              </span>
              <span className="text-[13px] font-semibold tracking-tight">{s.label}</span>
              {step === s.n && (
                <motion.div
                  layoutId="activeStep"
                  className="absolute -bottom-10 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="px-6 py-2 rounded-sm border border-border text-xs font-semibold hover:bg-muted transition-all"
        >
          Back to Pipeline
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Left: Job Selection */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Targeted Position</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(jobsLoading || sessionsLoading) ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
                    ))
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job: any) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setSelectedApplicationIds([]);
                        }}
                        className={cn(
                          "p-6 rounded-sm border text-left transition-all hover:shadow-lg relative overflow-hidden group",
                          selectedJobId === job.id
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/10"
                            : "bg-card border-border hover:border-blue-600/30"
                        )}
                      >
                        <div className="relative z-10">
                          <p className={cn("text-[13px] font-bold truncate", selectedJobId === job.id ? "text-white" : "text-foreground")}>{job.title}</p>
                          <p className={cn("text-[10px] mt-1 font-medium", selectedJobId === job.id ? "text-white/70" : "text-muted-foreground")}>{job.department || 'General'}</p>
                        </div>
                        {selectedJobId === job.id && <span className="text-[10px] font-bold border border-white/30 px-2 py-0.5 rounded-sm absolute top-3 right-3">Selected</span>}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-24 bg-muted/5 rounded-sm border border-dashed border-border flex flex-col items-center gap-6">
                      <p className="text-sm font-medium opacity-50">No positions found in your pipeline</p>
                      <button
                        onClick={() => {
                          refetchJobs();
                          refetchSessions();
                          toast.info("Pipeline synchronized with latest job data.");
                        }}
                        data-agent="sync-pipeline-button"
                        className="px-6 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                      >
                        Sync
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Summary */}
              <div className="bg-muted/10 border border-border rounded-sm p-8 space-y-8">
                <h4 className="text-xs font-semibold text-muted-foreground opacity-70">Workspace Summary</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium opacity-50 shrink-0">Target Job</span>
                    <span className="text-sm font-bold text-right" data-agent="target-job-title">{selectedJobId ? jobs.find(j => j.id === selectedJobId)?.title : 'Undefined'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-6">
                    <span className="text-xs font-medium opacity-50">Volume</span>
                    <span className="text-sm font-bold">{selectedApplicationIds.length} Candidates</span>
                  </div>
                  <button
                    disabled={!selectedJobId || selectedApplicationIds.length === 0}
                    onClick={() => setStep(2)}
                    data-agent="proceed-to-architecture-button"
                    className="w-full mt-6 bg-blue-600 text-white py-4 rounded-sm font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                  >
                    Proceed to Architecture
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Candidate Grid */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Candidate Pipeline</h3>
                {selectedJobId && applications.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedApplicationIds.length === applications.length) setSelectedApplicationIds([]);
                      else setSelectedApplicationIds(applications.map(a => a.id));
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:opacity-70 transition-opacity"
                  >
                    {selectedApplicationIds.length === applications.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              <div className="min-h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 bg-muted animate-pulse rounded-sm" />
                    ))
                  ) : applications.length > 0 ? (
                    applications.map((app: any) => (
                      <label
                        key={app.id}
                        data-agent="candidate-card"
                        data-candidate-name={`${app.applicant.first_name} ${app.applicant.last_name}`}
                        className={cn(
                          "relative group p-6 rounded-sm border cursor-pointer transition-all hover:shadow-lg",
                          selectedApplicationIds.includes(app.id)
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/10"
                            : "bg-card border-border hover:border-blue-600/30"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedApplicationIds.includes(app.id)}
                          data-agent="candidate-selection-checkbox"
                          onChange={() => {
                            if (selectedApplicationIds.includes(app.id)) {
                              setSelectedApplicationIds(selectedApplicationIds.filter(id => id !== app.id));
                            } else {
                              setSelectedApplicationIds([...selectedApplicationIds, app.id]);
                            }
                          }}
                        />
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                              selectedApplicationIds.includes(app.id) ? "bg-white/20 border-white/40" : "bg-muted border-border"
                            )}>
                              {app.applicant.first_name[0]}{app.applicant.last_name[0]}
                            </div>
                            {selectedApplicationIds.includes(app.id) && (
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold truncate">{app.applicant.first_name} {app.applicant.last_name}</p>
                            <p className={cn("text-[10px] font-medium opacity-70 mt-1", selectedApplicationIds.includes(app.id) ? "text-white" : "text-muted-foreground")}>
                              {app.status || 'Applied'} • {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="col-span-full py-24 bg-muted/5 border border-dashed border-border rounded-sm flex flex-col items-center justify-center opacity-40">
                      <p className="text-[11px] font-bold tracking-widest uppercase">Awaiting Job Selection</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <div
            key="architecture"
            className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in duration-500 fill-mode-both"
          >
            {/* Left: Configuration Form */}
            <div className="flex-1 min-w-0 space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground opacity-70">Architecture</h3>
                <button
                  onClick={addRound}
                  data-agent="add-round-button"
                  className="px-4 py-2 rounded-sm border border-blue-600 text-blue-600 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  Add
                </button>
              </div>

              <div className="space-y-6">
                {rounds.map((round, index) => (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-sm border border-border bg-card shadow-sm hover:border-blue-600/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-bold px-3 py-1 bg-blue-600 text-white rounded-sm">#{index + 1}</span>
                      {rounds.length > 1 && (
                        <button
                          onClick={() => removeRound(round.id)}
                          className="text-[10px] font-bold text-rose-500 hover:opacity-70 transition-opacity"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[13px] font-semibold text-foreground">Round Designation (Name)</label>
                        <select
                          value={round.title}
                          onChange={(e) => updateRound(round.id, { title: e.target.value })}
                          data-agent={`round-designation-select-${index}`}
                          className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all appearance-none"
                        >
                          <option value="" disabled>Select Round Type</option>
                          {metadata.designations.map((r: any) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>


                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-foreground">Type</label>
                        <select
                          value={round.round_category}
                          onChange={(e) => updateRound(round.id, { round_category: e.target.value as any })}
                          data-agent={`round-category-select-${index}`}
                          className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all appearance-none"
                        >
                          {(metadata.round_categories || DEFAULT_CATEGORIES).map((c: any) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-foreground">Evaluation Depth</label>
                        <select
                          value={round.difficulty}
                          onChange={(e) => updateRound(round.id, { difficulty: e.target.value as any })}
                          data-agent={`evaluation-depth-select-${index}`}
                          className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all appearance-none"
                        >
                          {metadata.difficulty_levels.map((l: any) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-foreground">Question Format</label>
                        <select
                          value={round.question_format}
                          onChange={(e) => updateRound(round.id, { question_format: e.target.value })}
                          data-agent={`question-format-select-${index}`}
                          className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all appearance-none"
                        >
                          {metadata.question_formats.map((f: any) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>

                      {round.question_format === 'CODE' && (
                        <div className="space-y-2">
                          <label className="text-[13px] font-semibold text-foreground">Language <span className="text-[10px] opacity-50">(Optional)</span></label>
                          <select
                            value={round.programming_language}
                            onChange={(e) => updateRound(round.id, { programming_language: e.target.value })}
                            data-agent={`programming-language-select-${index}`}
                            className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all appearance-none"
                          >
                            <option value="">Auto-detect</option>
                            {metadata.programming_languages.map((l: any) => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-foreground">Question Count</label>
                        <input
                          type="number"
                          value={round.max_questions}
                          onChange={(e) => updateRound(round.id, { max_questions: parseInt(e.target.value) })}
                          data-agent={`question-count-input-${index}`}
                          className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-foreground">Allocated Time (Sec)</label>
                        <input
                          type="number"
                          value={round.timer_seconds}
                          onChange={(e) => updateRound(round.id, { timer_seconds: parseInt(e.target.value) })}
                          data-agent={`allocated-time-input-${index}`}
                          className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-[13px] font-semibold text-foreground">AI Question Configuration</label>
                            <p className="text-[10px] text-muted-foreground mt-1">AI will generate these based on candidate resume and job requirements.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-sm border border-border">
                              Total Marks: <span className="text-primary">{round.questions?.reduce((acc, q: any) => acc + (typeof q === 'string' ? 10 : (q.marks || 0)), 0) || 0}</span>
                            </span>
                            <button
                              onClick={() => {
                                const newQuestions = [...(round.questions || []), { text: '', marks: 10 }];
                                updateRound(round.id, { questions: newQuestions });
                              }}
                              data-agent={`add-question-button-${index}`}
                              className="px-4 py-1.5 rounded-sm border border-border bg-card text-[11px] font-bold hover:bg-muted transition-all"
                            >
                              + Add Question
                            </button>
                            <button
                              onClick={() => handleGenerateQuestions(round.id)}
                              data-agent={`generate-questions-ai-button-${index}`}
                              className="px-4 py-1.5 rounded-sm bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Generate with AI
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {round.questions?.length === 0 ? (
                            <div className="py-12 bg-muted/5 border border-dashed border-border rounded-sm flex flex-col items-center justify-center opacity-40">
                              <p className="text-[11px] font-bold tracking-widest uppercase">Awaiting AI Generation</p>
                            </div>
                          ) : (
                            round.questions?.map((q, idx) => (
                              <div key={idx} className="relative group flex gap-3 items-start">
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider opacity-60">Question</label>
                                    <textarea
                                      value={typeof q === 'string' ? q : q.text}
                                      onChange={(e) => {
                                        const newQuestions = [...(round.questions || [])] as any[];
                                        const current = newQuestions[idx];
                                        newQuestions[idx] = typeof current === 'string'
                                          ? { text: e.target.value, marks: 10 }
                                          : { ...current, text: e.target.value };
                                        updateRound(round.id, { questions: newQuestions });
                                      }}
                                      placeholder="Type your question here..."
                                      data-agent="question-text-textarea"
                                      className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all min-h-[60px]"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-blue-600 block mb-1 uppercase tracking-wider opacity-60 flex items-center gap-2">
                                      <BrainCircuit className="w-3 h-3" />
                                      AI Generated Ideal Answer
                                    </label>
                                    <textarea
                                      value={typeof q === 'object' ? q.ideal_answer : ''}
                                      onChange={(e) => {
                                        const newQuestions = [...(round.questions || [])] as any[];
                                        const current = newQuestions[idx];
                                        if (typeof current === 'object') {
                                          newQuestions[idx] = { ...current, ideal_answer: e.target.value };
                                          updateRound(round.id, { questions: newQuestions });
                                        }
                                      }}
                                      placeholder="AI will generate an ideal answer to compare against..."
                                      data-agent="ideal-answer-textarea"
                                      className="w-full bg-blue-600/[0.03] border border-blue-600/10 rounded-sm py-3 px-4 text-xs font-medium italic focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all min-h-[60px]"
                                    />
                                  </div>
                                </div>
                                <div className="w-20 shrink-0">
                                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Marks</label>
                                  <input
                                    type="number"
                                    value={typeof q === 'string' ? 10 : q.marks}
                                    onChange={(e) => {
                                      const newQuestions = [...(round.questions || [])] as any[];
                                      const current = newQuestions[idx];
                                      const newMarks = parseInt(e.target.value) || 0;
                                      newQuestions[idx] = typeof current === 'string'
                                        ? { text: current, marks: newMarks }
                                        : { ...current, marks: newMarks };
                                      updateRound(round.id, { questions: newQuestions });
                                    }}
                                    data-agent="marks-input"
                                    className="w-full bg-muted/10 border border-border rounded-sm py-3 px-3 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const newQuestions = round.questions?.filter((_, i) => i !== idx);
                                    updateRound(round.id, { questions: newQuestions });
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Right: Dispatch Sidebar - Sticky */}
            <div className="hidden lg:block w-[340px] shrink-0 sticky top-24 self-start">
              <div className="bg-card border border-border rounded-sm p-8 shadow-sm space-y-10">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground opacity-70 mb-6">Dispatch Protocol</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-bold opacity-50 shrink-0">Target Job</span>
                      <span className="text-sm font-bold text-right">{jobs.find(j => j.id === selectedJobId)?.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold opacity-50">Candidates</span>
                      <span className="text-sm font-bold">{selectedApplicationIds.length} Targets</span>
                    </div>

                    <div className="border-t border-border pt-6 space-y-4">
                      <p className="text-[10px] font-bold opacity-50">Rounds Overview</p>
                      {rounds.map((r, i) => {
                        const roundMarks = r.questions?.reduce((acc, q: any) => acc + (typeof q === 'string' ? 10 : (q.marks || 0)), 0) || 0;
                        return (
                          <div key={r.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">{i + 1}</span>
                              <span className="text-[11px] font-bold text-foreground truncate max-w-[180px]">{r.title || `Round ${i + 1}`}</span>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600">{roundMarks} pts</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                      <span className="text-[10px] font-bold opacity-50">Total Duration</span>
                      <span className="text-sm font-bold">{Math.floor(rounds.reduce((acc, r) => acc + r.timer_seconds, 0) / 60)} Min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold opacity-50">Total Potential Score</span>
                      <span className="text-sm font-bold text-blue-600">
                        {rounds.reduce((totalAcc, r) => totalAcc + (r.questions?.reduce((acc, q: any) => acc + (typeof q === 'string' ? 10 : (q.marks || 0)), 0) || 0), 0)} Marks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    disabled={isSubmitting || isGenerating || rounds.some(r => !r.questions || r.questions.length === 0)}
                    onClick={handleConfigure}
                    data-agent="dispatch-interviews-button"
                    className="w-full py-5 rounded-sm bg-blue-600 text-white font-bold text-sm shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                  >
                    {isSubmitting ? 'Dispatching Agents...' : isGenerating ? 'Generating...' : 'Dispatch AI Agents'}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-4 rounded-sm border border-border text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all"
                  >
                    Return to Selection
                  </button>
                </div>

                <div className="p-6 bg-blue-600/5 rounded-sm border border-blue-600/10">
                  <p className="text-[10px] font-bold text-blue-600 mb-3">Security Enforcement</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                    All sessions are encrypted and monitored by real-time behavioral AI to ensure candidate authenticity and integrity.
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
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
                        className="px-4 py-2 rounded-sm bg-muted border border-border text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
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
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Username</p>
                            <p className="text-xs font-mono font-bold mt-0.5">{result.examCredentials.username}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Password</p>
                            <p className="text-xs font-mono font-bold mt-0.5">{result.examCredentials.password}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Username: ${result.examCredentials.username}\nPassword: ${result.examCredentials.password}\nExam Portal: ${window.location.origin}/interview/exam`);
                            toast.success('Credentials copied');
                          }}
                          className="mt-2 w-full px-4 py-1.5 rounded-sm bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700 transition-all active:scale-95"
                        >
                          Copy All Credentials
                        </button>
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
                  className="px-12 py-4 rounded-sm bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
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
        )}
      </AnimatePresence>
    </div>
  );
}
