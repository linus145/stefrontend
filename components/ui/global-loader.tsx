'use client';

import React from 'react';
import { Bot } from 'lucide-react';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden transition-colors duration-300">
      {/* Centered Architect Loading Core */}
      <div className="flex flex-col items-center text-center max-w-sm px-4">
        
        {/* Centered AI Agent Orbiting Core */}
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          {/* Subtle spinning outer orbit track */}
          <div className="absolute inset-0 rounded-full border border-dashed border-slate-200/10 dark:border-slate-800/30 animate-spin" style={{ animationDuration: '12s' }} />

          {/* Central AI Agent Symbol with Glowing Ring */}
          <div className="relative w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 backdrop-blur-md">
            <Bot className="w-6 h-6 text-primary animate-pulse" />
            
            {/* Tiny satellite active ring inside */}
            <div className="absolute inset-1 rounded-full border border-primary/20 animate-ping opacity-40" />
          </div>

          {/* 4 Colored Orbiting Sub-Agents (transmitting data) */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            {/* Blue Sub-Agent */}
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-[#4285F4] shadow-[0_0_12px_rgba(66,133,244,0.8)]" 
              style={{ width: '14px', height: '14px' }} 
            />
            {/* Red Sub-Agent */}
            <div 
              className="absolute top-1/2 -right-1 -translate-y-1/2 rounded-full bg-[#EA4335] shadow-[0_0_12px_rgba(234,67,53,0.8)]" 
              style={{ width: '14px', height: '14px' }} 
            />
            {/* Yellow Sub-Agent */}
            <div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#FBBC05] shadow-[0_0_12px_rgba(251,188,5,0.8)]" 
              style={{ width: '14px', height: '14px' }} 
            />
            {/* Green Sub-Agent */}
            <div 
              className="absolute top-1/2 -left-1 -translate-y-1/2 rounded-full bg-[#34A853] shadow-[0_0_12px_rgba(52,168,83,0.8)]" 
              style={{ width: '14px', height: '14px' }} 
            />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold tracking-widest text-foreground animate-pulse italic">
            B2linq <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]">AGENT</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
