import React from 'react';
import Link from 'next/link';
import {
  Edit3,
  MoreHorizontal,
  Plus,
  Check,
  Share2,
  Send,
  Download,
  Flag,
  Info,
  UserMinus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface HeroActionsProps {
  isOwner?: boolean;
  isFollowing?: boolean;
  isFollowPending?: boolean;
  onToggleFollow: (e: React.MouseEvent) => void;
  profileUrl: string;
  onOpenContactModal: () => void;
}

export function HeroActions({
  isOwner = false,
  isFollowing = false,
  isFollowPending = false,
  onToggleFollow,
  profileUrl,
  onOpenContactModal
}: HeroActionsProps) {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  return (
    <div className="pt-4 flex items-center gap-2 sm:gap-3 flex-wrap">
      {isOwner ? (
        <>
          <div className="relative z-50" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary border border-border text-foreground hover:bg-muted/80 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(profileUrl);
                      toast.success('Profile link copied!');
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Send className="w-4 h-4 text-muted-foreground" />
                  <span>Send profile in a message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <span>Save to PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenContactModal();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span>About this member</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onToggleFollow}
            disabled={isFollowPending}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2 rounded-[2px] font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50",
              isFollowing
                ? "bg-secondary border border-border text-foreground hover:bg-muted/80 hover:border-red-400 hover:text-red-500"
                : "bg-[#0a66c2] text-white hover:bg-[#084e96] border border-transparent"
            )}
          >
            {isFollowPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Follow</span>
              </>
            )}
          </button>
          <button className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-[2px] bg-secondary border border-border text-foreground font-bold text-xs sm:text-sm shadow-sm hover:bg-muted/50 transition-all cursor-pointer">
            <Share2 className="w-4 h-4" />
            <span>Message</span>
          </button>
          <div className="relative z-50" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary border border-border text-foreground hover:bg-muted/80 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(profileUrl);
                      toast.success('Profile link copied! Share it in any message.');
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Send className="w-4 h-4 text-muted-foreground" />
                  <span>Send profile in a message</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                  <span>Save to PDF</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    setShowMoreMenu(false);
                    onToggleFollow(e);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 text-muted-foreground" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    toast.info('Thank you for your feedback. Our safety team has been notified.');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <span>Report / Block</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenContactModal();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground font-semibold hover:bg-muted/70 transition-colors text-left"
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span>About this member</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
