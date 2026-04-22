'use client';

import React from 'react';
import { Home, Network, Briefcase, Newspaper, MessageSquare, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardSection } from './left-sidebar';

interface MobileBottomNavProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export function MobileBottomNav({ activeSection, onSectionChange }: MobileBottomNavProps) {
  const navItems = [
    { id: 'dashboard' as DashboardSection, icon: Home, label: 'Home' },
    { id: 'network' as DashboardSection, icon: Network, label: 'Network' },
    { id: 'create-post' as DashboardSection, icon: Plus, label: 'Post' },
    { id: 'jobs' as DashboardSection, icon: Briefcase, label: 'Jobs' },
    { id: 'Profile' as DashboardSection, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isPost = item.id === 'create-post';
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-all active:scale-90",
                isActive ? "text-primary" : "text-muted-foreground",
                isPost && "relative -top-1"
              )}
            >
              <div className={cn(
                "relative transition-all duration-300",
                isPost && "bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg shadow-primary/30 -mt-6 hover:scale-110"
              )}>
                <item.icon className={cn(
                  isPost ? "w-6 h-6" : "w-5 h-5 transition-all",
                  isActive && !isPost && "drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]"
                )} />
                {isActive && !isPost && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-semibold tracking-tight leading-none mt-0.5",
                isActive ? "text-primary" : "text-muted-foreground",
                isPost && "mt-1"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
