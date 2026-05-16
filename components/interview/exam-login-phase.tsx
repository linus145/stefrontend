'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ExamLoginPhaseProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoggingIn: boolean;
  handleLogin: () => void;
}

export function ExamLoginPhase({
  username, setUsername, password, setPassword, isLoggingIn, handleLogin
}: ExamLoginPhaseProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access your assessment</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="e.g. john.exam.1234"
                className="w-full bg-background border border-input rounded-sm py-3.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your exam password"
                className="w-full bg-background border border-input rounded-sm py-3.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-4 rounded-sm bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : 'Access Exam'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Your credentials were provided by your recruiter. Contact them if you need assistance.
        </p>
      </motion.div>
    </div>
  );
}
