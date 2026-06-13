'use client';

import React from 'react';
import { BookOpen, Sparkles, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserBlogsView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all ease-out min-h-[70vh]">
      <div className="relative mb-8 group">
        {/* Glow behind the icon */}
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 scale-125" />
        
        {/* Main dashed ring */}
        <div className="w-24 h-24 rounded-[2rem] bg-card border border-border/80 flex items-center justify-center relative shadow-lg group-hover:scale-105 group-hover:border-primary/40 transition-all duration-500">
          <BookOpen className="w-10 h-10 text-primary animate-pulse" />
          
          {/* Decorative Sparkle */}
          <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-lg shadow-md hover:scale-110 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="text-center max-w-md space-y-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight select-none">
          Blogging Platform <span className="bg-gradient-to-r from-primary via-[#0a66c2] to-indigo-500 bg-clip-text text-transparent">Coming Soon</span>
        </h3>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">
          We are designing a modern, interactive space for developers, founders, and creators to share their startup journey, technical articles, and ecosystem insights.
        </p>
      </div>

      {/* Micro-interactive newsletter/waiting list card */}
      <div className="mt-10 w-full max-w-sm p-5 rounded-2xl border border-border bg-card/65 backdrop-blur-md shadow-sm space-y-4 hover:border-primary/20 transition-all">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
          <PenTool className="w-3.5 h-3.5" />
          <span>Early Access</span>
        </div>
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-foreground">Want to be a contributor?</h4>
          <p className="text-[11px] text-muted-foreground">Subscribe to receive notifications when writing access goes live.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
          <Button size="sm" className="h-9 px-4 text-xs font-bold rounded-lg cursor-pointer">
            Notify Me
          </Button>
        </div>
      </div>
    </div>
  );
}
