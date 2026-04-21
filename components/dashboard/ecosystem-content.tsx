import React from 'react';
import { 
  EcosystemHero, 
  EcosystemAbout, 
  EcosystemTeam, 
  EcosystemMetrics, 
  EcosystemCapTable, 
  EcosystemActivity 
} from './ecosystem';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface EcosystemContentProps {
  isCollapsed: boolean;
}

export function EcosystemContent({ isCollapsed }: EcosystemContentProps) {
  const { user, fetchProfile } = useAuth();

  if (!user) {
    return (
      <div className={cn(
        "flex-1 min-h-screen bg-background flex items-center justify-center transition-all duration-300",
        isCollapsed ? "ml-20" : "ml-60"
      )}>
        <p className="text-muted-foreground animate-pulse font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background px-8 py-8 transition-all duration-300 ease-in-out",
      isCollapsed ? "ml-20" : "ml-60"
    )}>
      <div className="max-w-[1200px] mx-auto">
        {/* Hero Section */}
        <EcosystemHero user={user} onUpdate={fetchProfile} />

        {/* Modular Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Main Left Column */}
          <div className="space-y-6">
            <EcosystemAbout user={user} />
            <EcosystemTeam user={user} />
            <EcosystemActivity user={user} />
          </div>

          {/* Sidebar Right Column */}
          <div className="space-y-6">
            <EcosystemMetrics user={user} />
            <EcosystemCapTable user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
