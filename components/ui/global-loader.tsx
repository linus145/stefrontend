'use client';

import React from 'react';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0c]">
      <div className="relative flex flex-col items-center">
        {/* Outer Glow */}
        <div className="absolute -inset-12 bg-[#b49cf8]/10 blur-[80px] rounded-full animate-pulse"></div>
        
        {/* Main Logo/Icon Placeholder with Gradient Border */}
        <div className="relative h-16 w-16 mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#b49cf8] to-[#8061f2] animate-spin-slow opacity-20"></div>
          <div className="absolute inset-[2px] rounded-2xl bg-[#0a0a0c] flex items-center justify-center">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-[#b49cf8] to-[#8061f2] shadow-[0_0_15px_#b49cf8] animate-bounce"></div>
          </div>
        </div>

        {/* Text and Skeleton bar */}
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold tracking-widest text-[#d9d1fe] animate-pulse italic">
            STE <span className="text-[#a890fe]">ARCHITECT</span>
          </h2>
          <div className="w-48 h-[2px] bg-white/[0.05] rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#b49cf8] to-transparent animate-shimmer"></div>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#71717a] animate-fade-in-out">
            Establishing secure connection
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite ease-in-out;
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
