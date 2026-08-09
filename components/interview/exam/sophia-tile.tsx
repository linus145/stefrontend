'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SophiaTileProps {
  isSpeaking: boolean;
  agentTranscript: string;
}

export function SophiaTile({ isSpeaking, agentTranscript }: SophiaTileProps) {
  return (
    <div className="relative w-full h-full min-h-[280px] bg-card border border-border rounded-lg overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all group">
      <div className="absolute top-3 left-3 bg-accent border border-border px-2 py-1 rounded text-[10px] text-foreground font-semibold z-10">
        Sophia (AI Host)
      </div>

      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <AnimatePresence>
            {isSpeaking && (
              <>
                {/* Glowing Concentric Pulsing Rings */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute inset-2 rounded-full bg-indigo-500/15 blur-[25px]"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-indigo-500/20"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{ scale: [1, 2.3], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, delay: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-purple-500/10"
                />
              </>
            )}
          </AnimatePresence>

          {/* Real ChatGPT Style Circle with Waveform Inside */}
          <div className={cn(
            "w-36 h-36 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-2xl z-10 border bg-slate-950",
            isSpeaking ? "scale-105 border-indigo-500/30" : "border-border/60"
          )}>
            {/* Waveform container */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              {isSpeaking ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 via-indigo-950/30 to-blue-950/30 opacity-65" />
                  
                  {/* Animated Wave SVG */}
                  <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                    <defs>
                      <linearGradient id="sopWaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#C084FC" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="sopWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#EC4899" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#818CF8" stopOpacity="0.5" />
                      </linearGradient>
                    </defs>
                    
                    {/* Animated path 1 */}
                    <motion.path
                      animate={{
                        d: [
                          "M 0,100 Q 50,60 100,100 T 200,100 L 200,200 L 0,200 Z",
                          "M 0,100 Q 50,140 100,100 T 200,100 L 200,200 L 0,200 Z",
                          "M 0,100 Q 50,60 100,100 T 200,100 L 200,200 L 0,200 Z"
                        ]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "easeInOut"
                      }}
                      fill="url(#sopWaveGrad1)"
                    />
                    
                    {/* Animated path 2 (offset) */}
                    <motion.path
                      animate={{
                        d: [
                          "M 0,105 Q 50,130 100,105 T 200,105 L 200,200 L 0,200 Z",
                          "M 0,105 Q 50,70 100,105 T 200,105 L 200,200 L 0,200 Z",
                          "M 0,105 Q 50,130 100,105 T 200,105 L 200,200 L 0,200 Z"
                        ]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3.2,
                        ease: "easeInOut"
                      }}
                      fill="url(#sopWaveGrad2)"
                    />
                  </svg>
                </div>
              ) : (
                // Quiet breathing state
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 opacity-40">
                    <defs>
                      <linearGradient id="sopWaveGradIdle" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#64748B" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      animate={{
                        d: [
                          "M 0,110 Q 50,105 100,110 T 200,110 L 200,200 L 0,200 Z",
                          "M 0,110 Q 50,115 100,110 T 200,110 L 200,200 L 0,200 Z",
                          "M 0,110 Q 50,105 100,110 T 200,110 L 200,200 L 0,200 Z"
                        ]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 5,
                        ease: "easeInOut"
                      }}
                      fill="url(#sopWaveGradIdle)"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Voice Call Status Indicator */}
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-tight text-foreground transition-all duration-300">
            {isSpeaking ? "Speaking..." : "Talk to interrupt"}
          </p>
          {!isSpeaking && (
            <p className="text-[10px] text-muted-foreground font-medium opacity-60">
              Sophia is listening for your input
            </p>
          )}
        </div>
      </div>

      {agentTranscript && (
        <div className="absolute bottom-3 left-3 right-3 bg-popover border border-border p-2.5 rounded text-xs text-popover-foreground leading-normal max-h-[80px] overflow-y-auto">
          <span className="text-[8px] text-blue-500 font-bold uppercase tracking-wider block mb-0.5">Sophia:</span>
          <p>{agentTranscript}</p>
        </div>
      )}
    </div>
  );
}
