'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { Building2, Clock, ShieldCheck, User as UserIcon, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { GlobalLoader } from '@/components/ui/global-loader';

export default function CandidateInterviewStartPage() {
  const { token } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Welcome/Verify, 2: Setup/Guidelines, 3: Start

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await aiInterviewsService.verifyToken(token as string);
        if (response.data.status === 'success') {
          setSession(response.data.data);
        } else {
          setError(response.data.message || 'Invalid or expired interview link.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to verify interview session.');
      } finally {
        setLoading(false);
      }
    };
    if (token) verify();
  }, [token]);

  if (loading) return <GlobalLoader />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldCheck className="w-10 h-10 text-rose-500 opacity-50" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground text-sm font-medium">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 rounded-sm bg-muted border border-border text-xs font-bold hover:bg-foreground hover:text-background transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    // In a real flow, we might redirect to a dedicated interview room
    toast.success("Interview session initiated.");
    // router.push(`/interview/room/${session.session_id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Candidate Gateway</p>
              <h2 className="text-lg font-bold tracking-tight">AI Assessment Suite</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/20 px-4 py-2 rounded-sm border border-border backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Secure Session Active</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-none">
                    Welcome, <br />
                    <span className="text-blue-600">{session.candidate_name}</span>
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium max-w-md">
                    You've been invited to interview for the <span className="text-foreground font-bold">{session.job_title}</span> position.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-12 h-12 rounded-sm bg-muted border border-border flex items-center justify-center group-hover:border-blue-600/50 transition-all">
                      <Clock className="w-5 h-5 opacity-40 group-hover:text-blue-600 group-hover:opacity-100" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Estimated Duration</p>
                      <p className="text-sm font-bold">45 - 60 Minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-12 h-12 rounded-sm bg-muted border border-border flex items-center justify-center group-hover:border-blue-600/50 transition-all">
                      <ShieldCheck className="w-5 h-5 opacity-40 group-hover:text-blue-600 group-hover:opacity-100" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Proctoring Status</p>
                      <p className="text-sm font-bold">AI Monitoring Enabled</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="group flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-sm font-bold text-sm shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Prepare Environment
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-sm blur-3xl" />
                <div className="relative bg-card border border-border p-10 rounded-sm shadow-2xl space-y-8">
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Interview Architecture</p>
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
                      <div>
                        <p className="text-sm font-bold">Technical Proficiency</p>
                        <p className="text-xs text-muted-foreground mt-1">Deep-dive into core skills and architectural decision making.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 border border-blue-600/20">2</div>
                      <div>
                        <p className="text-sm font-bold opacity-50">Behavioral Dynamics</p>
                        <p className="text-xs text-muted-foreground mt-1 opacity-50">Situational analysis and cultural alignment assessment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 border border-blue-600/20">3</div>
                      <div>
                        <p className="text-sm font-bold opacity-50">Problem Solving</p>
                        <p className="text-xs text-muted-foreground mt-1 opacity-50">Live case study or coding challenge (if applicable).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">Environmental Integrity</h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">Please ensure your environment meets the following requirements to maintain session validity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Stable Connectivity', desc: 'Ensure a consistent high-speed internet connection.' },
                  { title: 'Camera & Microphone', desc: 'Required for identity verification and AI monitoring.' },
                  { title: 'Private Space', desc: 'An isolated environment free from distractions or other people.' },
                  { title: 'Identity Document', desc: 'Have a valid government-issued ID ready for verification.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 bg-card border border-border rounded-sm hover:border-blue-600/30 transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-sm font-bold">{item.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6 pt-8">
                <button 
                  onClick={handleStart}
                  className="px-16 py-5 bg-foreground text-background font-bold text-sm rounded-sm shadow-2xl hover:scale-105 transition-all active:scale-95"
                >
                  Acknowledge & Start Session
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
                >
                  Return to Welcome
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-between items-center pointer-events-none">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Session ID: {session.session_id.substr(0, 8)}</p>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">AI Agent: Nexus-9 Ready</p>
      </footer>
    </div>
  );
}
