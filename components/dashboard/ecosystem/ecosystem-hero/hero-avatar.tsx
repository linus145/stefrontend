import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { User } from '@/types/user.types';

interface HeroAvatarProps {
  user: User;
  avatarUrl: string;
  isOwner?: boolean;
  isUploading?: boolean;
  onAvatarClick: () => void;
}

export function HeroAvatar({ user, avatarUrl, isOwner = false, isUploading = false, onAvatarClick }: HeroAvatarProps) {
  const profile = user.profile;

  return (
    <div className="-mt-16 sm:-mt-20 md:-mt-24 relative z-10">
      <div className="relative group/avatar">
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-card border-4 border-card p-0.5 shadow-xl overflow-hidden relative">
          {isUploading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {profile?.profile_image_url ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-3xl sm:text-4xl md:text-5xl uppercase">
              {user.first_name?.[0] || 'U'}
            </div>
          )}

          {user.is_open_to_work && (
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white font-black uppercase tracking-wider text-[7px] sm:text-[9px] md:text-[10px] py-1 flex items-center justify-center select-none z-10 border-t border-emerald-400/20 shadow-md">
              Open To Work
            </div>
          )}
          {!user.is_open_to_work && user.is_hiring && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#0a66c2]/90 text-white font-black uppercase tracking-wider text-[7px] sm:text-[9px] md:text-[10px] py-1 flex items-center justify-center select-none z-10 border-t border-blue-400/20 shadow-md">
              Hiring
            </div>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={onAvatarClick}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer border-none"
            >
              <Camera className="w-8 h-8 text-white shadow-xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
