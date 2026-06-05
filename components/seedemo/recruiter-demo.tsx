'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, Bot, UserCheck, Search, Plus, 
  ChevronRight, ArrowRight, Star, CheckCircle, RefreshCw,
  TrendingUp, Sparkles, Filter, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
interface Job {
  id: string;
  title: string;
  department: string;
  applicants: number;
  matchRate: string;
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offered';
  matchScore: number;
  skills: { name: string; score: number }[];
  summary: string;
  avatar: string;
}

const INITIAL_JOBS: Job[] = [
  { id: '1', title: 'Senior AI Engineer', department: 'Engineering', applicants: 45, matchRate: '96%' },
  { id: '2', title: 'Lead Product Designer', department: 'Product', applicants: 28, matchRate: '91%' },
  { id: '3', title: 'Director of Growth', department: 'Marketing', applicants: 19, matchRate: '88%' },
];

const INITIAL_CANDIDATES: Candidate[] = [
  { 
    id: 'c1', 
    name: 'Sarah Jenkins', 
    role: 'Senior AI Engineer', 
    stage: 'Interview', 
    matchScore: 95, 
    skills: [
      { name: 'NLP & PyTorch', score: 98 },
      { name: 'System Design', score: 92 },
      { name: 'LLM Agents', score: 96 }
    ],
    summary: 'Ex-Meta AI Researcher. Designed conversational pipelines and vector search systems handling 100M+ DAU. High autonomy score.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  { 
    id: 'c2', 
    name: 'David Chen', 
    role: 'Senior AI Engineer', 
    stage: 'Screening', 
    matchScore: 88, 
    skills: [
      { name: 'Python/FastAPI', score: 90 },
      { name: 'Kubernetes', score: 85 },
      { name: 'TensorFlow', score: 89 }
    ],
    summary: 'Full-stack ML Engineer with 5 years experience scaling inference engines and model packaging pipelines.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  { 
    id: 'c3', 
    name: 'Elena Rostova', 
    role: 'Lead Product Designer', 
    stage: 'Offered', 
    matchScore: 92, 
    skills: [
      { name: 'Figma Systems', score: 95 },
      { name: 'UX Prototyping', score: 90 },
      { name: 'Product Strategy', score: 91 }
    ],
    summary: 'Led the redesign of Enterprise SaaS tools. Specializes in simplified data-heavy dashboard design layouts.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  { 
    id: 'c4', 
    name: 'Marcus Brody', 
    role: 'Director of Growth', 
    stage: 'Applied', 
    matchScore: 84, 
    skills: [
      { name: 'User Acquisition', score: 88 },
      { name: 'Data Analytics', score: 85 },
      { name: 'A/B Testing', score: 80 }
    ],
    summary: 'Growth hacker with a track record of taking products from $1M to $15M ARR via referral loops and SEO.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  }
];

export function RecruiterDemo() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(INITIAL_CANDIDATES[0]);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [activePipelineStage, setActivePipelineStage] = useState<string>('All');

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchesJob = selectedJob === 'all' || 
      (selectedJob === '1' && cand.role === 'Senior AI Engineer') ||
      (selectedJob === '2' && cand.role === 'Lead Product Designer') ||
      (selectedJob === '3' && cand.role === 'Director of Growth');
    
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = activePipelineStage === 'All' || cand.stage === activePipelineStage;
    
    return matchesJob && matchesSearch && matchesStage;
  });

  const handleRunAgent = () => {
    if (isAgentRunning) return;
    setIsAgentRunning(true);
    setAgentLogs([]);
    
    const logs = [
      '🤖 Initializing Autonomous Talent Orchestration Agent...',
      '🔍 Scraping secure candidate platforms for: Senior AI Engineer...',
      '📄 Sourced profile: Liam O\'Connor (Principal ML Architect, Ex-Netflix)',
      '⚙️ Parsing CV & extracting competency clusters...',
      '🧠 Running AI scoring model for System Design & Agentic Frameworks...',
      '📊 Computing scorecard matching indices (96% Fit Rate score)',
      '✅ Liam O\'Connor successfully added to pipeline (Stage: Applied)'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setAgentLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsAgentRunning(false);
        // Add sourced candidate to list
        const newCandidate: Candidate = {
          id: 'c' + (Date.now()),
          name: "Liam O'Connor",
          role: 'Senior AI Engineer',
          stage: 'Applied',
          matchScore: 96,
          skills: [
            { name: 'Agentic Arch', score: 98 },
            { name: 'Distributed ML', score: 95 },
            { name: 'PyTorch/CUDA', score: 94 }
          ],
          summary: 'Ex-Netflix Principal Machine Learning Architect. Led developer experience and infrastructure pipelines for model scaling.',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
        };
        setCandidates(prev => [newCandidate, ...prev]);
        setSelectedCandidate(newCandidate);
      }
    }, 900);
  };

  const advanceCandidate = (candId: string) => {
    setCandidates(prev => prev.map(cand => {
      if (cand.id === candId) {
        const nextStageMap: Record<Candidate['stage'], Candidate['stage']> = {
          'Applied': 'Screening',
          'Screening': 'Interview',
          'Interview': 'Offered',
          'Offered': 'Offered'
        };
        const updated = { ...cand, stage: nextStageMap[cand.stage] };
        if (selectedCandidate && selectedCandidate.id === candId) {
          setSelectedCandidate(updated);
        }
        return updated;
      }
      return cand;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Recruiter Banner Info */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Talent Orchestration Console
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Deploy specialized AI agents that autonomously source talent, screen capabilities, and score profiles.
          </p>
        </div>
        <button
          onClick={handleRunAgent}
          disabled={isAgentRunning}
          className={`h-10 px-5 rounded-sm text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
            isAgentRunning
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-0.5'
          }`}
        >
          {isAgentRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Running AI Agent...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-350 animate-pulse" /> Deploy Autonomous Agent
            </>
          )}
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job board & candidates list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Job Postings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-indigo-500" /> Active Job Postings
              </h4>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-sm font-bold">
                {jobs.length} Jobs
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedJob('all')}
                className={`w-full text-left p-3 rounded-sm text-xs border transition-all flex items-center justify-between ${
                  selectedJob === 'all'
                    ? 'border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <span>All Open Positions</span>
                <span className="text-[10px] opacity-80">
                  {candidates.length} candidates
                </span>
              </button>

              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                  className={`w-full text-left p-3 rounded-sm text-xs border transition-all flex items-center justify-between ${
                    selectedJob === job.id
                      ? 'border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{job.title}</div>
                    <div className="text-[10px] text-slate-400">{job.department}</div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{job.matchRate} Match</span>
                    <span className="text-[10px] text-slate-400">{job.applicants} applied</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sourced Candidate Pipeline Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-teal-500" /> Pipeline Applicants
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-450 dark:text-slate-400">Stage:</span>
                  <select
                    value={activePipelineStage}
                    onChange={(e) => setActivePipelineStage(e.target.value)}
                    className="text-[10px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-sm px-1.5 py-0.5 font-semibold text-slate-650 dark:text-slate-350"
                  >
                    <option value="All">All Stages</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Offered">Offered</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search applicant name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 rounded-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Candidate List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence mode="popLayout">
                {filteredCandidates.map(cand => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-3 rounded-sm border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedCandidate?.id === cand.id
                        ? 'border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-sm'
                        : 'border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="w-8 h-8 rounded-sm object-cover border border-slate-200 dark:border-slate-750"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {cand.name}
                          {cand.matchScore >= 95 && (
                            <span className="text-[8px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.2 rounded-sm font-black tracking-wide uppercase">Top Match</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{cand.role}</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-sm ${
                        cand.stage === 'Applied' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' :
                        cand.stage === 'Screening' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' :
                        cand.stage === 'Interview' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400' :
                        'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {cand.stage}
                      </span>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350">
                        {cand.matchScore}% Match
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No applicants found matching selection.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Agent Logs & Live Scorecard Preview */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Agent Simulation Live Logging */}
          {agentLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-850 rounded-sm p-4 shadow-sm font-mono text-[11px] text-emerald-400 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Agent Real-Time Executions
                </span>
                <span className="text-[9px] text-slate-500">Autonomous Core</span>
              </div>
              <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
                {agentLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="leading-relaxed text-slate-300"
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Candidate AI Scorecard */}
          {selectedCandidate ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-6 shadow-sm space-y-6">
              
              {/* Scorecard Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCandidate.avatar}
                    alt={selectedCandidate.name}
                    className="w-14 h-14 rounded-sm object-cover border-2 border-indigo-500/20 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedCandidate.name}</h4>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-sm font-bold">
                        Fit Scorecard
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCandidate.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Radial Match Score SVG */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${selectedCandidate.matchScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-[11px] font-black text-slate-800 dark:text-slate-200">
                      {selectedCandidate.matchScore}%
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Verdict Fit Index</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Excellent Matching</span>
                  </div>
                </div>
              </div>

              {/* Core Skill Progress Metrics */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wide">
                  AI Evaluated Skill Clusters
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedCandidate.skills.map((skill, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-sm border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-650 dark:text-slate-350">{skill.name}</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">{skill.score}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-sm overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-400 h-full transition-all duration-500 rounded-sm"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fit Summary and Recommendation */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800 rounded-sm space-y-2">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Executive AI Summary
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedCandidate.summary}
                </p>
              </div>

              {/* Stage Progression Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {selectedCandidate.stage !== 'Offered' ? (
                  <button
                    onClick={() => advanceCandidate(selectedCandidate.id)}
                    className="flex-1 h-11 bg-[#0a66c2] text-white hover:bg-[#084e96] rounded-sm text-xs font-semibold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-sm"
                  >
                    Advance Candidate Stage <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex-1 h-11 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-455 rounded-sm text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Offer Already Submitted
                  </div>
                )}
                
                <button
                  onClick={() => alert(`Simulating automated interview email send to ${selectedCandidate.name}`)}
                  className="h-11 px-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-755 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805 rounded-sm text-xs font-semibold transition-all"
                >
                  Send AI Assessment
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-12 text-center text-slate-400 text-xs">
              Select a candidate to inspect their AI-driven scorecards and credentials.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
