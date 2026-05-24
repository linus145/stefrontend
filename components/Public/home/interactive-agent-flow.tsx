'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bot, Cpu, Users, GitBranch, Play, Pause,
  RefreshCw, CheckCircle2, ShieldCheck, Database, Layers, Sparkles,
  Terminal, FileText, BarChart3, Star, Briefcase, Network, Radio,
  Workflow, ArrowUpRight, Search, ClipboardCheck, Video, Award,
  Sun, Moon
} from 'lucide-react';

const CANDIDATES = [
  {
    name: "Sarah Chen",
    role: "Senior AI Architect",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    initials: "SC",
    skills: ["PyTorch", "LLMs", "LangChain", "VectorDBs", "Python"],
    score: 98,
    matchLevel: "Exceptional Match",
    matchColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeColor: "bg-emerald-500",
    parsedJson: `{
  "profile": {
    "name": "Sarah Chen",
    "role": "Senior AI Architect",
    "experience": "8 Years"
  },
  "extracted_skills": {
    "core": ["PyTorch", "Transformers", "LangChain"],
    "infrastructure": ["AWS", "Kubernetes", "Pinecone"]
  },
  "screening_verdict": {
    "relevance_index": 0.98,
    "confidence_score": 0.96
  }
}`,
    interviewQ: "How do you optimize scaling context windows in dynamic RAG systems?",
    interviewA: "We implement dynamic token chunk routing coupled with hierarchical index retrieval and cross-encoder rerankers to optimize context usage and latency.",
    recText: "Outstanding candidate with high expertise in production AI systems. Displays robust system design principles and clear communication skills."
  },
  {
    name: "Alex Rivera",
    role: "Lead Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    initials: "AR",
    skills: ["Next.js", "React", "TypeScript", "Tailwind", "GraphQL"],
    score: 93,
    matchLevel: "Strong Match",
    matchColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
    badgeColor: "bg-indigo-500",
    parsedJson: `{
  "profile": {
    "name": "Alex Rivera",
    "role": "Lead Frontend Engineer",
    "experience": "6 Years"
  },
  "extracted_skills": {
    "core": ["Next.js", "TypeScript", "Performance Tuning"],
    "styling": ["Tailwind CSS", "Framer Motion"]
  },
  "screening_verdict": {
    "relevance_index": 0.94,
    "confidence_score": 0.92
  }
}`,
    interviewQ: "How would you optimize rendering inside high-density interactive dashboards?",
    interviewA: "I isolate mutable states at leaf nodes, employ virtual list grids for large tables, and leverage browser idle loops for telemetry tasks.",
    recText: "Strong frontend architecture design patterns. Solid commitment to user experience polish. Excellent product and system thinker."
  },
  {
    name: "Elena Rostova",
    role: "DevOps Platform Engineer",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    initials: "ER",
    skills: ["WordPress", "HTML", "CSS", "Site Support", "Themes"],
    score: 42,
    matchLevel: "Low Match",
    matchColor: "text-rose-700 bg-rose-50 border-rose-200",
    badgeColor: "bg-rose-500",
    parsedJson: `{
  "profile": {
    "name": "Elena Rostova",
    "role": "WordPress Developer",
    "experience": "1 Year"
  },
  "extracted_skills": {
    "core": ["HTML", "CSS", "WordPress Layouts"],
    "infrastructure": []
  },
  "screening_verdict": {
    "relevance_index": 0.42,
    "confidence_score": 0.88
  }
}`,
    interviewQ: "Describe your strategy for highly available multi-region deployments.",
    interviewA: "I usually upload site templates to standard web hosting servers and customize basic page elements through the WordPress admin panel.",
    recText: "Critical skill gaps identified. Candidate lacks the core Kubernetes, IaC, and AWS architectures required for this platform team. Verdict: REJECTED."
  }
];

export function InteractiveAgentFlow() {
  const [selectedCand, setSelectedCand] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [jsonText, setJsonText] = useState("");
  const [scoreVal, setScoreVal] = useState(0);

  const currentCandidate = CANDIDATES[selectedCand];
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-play steps cycle
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimer.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 5);
      }, 4200);
    } else {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    }
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isPlaying]);

  // Restart flow on candidate change
  const handleSelectCandidate = (idx: number) => {
    setSelectedCand(idx);
    setActiveStep(0);
    setScoreVal(0);
  };

  // Parsing typewriter animation simulation
  useEffect(() => {
    if (activeStep === 1) {
      let i = 0;
      const fullText = currentCandidate.parsedJson;
      setJsonText("");
      const timer = setInterval(() => {
        if (i < 150) {
          setJsonText(fullText.substring(0, i) + "█");
          i += 3;
        } else {
          setJsonText(fullText);
          clearInterval(timer);
        }
      }, 25);
      return () => clearInterval(timer);
    }
  }, [activeStep, selectedCand]);

  // Score counter animation simulation
  useEffect(() => {
    if (activeStep >= 2) {
      let start = 0;
      const end = currentCandidate.score;
      const duration = 1200;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (Math.round(start) >= end) {
          setScoreVal(end);
          clearInterval(timer);
        } else {
          setScoreVal(Math.round(start));
        }
      }, 16);
      return () => clearInterval(timer);
    } else {
      setScoreVal(0);
    }
  }, [activeStep, selectedCand]);

  return (
    <div className={`w-full border rounded-sm p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${
      isDark 
        ? 'bg-zinc-900 border-zinc-700 text-white shadow-2xl' 
        : 'bg-white/75 border-zinc-300 text-zinc-900 shadow-xl'
    }`}>

      {/* Dynamic styles localized to this component */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes indigoGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.6); border-color: rgba(99, 102, 241, 0.8); }
        }
        @keyframes roseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(244, 63, 94, 0.2); border-color: rgba(244, 63, 94, 0.3); }
          50% { box-shadow: 0 0 25px rgba(244, 63, 94, 0.6); border-color: rgba(244, 63, 94, 0.8); }
        }
        @keyframes flowPulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .agent-active-glow {
          animation: indigoGlow 2.5s infinite ease-in-out;
        }
        .agent-rose-glow {
          animation: roseGlow 2.5s infinite ease-in-out;
        }
        .flow-line-pulse {
          animation: flowPulse 1.8s infinite linear;
        }
        .voice-bar-anim {
          animation: voiceBar 1s ease-in-out infinite alternate;
        }
        @keyframes voiceBar {
          0% { height: 4px; }
          100% { height: 28px; }
        }
      `}} />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            <Network className="w-4 h-4 text-indigo-500 animate-pulse" /> Agent Orchestrator Core
          </h3>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Click candidate cards below to simulate active agent pipelines.</p>
        </div>

        {/* HUD & Controls Container Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Real-time Agentic Efficiency & Savings HUD */}
          <div className={`flex items-center gap-3 border rounded-sm px-3.5 py-1.5 text-[10px] font-bold shadow-inner select-none shrink-0 ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-300 text-zinc-500'
          }`}>
            <div className={`flex items-center gap-1 border-r pr-2.5 ${isDark ? 'border-zinc-800' : 'border-zinc-300'}`}>
              <span className="text-indigo-500 font-black font-mono">5</span> Cooperative Agents
            </div>
            <div className={`flex items-center gap-1 border-r pr-2.5 ${isDark ? 'border-zinc-800' : 'border-zinc-300'}`}>
              <span className="text-indigo-500 font-black font-mono">98%</span> Human Capacity Saved
            </div>
            <div className="flex items-center gap-1">
              <span className="text-indigo-500 font-black font-mono">12x</span> Time Saved
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme selection toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`h-8 px-3 rounded-sm flex items-center gap-1.5 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' 
                  : 'bg-slate-50 border-slate-250 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Toggle theme view"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-8 px-3 rounded-sm flex items-center gap-1.5 text-xs font-semibold border transition-all duration-200 ${isPlaying
                ? isDark
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : isDark
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
            >
              {isPlaying ? (
                <>
                  <Pause className={`w-3.5 h-3.5 stroke-none ${isDark ? 'fill-amber-400' : 'fill-amber-700'}`} /> Pause Auto
                </>
              ) : (
                <>
                  <Play className={`w-3.5 h-3.5 stroke-none ${isDark ? 'fill-indigo-400' : 'fill-indigo-700'}`} /> Auto Cycle
                </>
              )}
            </button>
            <button
              onClick={() => setActiveStep(0)}
              className={`h-8 w-8 rounded-sm border flex items-center justify-center transition-colors ${
                isDark 
                  ? 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
              title="Reset Pipeline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Selection Tabs */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {CANDIDATES.map((cand, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectCandidate(idx)}
            className={`flex items-center gap-2 p-2.5 rounded-sm border text-left transition-all duration-300 ${selectedCand === idx
              ? isDark
                ? 'border-indigo-500/40 bg-indigo-500/10 shadow-sm'
                : 'border-indigo-500/30 bg-indigo-50/50 shadow-sm'
              : isDark
                ? 'border-slate-800 bg-slate-950/50 hover:bg-slate-950 hover:border-slate-700'
                : 'border-slate-100 bg-white/50 hover:bg-white hover:border-slate-200'
              }`}
          >
            {cand.avatar ? (
              <img src={cand.avatar} alt={cand.name} className={`w-8 h-8 rounded-sm object-cover border shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200/50'}`} />
            ) : (
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold shrink-0 ${isDark ? 'bg-slate-850 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {cand.initials}
              </div>
            )}
            <div className="overflow-hidden hidden sm:block">
              <h4 className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{cand.name}</h4>
              <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cand.role}</p>
            </div>
          </button>
        ))}
      </div>

      {/* VISUAL ARCHITECTURE NETWORK */}
      <div className={`relative w-full h-[140px] sm:h-[160px] rounded-sm p-4 overflow-hidden border shadow-inner transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-950 border-slate-800' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDark 
            ? 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_100%)]' 
            : 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,transparent_100%)]'
        }`} />

        {/* Decorative background network grid lines */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-[0.04]'}`} style={{ backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />

        {/* Flow Nodes and Flexbox-integrated Connectors Container */}
        <div className="flex justify-between items-start h-full relative z-10 px-2 sm:px-6 pt-5">

          {/* Node 0: Sourcing Agent */}
          <div
            onClick={() => setActiveStep(0)}
            className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${activeStep === 0 ? 'scale-110' : 'hover:scale-105 opacity-70'
              }`}
          >
            <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${
              activeStep === 0 
                ? 'border-indigo-500 agent-active-glow ' + (isDark ? 'bg-slate-900' : 'bg-white')
                : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}>
              <Search className={`w-4 h-4 ${activeStep === 0 ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Discovery</span>
          </div>

          {/* Connector 1 */}
          <div className={`flex-1 h-[2px] mt-5 relative mx-1 sm:mx-4 rounded-sm overflow-hidden shrink-0 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`}>
            <div className={`absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-700 ${activeStep >= 1 ? 'w-full' : 'w-0'}`} />
            {activeStep === 0 && (
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-indigo-400 to-transparent flow-line-pulse" />
            )}
          </div>

          {/* Node 1: Parser Agent */}
          <div
            onClick={() => setActiveStep(1)}
            className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${activeStep === 1 ? 'scale-110' : 'hover:scale-105 opacity-70'
              }`}
          >
            <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${
              activeStep === 1 
                ? 'border-indigo-500 agent-active-glow ' + (isDark ? 'bg-slate-900' : 'bg-white')
                : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}>
              <Terminal className={`w-4 h-4 ${activeStep === 1 ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Extraction</span>
          </div>

          {/* Connector 2 */}
          <div className={`flex-1 h-[2px] mt-5 relative mx-1 sm:mx-4 rounded-sm overflow-hidden shrink-0 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`}>
            <div className={`absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-700 ${activeStep >= 2 ? 'w-full' : 'w-0'}`} />
            {activeStep === 1 && (
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-indigo-400 to-transparent flow-line-pulse" />
            )}
          </div>

          {/* Node 2: Screener Agent */}
          <div
            onClick={() => setActiveStep(2)}
            className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${activeStep === 2 ? 'scale-110' : 'hover:scale-105 opacity-70'
              }`}
          >
            <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${
              activeStep === 2 
                ? 'border-indigo-500 agent-active-glow ' + (isDark ? 'bg-slate-900' : 'bg-white')
                : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}>
              <ClipboardCheck className={`w-4 h-4 ${activeStep === 2 ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Screening</span>
          </div>

          {/* Connector 3 */}
          <div className={`flex-1 h-[2px] mt-5 relative mx-1 sm:mx-4 rounded-sm overflow-hidden shrink-0 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`}>
            <div className={`absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-700 ${activeStep >= 3 ? 'w-full' : 'w-0'}`} />
            {activeStep === 2 && (
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-indigo-400 to-transparent flow-line-pulse" />
            )}
          </div>

          {/* Node 3: AI Interview Agent */}
          <div
            onClick={() => setActiveStep(3)}
            className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${activeStep === 3 ? 'scale-110' : 'hover:scale-105 opacity-70'
              }`}
          >
            <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${
              activeStep === 3 
                ? 'border-indigo-500 agent-active-glow ' + (isDark ? 'bg-slate-900' : 'bg-white')
                : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}>
              <Video className={`w-4 h-4 ${activeStep === 3 ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Interviewer</span>
          </div>

          {/* Connector 4 */}
          <div className={`flex-1 h-[2px] mt-5 relative mx-1 sm:mx-4 rounded-sm overflow-hidden shrink-0 ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`}>
            <div className={`absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-700 ${activeStep >= 4 ? 'w-full' : 'w-0'}`} />
            {activeStep === 3 && (
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-indigo-400 to-transparent flow-line-pulse" />
            )}
          </div>

          {/* Node 4: Decision Agent */}
          <div
            onClick={() => setActiveStep(4)}
            className={`flex flex-col items-center group cursor-pointer transition-all duration-300 ${activeStep === 4 ? 'scale-110' : 'hover:scale-105 opacity-70'
              }`}
          >
            <div className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all ${
              activeStep === 4
                ? (currentCandidate.score >= 80 
                    ? 'border-indigo-500 agent-active-glow ' + (isDark ? 'bg-slate-900' : 'bg-white')
                    : 'border-rose-500 agent-rose-glow ' + (isDark ? 'bg-slate-900' : 'bg-white'))
                : isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}>
              <Award className={`w-4 h-4 ${activeStep === 4
                ? (currentCandidate.score >= 80 ? 'text-indigo-400' : 'text-rose-400')
                : 'text-slate-500'
                }`} />
            </div>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Decision</span>
          </div>
        </div>
      </div>

      {/* ACTIVE STAGE VIEWPORT (Dynamic UI Content based on Active Step) */}
      <div className={`mt-6 border rounded-sm p-5 sm:p-6 min-h-[260px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-slate-950 border-slate-850' 
          : 'border-slate-200/50 bg-slate-50/40'
      }`}>

        {/* Futuristic Cooperative Agent Chaining Tracker */}
        <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 pb-4 border-b text-[10px] font-bold select-none ${
          isDark ? 'border-slate-850 text-slate-500' : 'border-slate-200/60 text-slate-400'
        }`}>
          <span className={`px-2.5 py-1 rounded-sm border transition-all duration-300 ${
            activeStep === 0 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 scale-105' 
              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Discovery Agent
          </span>
          <span className={isDark ? 'text-slate-700 font-normal' : 'text-slate-300 font-normal'}>➔</span>
          <span className={`px-2.5 py-1 rounded-sm border transition-all duration-300 ${
            activeStep === 1 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 scale-105' 
              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Extraction Agent
          </span>
          <span className={isDark ? 'text-slate-700 font-normal' : 'text-slate-300 font-normal'}>➔</span>
          <span className={`px-2.5 py-1 rounded-sm border transition-all duration-300 ${
            activeStep === 2 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 scale-105' 
              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Screening Agent
          </span>
          <span className={isDark ? 'text-slate-700 font-normal' : 'text-slate-300 font-normal'}>➔</span>
          <span className={`px-2.5 py-1 rounded-sm border transition-all duration-300 ${
            activeStep === 3 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 scale-105' 
              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Interviewer Agent
          </span>
          <span className={isDark ? 'text-slate-700 font-normal' : 'text-slate-300 font-normal'}>➔</span>
          <span className={`px-2.5 py-1 rounded-sm border transition-all duration-300 ${
            activeStep === 4
              ? (currentCandidate.score >= 80 ? 'bg-indigo-600 border-indigo-500 shadow-indigo-100' : 'bg-rose-600 border-rose-500 shadow-rose-100') + ' text-white shadow-md scale-105'
              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
            Decision Agent
          </span>
        </div>
        {activeStep === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark 
                    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
                    : 'text-indigo-700 bg-indigo-50 border border-indigo-100'
                }`}>Sourcing Agent Active</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Job: Staff Architect</span>
            </div>
            <div className="my-4 grid grid-cols-2 gap-4">
              <div className={`border p-3 rounded-sm shadow-sm ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-150 bg-white'
              }`}>
                <span className="text-[10px] text-slate-400 block font-semibold">Incoming Profiles</span>
                <span className={`text-xl font-bold mt-1 block ${isDark ? 'text-white' : 'text-slate-800'}`}>1,248</span>
              </div>
              <div className={`border p-3 rounded-sm shadow-sm ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-150 bg-white'
              }`}>
                <span className="text-[10px] text-slate-400 block font-semibold">Ingestion Pipeline</span>
                <span className="text-xs text-indigo-600 font-bold mt-1 block flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-500 animate-pulse" /> Global API Channels
                </span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Autonomous sourcing scan active across integrated global networks (LinkedIn, GitHub, ATS systems). Ingested candidate profile: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentCandidate.name}</span>.
            </p>
          </div>
        )}

        {/* Step 1 Content: Parser Simulation */}
        {activeStep === 1 && (
          <div className="animate-in fade-in duration-300 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                    : 'text-purple-700 bg-purple-50 border border-purple-100'
                }`}>NLP Extraction Agent</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Status: Stream Parsing...</span>
            </div>
            <div className={`my-3 border text-[10px] font-mono p-3 rounded-sm overflow-y-auto max-h-[100px] shadow-inner ${
              isDark ? 'bg-slate-900 border-slate-850' : 'bg-slate-900 border-slate-800'
            }`}>
              <pre className="whitespace-pre-wrap leading-tight text-emerald-400">{jsonText}</pre>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Deep parser mapping unstructured CV data into standard JSON model schema with zero token loss.
            </p>
          </div>
        )}

        {/* Step 2 Content: Screening Simulation */}
        {activeStep === 2 && (
          <div className="animate-in fade-in duration-300 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                    : 'text-indigo-700 bg-indigo-50 border border-indigo-100'
                }`}>Semantic Match Evaluator</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Precision: 99.8%</span>
            </div>
            <div className={`my-3 flex items-center justify-between gap-6 p-3 rounded-sm border shadow-sm ${
              isDark ? 'border-slate-850 bg-slate-900' : 'border-slate-100 bg-white'
            }`}>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="4.5" fill="transparent" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#4f46e5"
                      strokeWidth="4.5"
                      fill="transparent"
                      strokeDasharray={175}
                      strokeDashoffset={175 - (175 * scoreVal) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className={`absolute text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{scoreVal}%</span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-850'}`}>{currentCandidate.role} Match</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentCandidate.skills.map((s, idx) => (
                      <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>+{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                isDark 
                  ? currentCandidate.score >= 80 
                    ? 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-rose-450 bg-rose-500/10 border-rose-500/20'
                  : currentCandidate.matchColor
              }`}>
                {currentCandidate.matchLevel}
              </div>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Semantic skills correlation compared directly with dynamic technical criteria configurations.
            </p>
          </div>
        )}

        {/* Step 3 Content: Interview Simulation */}
        {activeStep === 3 && (
          <div className="animate-in fade-in duration-300 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                }`}>Voice AI Interviewer</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Channel: Dynamic Assessment</span>
            </div>
            <div className={`my-2 border p-3 rounded-sm flex flex-col gap-2 relative shadow-sm ${
              isDark ? 'border-slate-850 bg-slate-900' : 'border-slate-101 bg-white'
            }`}>
              {/* Waveforms */}
              <div className="absolute right-3 top-3 flex items-center gap-0.5">
                <div className="w-0.5 bg-indigo-500 rounded voice-bar-anim" style={{ animationDelay: '0.1s' }} />
                <div className="w-0.5 bg-indigo-500 rounded voice-bar-anim" style={{ animationDelay: '0.3s' }} />
                <div className="w-0.5 bg-indigo-500 rounded voice-bar-anim" style={{ animationDelay: '0.2s' }} />
                <div className="w-0.5 bg-indigo-500 rounded voice-bar-anim" style={{ animationDelay: '0.5s' }} />
              </div>

              <div>
                <span className="text-[9px] font-extrabold uppercase text-indigo-500 block">AI Agent Prompt</span>
                <span className={`text-xs block italic leading-snug mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{currentCandidate.interviewQ}"</span>
              </div>
              <div className={`border-t pt-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-[9px] font-extrabold uppercase block flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Candidate Transcripts
                </span>
                <span className={`text-xs block leading-snug truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>"{currentCandidate.interviewA}"</span>
              </div>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Autonomous real-time screening, dynamically evaluating domain competence and soft skills.
            </p>
          </div>
        )}

        {/* Step 4 Content: Verdict Simulation */}
        {activeStep === 4 && (
          <div className="animate-in fade-in duration-300 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full animate-ping ${currentCandidate.score >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? currentCandidate.score >= 80
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    : currentCandidate.score >= 80
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                  Hiring Verdict Coordinator
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Verdict: {currentCandidate.score >= 80 ? "APPROVED" : "REJECTED"}
              </span>
            </div>
            <div className={`my-2 border border-dashed p-3 rounded-sm flex items-center gap-3 relative shadow-inner ${
              isDark
                ? currentCandidate.score >= 80
                  ? 'border-indigo-500/30 bg-indigo-500/5'
                  : 'border-rose-500/30 bg-rose-500/5'
                : currentCandidate.score >= 80
                  ? 'border-indigo-200 bg-indigo-50/20'
                  : 'border-rose-200 bg-rose-50/20'
              }`}>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0 ${
                currentCandidate.score >= 80
                  ? 'bg-emerald-500 border-emerald-400'
                  : 'bg-rose-500 border-rose-400'
                }`}>
                {scoreVal}%
              </div>
              <div className="flex-1">
                <h4 className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Autonomous Verdict recommendation:</h4>
                <p className={`text-[10px] leading-relaxed mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{currentCandidate.recText}</p>
              </div>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              Comprehensive summary payload compiled and automatically synchronized to recruiter's ATS dashboards.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
