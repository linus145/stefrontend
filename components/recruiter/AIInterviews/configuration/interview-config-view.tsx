'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, BrainCircuit, Copy, AlertTriangle, Video } from 'lucide-react';
import { CandidateSelectionStep } from './candidate-selection-step';
import { RoundConfigurationStep } from './round-configuration-step';
import { DispatchResultsStep } from './dispatch-results-step';

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
  questions?: { text: string; marks: number; ideal_answer?: string; mcq_options?: any[]; question_type?: string }[];
  selected_topics?: string[];
  selected_frameworks?: string[];
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
const DEFAULT_FORMATS = [
  { label: "Text / Typing Answer", value: "TEXT" },
  { label: "Multiple Choice (Single Answer)", value: "MCQ" },
  { label: "Multiple Choice (Multiple Answers)", value: "MULTI_SELECT" },
  { label: "Code / Programming", value: "CODE" },
  { label: "AI Voice/Video Interview", value: "VIDEO" },
  { label: "Online In-Person Interview", value: "ONLINE_INTERVIEW" }
];
const DEFAULT_LANGS = [{ label: "Python", value: "PYTHON" }];

const SUGGESTED_TOPICS: Record<string, string[]> = {
  ENTRY: ['Variables & Types', 'Conditional Logic', 'Loops & Iterations', 'String Manipulation', 'Basic Arrays', 'Simple Functions'],
  MID: ['Recursion', 'Object-Oriented Design', 'Exceptions & File I/O', 'Data Structures (Stacks/Queues/HashMaps)', 'Searching & Sorting', 'API Handling'],
  SENIOR: ['Dynamic Programming', 'Graph Algorithms', 'Trees & BST', 'Concurrency & Threading', 'SQL & Database Queries', 'Code Optimization'],
  LEAD: ['System Design Coding', 'Design Patterns', 'Scalability & Load Snips', 'Secure Cryptography', 'Distributed Algorithms']
};

const SUGGESTED_FRAMEWORKS: Record<string, string[]> = {
  PYTHON: ['Django', 'Flask', 'FastAPI', 'Pandas & NumPy', 'PyTorch'],
  JAVASCRIPT: ['React', 'Node.js', 'Express', 'Next.js', 'Vue.js'],
  TYPESCRIPT: ['NestJS', 'React with TS', 'Next.js with TS', 'Express with TS'],
  JAVA: ['Spring Boot', 'Hibernate', 'Spring Security'],
  'C++': ['Qt', 'Boost', 'STL Library'],
  'C#': ['.NET Core', 'ASP.NET MVC', 'Entity Framework'],
  GO: ['Gin', 'Echo', 'Fiber', 'GORM']
};

export function InterviewConfigView({ initialApplicationId, initialSessionId, onBack }: InterviewConfigViewProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadedSessionStatus, setLoadedSessionStatus] = useState<string | null>(null);
  const [rounds, setRounds] = useState<RoundConfig[]>([
    { id: '1', title: 'TECHNICAL_SCREENING', type: 'TECHNICAL', difficulty: 'MID', round_category: 'NON_CODING', question_format: 'TEXT', programming_language: '', max_questions: 5, timer_seconds: 600, questions: [], selected_topics: [], selected_frameworks: [] }
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
    programming_languages: DEFAULT_LANGS,
    suggested_topics: SUGGESTED_TOPICS,
    suggested_frameworks: SUGGESTED_FRAMEWORKS
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
          // Track session status for UI warnings
          setLoadedSessionStatus(detail.status || null);
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
              selected_topics: rnd.settings?.coding_topics || [],
              selected_frameworks: rnd.settings?.coding_frameworks || [],
              questions: rnd.questions?.map((q: any) => ({
                text: q.question_text || q.text || q,
                marks: q.marks || 10,
                ideal_answer: q.ideal_answer,
                mcq_options: q.mcq_options || undefined,
                question_type: q.question_type || undefined
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
      questions: [],
      selected_topics: [],
      selected_frameworks: []
    };
    setRounds([...rounds, newRound]);
  };

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter(r => r.id !== id));
    }
  };

  const updateRound = (id: string, updates: Partial<RoundConfig>) => {
    setRounds(rounds.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates };
        if (updates.question_format === 'VIDEO') {
          updated.questions = [];
        }
        return updated;
      }
      return r;
    }));
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
        count: round.max_questions,
        coding_topics: round.selected_topics || [],
        coding_frameworks: round.selected_frameworks || []
      });

      if (response.status === 'success' && response.data?.task_id) {
        const taskId = response.data.task_id;
        let attempts = 0;
        const maxAttempts = 60; // Max 120 seconds polling

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
                mcq_options: typeof q === 'object' ? q.mcq_options : undefined,
                question_type: typeof q === 'object' ? q.question_type : round.question_format,
                marks: 10
              }))
            });
            queryClient.invalidateQueries({ queryKey: ['userCredits'] });
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
            mcq_options: typeof q === 'object' ? q.mcq_options : undefined,
            question_type: typeof q === 'object' ? q.question_type : round.question_format,
            marks: 10
          }))
        });
        queryClient.invalidateQueries({ queryKey: ['userCredits'] });
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

  const buildRoundsPayload = () => rounds.map(({ title, type, difficulty, round_category, question_format, programming_language, max_questions, timer_seconds, questions, selected_topics, selected_frameworks }) => ({
    title,
    type,
    difficulty,
    round_category,
    question_format,
    programming_language,
    max_questions,
    timer_seconds,
    settings: {
      coding_topics: selected_topics || [],
      coding_frameworks: selected_frameworks || []
    },
    questions: questions?.map(q => ({
      text: q.text,
      marks: q.marks,
      ideal_answer: q.ideal_answer,
      mcq_options: q.mcq_options || null,
      question_type: q.question_type || round_category
    })) || []
  }));

  const dispatchInterviews = async (force: boolean = false) => {
    const results = [];
    for (const appId of selectedApplicationIds) {
      const response = await aiInterviewsService.configureInterview({
        job_application_id: appId,
        rounds: buildRoundsPayload(),
        ...(force ? { force: true } : {})
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
    return results;
  };

  const handleConfigure = async () => {
    if (selectedApplicationIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const results = await dispatchInterviews(false);

      setOrchestrationResults(results);
      toast.success(`Interviews orchestrated for ${results.length} candidate(s)!`);
      setStep(3);
    } catch (error: any) {
      // Handle SESSION_IN_USE conflict
      const errData = error?.data?.data || error?.data || {};
      if (errData.code === 'SESSION_IN_USE') {
        const existingStatus = (errData.existing_status || 'ACTIVE').toLowerCase().replace(/_/g, ' ');
        toast(
          `Candidate already has an ${existingStatus} exam session. Expire and replace it?`,
          {
            description: 'The previous session, answers, and credentials will be permanently deleted.',
            duration: 15000,
            action: {
              label: 'Replace & Re-dispatch',
              onClick: async () => {
                setIsSubmitting(true);
                try {
                  const results = await dispatchInterviews(true);
                  setOrchestrationResults(results);
                  toast.success('Old session replaced. New interview dispatched!');
                  setStep(3);
                } catch (forceErr: any) {
                  toast.error(forceErr?.data?.message || forceErr?.message || 'Failed to force re-dispatch.');
                } finally {
                  setIsSubmitting(false);
                }
              }
            },
            cancel: {
              label: 'Cancel',
              onClick: () => {}
            }
          }
        );
        return;
      }
      toast.error(error?.data?.message || error?.message || 'Failed to orchestrate interviews.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuration workspace</h1>
          <p className="text-[12px] font-medium text-[#0a66c2] mt-1 opacity-80">Architect multi-round AI agents & security</p>
        </div>

        <div className="flex items-center gap-8">
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
                "flex items-center gap-2.5 transition-all relative group",
                step === s.n ? "opacity-100" : "opacity-40 hover:opacity-100"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all",
                step === s.n ? "bg-[#0a66c2] border-[#0a66c2] text-white shadow-lg shadow-[#0a66c2]/20" : "border-border"
              )}>
                {s.n}
              </span>
              <span className="text-[13px] font-bold tracking-tight">{s.label}</span>
              {step === s.n && (
                <motion.div
                  layoutId="activeStep"
                  className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#0a66c2]"
                />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="px-4 py-1.5 rounded-sm border border-border text-[10px] font-bold hover:bg-muted transition-all active:scale-95"
        >
          Back
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <CandidateSelectionStep
            filteredJobs={filteredJobs}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            selectedApplicationIds={selectedApplicationIds}
            setSelectedApplicationIds={setSelectedApplicationIds}
            applications={applications}
            jobs={jobs}
            jobsLoading={jobsLoading}
            sessionsLoading={sessionsLoading}
            appsLoading={appsLoading}
            refetchJobs={refetchJobs}
            refetchSessions={refetchSessions}
            setStep={setStep}
          />
        ) : step === 2 ? (
          <RoundConfigurationStep
            loadedSessionStatus={loadedSessionStatus}
            rounds={rounds}
            addRound={addRound}
            removeRound={removeRound}
            updateRound={updateRound}
            metadata={metadata}
            DEFAULT_CATEGORIES={DEFAULT_CATEGORIES}
            SUGGESTED_TOPICS={SUGGESTED_TOPICS}
            SUGGESTED_FRAMEWORKS={SUGGESTED_FRAMEWORKS}
            handleGenerateQuestions={handleGenerateQuestions}
            isSubmitting={isSubmitting}
            isGenerating={isGenerating}
            jobs={jobs}
            selectedJobId={selectedJobId}
            selectedApplicationIds={selectedApplicationIds}
            handleConfigure={handleConfigure}
            setStep={setStep}
          />
        ) : (
          <DispatchResultsStep
            orchestrationResults={orchestrationResults}
            onBack={onBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
