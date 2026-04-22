import React from 'react';
import { User } from '@/types/user.types';

interface EcosystemAboutProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemAbout({ user, isOwner = false }: EcosystemAboutProps) {
  const profile = user.profile;
  const isFounder = user.role === 'FOUNDER';
  
  // Dynamic tags
  const tags = isFounder 
    ? (profile && 'primary_industry' in profile ? [profile.primary_industry, ...(profile.skills || [])] : [])
    : (profile && 'preferred_industries' in profile ? profile.preferred_industries : []);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm transition-all hover:border-primary/20">
      <h2 className="text-lg font-semibold text-foreground tracking-tight mb-4">About</h2>
      <p className="text-muted-foreground leading-relaxed text-[13px] mb-6 font-normal">
        {profile?.bio || "No detailed information provided yet. Update your profile to share your story with the ecosystem."}
      </p>

      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? tags.map((tag, idx) => (
          <span 
            key={idx}
            className="px-3 py-1 rounded-lg bg-muted/50 border border-border text-primary text-[10px] font-semibold tracking-tight"
          >
            {tag}
          </span>
        )) : (
          <span className="text-[10px] text-muted-foreground italic">No tags associated.</span>
        )}
      </div>
    </div>
  );
}
