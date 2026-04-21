import React from 'react';
import { User } from '@/types/user.types';

interface EcosystemActivityProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemActivity({ user, isOwner = false }: EcosystemActivityProps) {
  const activities = [
    { 
      type: 'Updated Profile', 
      detail: 'Added new bio and skills to public profile.', 
      time: 'Just now', 
      status: 'active' 
    },
    { 
      type: 'Account Setup', 
      detail: `Successfully registered as a ${user.role}.`, 
      time: new Date(user.created_at).toLocaleDateString(), 
      status: 'completed' 
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-all hover:border-primary/20">
      <h2 className="text-lg font-semibold text-foreground tracking-tight mb-6">Recent Activity</h2>
      <div className="space-y-6">
        {activities.map((act, idx) => (
          <div key={idx} className="relative pl-8 pb-1 border-l border-border last:border-0 last:pb-0">
            <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ${act.status === 'active' ? 'bg-primary' : 'bg-muted'}`} />
            <div className="flex justify-between items-baseline mb-1.5">
               <h4 className="text-[11px] font-bold text-foreground uppercase tracking-widest leading-none">{act.type}</h4>
               <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight opacity-60 leading-none">{act.time}</span>
            </div>
            <p className="text-[13px] text-muted-foreground font-normal leading-relaxed">{act.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
