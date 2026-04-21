import React from 'react';
import Link from 'next/link';
import { Plus, Zap, Share2, MoreHorizontal, Edit3 } from 'lucide-react';
import { User } from '@/types/user.types';

interface EcosystemHeroProps {
  user: User;
  onUpdate: () => void;
}

export function EcosystemHero({ user, onUpdate }: EcosystemHeroProps) {
  const profile = user.profile;
  const isFounder = user.role === 'FOUNDER';
  
  // Dynamic data mapping
  const title = profile?.headline || `${user.first_name} ${user.last_name}`;
  const subtitle = profile?.bio ? (profile.bio.slice(0, 100) + (profile.bio.length > 100 ? '...' : '')) : "No bio available.";
  const location = profile?.location || "Remote";
  const avatarUrl = profile?.profile_image_url || `https://i.pravatar.cc/150?u=${user.id}`;
  
  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 border border-border shadow-sm group">
      {/* Background */}
      <div className="absolute inset-0 bg-sidebar/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative h-56 flex flex-col justify-end p-8">
        {/* Banner Image Overlay */}
        <div className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-black/40 via-black/10 to-transparent z-0" />
        <img 
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000" 
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 z-[-1] transition-transform duration-700 group-hover:scale-[1.02]"
        />

        <div className="flex items-end justify-between gap-6 z-10">
           <div className="flex items-end gap-6">
              {/* Logo/Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-card border border-border p-1 shadow-md backdrop-blur-md shrink-0 overflow-hidden -mb-2">
                 {profile?.profile_image_url ? (
                   <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                 ) : (
                   <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-2xl uppercase">
                      {user.first_name[0]}
                   </div>
                 )}
              </div>

              <div className="pb-1">
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-none">{title}</h1>
                    <span className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">{user.role}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                       <Zap className="w-3.5 h-3.5 text-primary opacity-70" />
                       {location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                       <Share2 className="w-3.5 h-3.5 text-primary opacity-70" />
                       Share Profile
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3 shrink-0 mb-1">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all group">
                 <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                 {isFounder ? 'New Update' : 'Follow'}
              </button>
              
              <Link 
                 href="/dashboard/profile/edit"
                 className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95"
               >
                  <Edit3 className="w-4 h-4" />
               </Link>
              
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary border border-border text-foreground hover:bg-muted/50 transition-all shadow-sm">
                 <MoreHorizontal className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
