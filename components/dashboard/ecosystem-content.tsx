import React, { useState, useEffect } from 'react';
import {
  EcosystemHero,
  EcosystemAbout,
  EcosystemTeam,
  EcosystemMetrics,
  EcosystemCapTable,
  EcosystemActivity,
  EcosystemPosts
} from './ecosystem';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user.service';
import { User } from '@/types/user.types';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

interface EcosystemContentProps {
  isCollapsed: boolean;
  userId?: string | null;
}

export function EcosystemContent({ isCollapsed, userId }: EcosystemContentProps) {
  const { user: currentUser, fetchProfile } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Home' | 'About' | 'Posts' | 'Jobs' | 'Network'>('Home');

  const isOwner = !userId || userId === currentUser?.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (userId && userId !== currentUser?.id) {
        setLoading(true);
        try {
          const response = await userService.getUserProfile(userId);
          setProfileUser(response.data);
        } catch (error) {
          toast.error("Failed to fetch member details.");
          console.error(error);
          setProfileUser(currentUser);
        } finally {
          setLoading(false);
        }
      } else {
        setProfileUser(currentUser);
      }
    };

    loadProfile();
  }, [userId, currentUser]);

  if (!profileUser || loading) {
    return (
      <div className={cn(
        "flex-1 min-h-screen bg-background flex items-center justify-center transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-60"
      )}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-bold text-[10px] uppercase tracking-widest leading-none">Syncing Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-[#F4F2EE] dark:bg-[#06080C] px-3 sm:px-4 py-6 sm:py-8 transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:ml-20" : "lg:ml-60"
    )}>
      <div className="max-w-[1128px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Column */}
        <div className="space-y-4">
          <EcosystemHero
            user={profileUser}
            onUpdate={isOwner ? fetchProfile : undefined}
            isOwner={isOwner}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {(activeTab === 'Home' || activeTab === 'About') && (
            <EcosystemAbout user={profileUser} isOwner={isOwner} />
          )}

          {(activeTab === 'Home' || activeTab === 'Posts') && (
            <EcosystemPosts user={profileUser} isOwner={isOwner} />
          )}

          {(activeTab === 'Home' || activeTab === 'Network') && (
            <EcosystemTeam user={profileUser} isOwner={isOwner} />
          )}

          {activeTab === 'Jobs' && (
            <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-foreground mb-2">No active job listings</h3>
              <p className="text-sm text-muted-foreground">Keep an eye on this space for future opportunities.</p>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-card border border-border rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Analytics</h3>
              <span className="text-[10px] text-muted-foreground font-medium">Private to you</span>
            </div>
            <EcosystemMetrics user={profileUser} isOwner={isOwner} />
          </div>

          <div className="bg-card border border-border rounded-md p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Cap Table Highlights</h3>
            <EcosystemCapTable user={profileUser} isOwner={isOwner} />
          </div>

          <div className="bg-card border border-border rounded-md p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Promoted</h3>
            <div className="space-y-4">
              <div className="flex gap-3 scale-95 origin-left opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground leading-tight mb-0.5">Scale with B2linq AI</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Architecture your next pivot with speed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
