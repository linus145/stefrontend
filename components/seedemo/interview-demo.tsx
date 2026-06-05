'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RefreshCw, Volume2, Shield, 
  Terminal, Award, Cpu, BookOpen, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptItem {
  speaker: 'AI Recruiter' | 'Candidate';
  text: string;
  time: string;
  sentiment?: 'Positive' | 'Neutral' | 'Confident';
}

const CONVERSATION: TranscriptItem[] = [
  { 
    speaker: 'AI Recruiter', 
    text: "Welcome, Liam. Let's dive into system design. How would you architect a distributed rate-limiting mechanism for a multi-tenant SaaS application?", 
    time: "0:02" 
  },
  { 
    speaker: 'Candidate', 
    text: "For a multi-tenant system, I would deploy a Token Bucket algorithm. We can implement it using Redis sorted sets or Lua scripts to ensure atomicity. The keys would be scoped by tenant ID and client IP to prevent noisy-neighbor issues.", 
    time: "0:18", 
    sentiment: 'Confident' 
  },
  { 
    speaker: 'AI Recruiter', 
    text: "Excellent. How do you handle failover if the primary Redis cluster experiences network partitioning?", 
    time: "0:42" 
  },
  { 
    speaker: 'Candidate', 
    text: "I would use a local fallback mechanism. The client library would switch to a local in-memory leaky bucket algorithm on the API Gateway instances, trading global consistency for high availability, returning to Redis once health checks pass.", 
    time: "0:59", 
    sentiment: 'Positive' 
  },
  { 
    speaker: 'AI Recruiter', 
    text: "Very thorough. Now, let's talk about orchestrating background jobs. How would you handle backpressure in a Celery-based worker setup?", 
    time: "1:20" 
  },
  { 
    speaker: 'Candidate', 
    text: "I would configure granular prefetches and separate queue bindings based on job latency profiles. Slow-running tasks like resume scoring go to a dedicated pool with auto-scaling, while fast IO-bound tasks run on separate event loops.", 
    time: "1:45", 
    sentiment: 'Confident' 
  }
];

const JSON_LOGS = [
  '{"event": "call_started", "session_id": "aud_883a92", "codec": "OPUS", "sampling_rate": "16kHz"}',
  '{"event": "speech_detected", "source": "AI", "confidence": 0.99}',
  '{"event": "stt_compiled", "duration_ms": 120, "text": "Welcome Liam..."}',
  '{"event": "vad_triggered", "silence_duration_ms": 650}',
  '{"event": "speech_detected", "source": "Candidate", "db_level": -14.2}',
  '{"event": "nlp_entity_extracted", "term": "Token Bucket", "category": "Algorithm"}',
  '{"event": "nlp_entity_extracted", "term": "Redis", "category": "Infrastructure"}',
  '{"event": "scoring_updated", "metric": "System Design", "delta": +0.8}',
  '{"event": "backpressure_analysis", "agent": "Evaluator", "verdict": "Deep Knowledge"}'
];

export function InterviewDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<'AI' | 'Candidate' | 'None'>('None');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [scores, setScores] = useState({
    systemDesign: 0,
    architecture: 0,
    communication: 0,
    practicalCoding: 0
  });

  const timelineRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      // Animate scores slowly
      const scoreInterval = setInterval(() => {
        setScores(prev => ({
          systemDesign: Math.min(prev.systemDesign + 3, 91),
          architecture: Math.min(prev.architecture + 4, 88),
          communication: Math.min(prev.communication + 2, 85),
          practicalCoding: Math.min(prev.practicalCoding + 4, 94)
        }));
      }, 100);

      // Play through transcript items
      let index = 0;
      setTranscript([CONVERSATION[0]]);
      setActiveSpeech('AI');
      setLogs([JSON_LOGS[0], JSON_LOGS[1], JSON_LOGS[2]]);
      setProgress(5);

      const runTimeline = () => {
        index++;
        if (index < CONVERSATION.length) {
          const item = CONVERSATION[index];
          setTranscript(prev => [...prev, item]);
          setActiveSpeech(item.speaker === 'AI Recruiter' ? 'AI' : 'Candidate');
          setProgress((index / CONVERSATION.length) * 100);

          // Add some JSON logs
          const log1 = JSON_LOGS[(index * 2) % JSON_LOGS.length];
          const log2 = JSON_LOGS[(index * 2 + 1) % JSON_LOGS.length];
          setLogs(prev => [...prev, log1, log2]);
          
          timelineRef.current = setTimeout(runTimeline, 3000);
        } else {
          setIsPlaying(false);
          setActiveSpeech('None');
          setProgress(100);
        }
      };

      timelineRef.current = setTimeout(runTimeline, 3000);

      return () => {
        clearInterval(scoreInterval);
        if (timelineRef.current) clearTimeout(timelineRef.current);
      };
    } else {
      setActiveSpeech('None');
    }
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timelineRef.current) clearTimeout(timelineRef.current);
    } else {
      // reset
      setScores({ systemDesign: 0, architecture: 0, communication: 0, practicalCoding: 0 });
      setTranscript([]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Screening Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-red-400' : 'bg-indigo-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-red-500' : 'bg-indigo-500'}`}></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isPlaying ? 'Live Dynamic Technical Screening Simulation' : 'AI Technical Evaluation Center'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Review live audio feeds, smart transcripts, dynamic question structures, and instant scoring logic.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleTogglePlay}
          className={`h-10 px-6 rounded-sm text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
            isPlaying 
              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" /> Pause Simulation
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white text-white" /> Start Transcript Playback
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Simulated Transcript Playback & Voice Audio Indicators */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4.5 h-4.5 text-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350">
                  Real-time Call Transcript
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isPlaying ? 'STREAMING ACTIVE' : 'STANDBY'}
              </span>
            </div>

            {/* Simulated Waveform Animation */}
            {isPlaying && (
              <div className="flex justify-center items-center gap-1.5 h-12 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-sm px-4">
                <span className="text-[10px] font-bold text-slate-400 mr-2">
                  {activeSpeech === 'AI' ? 'AI SPEAKER' : 'CANDIDATE'}
                </span>
                <div className="flex items-end gap-1 h-6">
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ 
                        height: activeSpeech === 'None' 
                          ? 4 
                          : activeSpeech === 'AI' 
                            ? [4, Math.random() * 20 + 4, 4] 
                            : [4, Math.random() * 24 + 4, 4] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.6 + Math.random() * 0.4, 
                        ease: 'easeInOut' 
                      }}
                      className={`w-1 rounded-sm ${
                        activeSpeech === 'AI' 
                          ? 'bg-indigo-500' 
                          : activeSpeech === 'Candidate' 
                            ? 'bg-teal-500' 
                            : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Flow */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 min-h-[200px] flex flex-col justify-end">
              <AnimatePresence>
                {transcript.length > 0 ? (
                  transcript.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col max-w-[85%] ${
                        item.speaker === 'AI Recruiter' 
                          ? 'self-start' 
                          : 'self-end items-end'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.speaker}
                        </span>
                        <span className="text-[9px] text-slate-450">{item.time}</span>
                        {item.sentiment && (
                          <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 px-1.5 py-0.2 rounded-sm font-bold uppercase">
                            {item.sentiment}
                          </span>
                        )}
                      </div>
                      
                      <div className={`p-3 rounded-sm text-xs leading-relaxed ${
                        item.speaker === 'AI Recruiter'
                          ? 'bg-slate-105 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}>
                        {item.text}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                    <p>Click "Start Transcript Playback" to witness voice transcript processing.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            {isPlaying && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>TRANSCRIPT PROGRESS</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-sm overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Skill Radials & Live background JSON logs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Custom SVG Score Metrics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-sm p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-350 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-500" /> Competency Ratings
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Metric 1 */}
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-3.5 rounded-sm flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase">System Design</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-indigo-500" strokeDasharray={`${scores.systemDesign}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800 dark:text-slate-250">{scores.systemDesign}%</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-3.5 rounded-sm flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase">Architecture</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-purple-500" strokeDasharray={`${scores.architecture}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800 dark:text-slate-250">{scores.architecture}%</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-3.5 rounded-sm flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase">Communication</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-teal-500" strokeDasharray={`${scores.communication}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800 dark:text-slate-250">{scores.communication}%</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-3.5 rounded-sm flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase">Practical Coding</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeDasharray={`${scores.practicalCoding}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-800 dark:text-slate-250">{scores.practicalCoding}%</span>
                </div>
              </div>

            </div>
          </div>

          {/* JSON Log Stream */}
          <div className="bg-slate-950 border border-slate-850 rounded-sm p-5 shadow-sm space-y-3 font-mono text-[10px]">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Pipeline Engine Logs
              </span>
              <span className="text-slate-500 font-bold">JSON Stream</span>
            </div>
            
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className="text-emerald-450 break-all leading-normal">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-600 text-center py-4 italic">
                  Run playback to pipe dynamic background event streams.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
