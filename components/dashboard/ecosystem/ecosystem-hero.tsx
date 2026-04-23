import React from 'react';
import Link from 'next/link';
import { Plus, Zap, Share2, MoreHorizontal, Edit3, Camera, ImageIcon, Loader2 } from 'lucide-react';
import { User } from '@/types/user.types';
import { postService } from '@/services/post.service';
import { userService } from '@/services/user.service';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imagekit';
import { cn } from '@/lib/utils';

interface EcosystemHeroProps {
  user: User;
  onUpdate?: () => void;
  isOwner?: boolean;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function EcosystemHero({ user, onUpdate, isOwner = false, activeTab, onTabChange }: EcosystemHeroProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const profile = user.profile;
  const isFounder = user.role === 'FOUNDER';
  
  // Dynamic data mapping
  const title = profile?.headline || `${user.first_name} ${user.last_name}`;
  const subtitle = profile?.bio ? (profile.bio.slice(0, 100) + (profile.bio.length > 100 ? '...' : '')) : "No bio available.";
  const location = profile?.location || "Remote";
  const avatarUrl = getOptimizedImage(profile?.profile_image_url || `https://ui-avatars.com/api/?name=${user.first_name}&background=818CF8&color=fff`);
  const bannerUrl = profile?.banner_image_url ? getOptimizedImage(profile.banner_image_url) : "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000";

  const handleProfileUpdate = async (newUrl: string) => {
    try {
      await userService.updateProfile({ profile_image_url: newUrl });
      toast.success("Identity asset synchronized.");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to update profile image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file, '/profiles/banners');
      await userService.updateProfile({ banner_image_url: result.image_url });
      toast.success("Ecosystem banner synchronized.");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Banner upload failed.");
    } finally {
      setIsUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file, '/profiles/avatars');
      await handleProfileUpdate(result.image_url);
    } catch (error) {
      setIsUploading(false);
      toast.error("Transmission failed.");
    }
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };
  
  return (
    <div className="relative mb-8 bg-card border border-border rounded-lg overflow-hidden shadow-sm group/hero">
      {/* Hidden file inputs */}
      <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

      {/* Banner Section */}
      <div className="relative h-36 sm:h-48 md:h-64 overflow-hidden">
        <img 
          src={bannerUrl} 
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        
        {isOwner && (
          <div className="absolute top-4 right-4 z-20">
            <label 
              onClick={() => bannerInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/20 hover:bg-black/60 transition-all cursor-pointer text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/hero:opacity-100"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Edit Banner
            </label>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="px-4 sm:px-8 pb-4 sm:pb-6">
        <div className="relative flex justify-between items-start">
          {/* Overlapping Avatar */}
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
                      {user.first_name[0]}
                  </div>
                )}

                {isOwner && (
                  <label 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white shadow-xl" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 sm:pt-4 flex items-center gap-2 sm:gap-3 flex-wrap">
            {isOwner ? (
                <>
                  <Link 
                    href="/dashboard/profile/edit"
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all w-fit"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary border border-border text-foreground hover:bg-muted/50 transition-all shadow-sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </>
            ) : (
              <>
                <button className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />
                  <span>Follow</span>
                </button>
                <button className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-secondary border border-border text-foreground font-bold text-xs sm:text-sm shadow-sm hover:bg-muted/50 transition-all">
                  <Share2 className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary border border-border text-foreground hover:bg-muted/50 transition-all shadow-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">{user.first_name} {user.last_name}</h1>
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{user.role}</span>
          </div>
          <p className="text-sm sm:text-[17px] text-foreground font-medium mb-2 opacity-90">{title}</p>
          
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
                <Zap className="w-4 h-4 text-primary opacity-70" />
                {location}
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-500 hover:underline font-semibold cursor-pointer">
                Contact Info
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-500 hover:underline font-semibold cursor-pointer">
                194K connections
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4 sm:px-8 border-t border-border bg-card overflow-x-auto">
         <div className="flex items-center gap-4 sm:gap-8 h-12">
            {[
              { id: 'Home', label: 'Home' },
              { id: 'About', label: 'About' },
              { id: 'Posts', label: 'Posts' },
              { id: 'Jobs', label: 'Jobs' },
              { id: 'Network', label: 'Network' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "h-full border-b-2 text-[13px] font-bold transition-all active:opacity-80 px-1",
                  activeTab === tab.id 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
         </div>
      </div>
    </div>
  );
}
