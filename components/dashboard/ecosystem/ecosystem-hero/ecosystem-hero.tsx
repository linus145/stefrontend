'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Pencil } from 'lucide-react';
import { User } from '@/types/user.types';
import { userService } from '@/services/user.service';
import { uploadService } from '@/services/upload.service';
import { followService } from '@/services/follow.service';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imagekit';

import { HeroBanner } from './hero-banner';
import { HeroAvatar } from './hero-avatar';
import { HeroActions } from './hero-actions';
import { HeroTabs } from './hero-tabs';
import { HeroContactModal } from './hero-contact-modal';

interface EcosystemHeroProps {
  user: User;
  onUpdate?: () => void;
  isOwner?: boolean;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export function EcosystemHero({ user, onUpdate, isOwner = false, activeTab, onTabChange }: EcosystemHeroProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isSelf = currentUser?.id === user.id;

  // Follow query & mutation
  const { data: followData } = useQuery({
    queryKey: ['userFollow', user.id],
    queryFn: () => (user.id ? followService.getFollowCounts(user.id) : null),
    enabled: !!user.id && !isOwner && !isSelf,
  });

  const isFollowing = followData?.is_following ?? false;

  const followMutation = useMutation({
    mutationFn: (id: string) => followService.toggleFollow(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['userFollow', user.id] });
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['user-followers'] });
      queryClient.invalidateQueries({ queryKey: ['user-following'] });
      toast.success(
        res.status === 'following'
          ? `You are now following ${user.first_name} ${user.last_name}.`
          : `Unfollowed ${user.first_name} ${user.last_name}.`
      );
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to update follow status');
    },
  });

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    followMutation.mutate(user.id);
  };

  const profile = user.profile;
  const title = profile?.headline || `${user.first_name} ${user.last_name}`;
  const location = profile?.location || "Remote";
  const avatarUrl = getOptimizedImage(profile?.profile_image_url || `https://ui-avatars.com/api/?name=${user.first_name}&background=818CF8&color=fff`);
  const bannerUrl = profile?.banner_image_url ? getOptimizedImage(profile.banner_image_url) : "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000";

  const profileAny = profile as any;
  const parseWebsites = (p: any): string[] => {
    if (Array.isArray(p?.websites) && p.websites.length > 0) {
      return p.websites.filter((w: string) => Boolean(w && w.trim()));
    }
    const raw = p?.portfolio_url || p?.website || '';
    if (raw) {
      if (raw.includes(',')) {
        return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      return [raw.trim()];
    }
    return [];
  };
  const websitesList: string[] = parseWebsites(profileAny);
  const linkedinUrl = profileAny?.linkedin_url;

  // Unique LinkedIn-style profile slug & link
  const nameSlug = `${user.first_name || ''}-${user.last_name || ''}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'member';
  const uniqueSuffix = user.id ? user.id.replace(/-/g, '').slice(0, 9) : 'profile';
  const userHandle = `${nameSlug}-${uniqueSuffix}`;
  const profileDisplayLink = `b2linq.com/in/${userHandle}`;
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard?section=Profile&id=${user.id}`
    : `https://b2linq.com/dashboard?section=Profile&id=${user.id}`;

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
    <div className="relative mb-8 bg-card border border-border rounded-sm shadow-sm group/hero">
      {/* Hidden file inputs */}
      <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

      {/* Banner Section */}
      <HeroBanner
        bannerUrl={bannerUrl}
        isOwner={isOwner}
        onEditBannerClick={() => bannerInputRef.current?.click()}
      />

      {/* Profile Info Section */}
      <div className="px-4 sm:px-8 pb-4 sm:pb-6">
        <div className="relative flex justify-between items-start">
          <HeroAvatar
            user={user}
            avatarUrl={avatarUrl}
            isOwner={isOwner}
            isUploading={isUploading}
            onAvatarClick={() => avatarInputRef.current?.click()}
          />

          {isOwner && (
            <div className="pt-3 sm:pt-4">
              <Link
                href="/dashboard/profile/edit"
                title="Edit profile"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary border border-border text-foreground hover:bg-muted/80 hover:text-primary transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            {user.is_open_to_work && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                #OpenToWork
              </span>
            )}
            {user.is_hiring && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                #Hiring
              </span>
            )}
          </div>

          <p className="text-sm sm:text-[17px] text-foreground font-medium mb-2 opacity-90">{title}</p>

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
              <Zap className="w-4 h-4 text-primary opacity-70" />
              {location}
            </div>
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-1 text-xs sm:text-sm text-[#0a66c2] hover:underline font-semibold cursor-pointer outline-none"
            >
              Contact info
            </button>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#0a66c2] hover:underline font-semibold cursor-pointer">
              500+ connections
            </div>
          </div>

          {/* Action Buttons & Dropdown Menu */}
          <HeroActions
            isOwner={isOwner}
            isFollowing={isFollowing}
            isFollowPending={followMutation.isPending}
            onToggleFollow={handleToggleFollow}
            profileUrl={profileUrl}
            onOpenContactModal={() => setShowContactModal(true)}
          />
        </div>
      </div>

      {/* Tabs Section */}
      <HeroTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* LinkedIn-style Contact Info Modal */}
      <HeroContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        user={user}
        profileDisplayLink={profileDisplayLink}
        profileUrl={profileUrl}
        websitesList={websitesList}
        linkedinUrl={linkedinUrl}
      />
    </div>
  );
}
