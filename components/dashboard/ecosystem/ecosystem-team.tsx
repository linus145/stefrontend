import React from 'react';
import { ChevronRight, User as UserIcon } from 'lucide-react';
import { User } from '@/types/user.types';

interface EcosystemTeamProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemTeam({ user, isOwner = false }: EcosystemTeamProps) {
  const profile = user.profile;
  
  const teamMembers = [
    { 
      name: `${user.first_name} ${user.last_name}`, 
      role: `${user.role} • ${profile?.headline || 'Member'}`, 
      avatar: profile?.profile_image_url || `https://i.pravatar.cc/150?u=${user.id}`
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm transition-all hover:border-primary/20">
      <h2 className="text-lg font-semibold text-foreground tracking-tight mb-5">Core Team</h2>
      <div className="space-y-3">
        {teamMembers.map((member, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between p-4 rounded-md bg-muted/40 border border-border group cursor-pointer hover:border-primary/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-md overflow-hidden border border-border bg-sidebar flex items-center justify-center shadow-sm">
                 {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 ) : (
                    <UserIcon className="w-4.5 h-4.5 text-primary opacity-60" />
                 )}
               </div>
               <div>
                  <h4 className="text-[13px] font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors leading-none mb-1.5">{member.name}</h4>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider opacity-80">{member.role}</p>
               </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        ))}
        
        {isOwner && (
          <button className="w-full mt-2 py-3 rounded-md border border-dashed border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-muted/30 transition-all">
             + Add Team Member
          </button>
        )}
      </div>
    </div>
  );
}
