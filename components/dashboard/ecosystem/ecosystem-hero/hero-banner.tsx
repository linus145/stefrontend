import React from 'react';
import { ImageIcon } from 'lucide-react';

interface HeroBannerProps {
  bannerUrl: string;
  isOwner?: boolean;
  onEditBannerClick: () => void;
}

export function HeroBanner({ bannerUrl, isOwner = false, onEditBannerClick }: HeroBannerProps) {
  return (
    <div className="relative h-36 sm:h-48 md:h-64 rounded-t-sm overflow-hidden">
      <img
        src={bannerUrl}
        alt="Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />

      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onEditBannerClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white/80 hover:text-white border border-white/20 hover:bg-black/60 transition-all cursor-pointer text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/hero:opacity-100"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Edit Banner</span>
          </button>
        </div>
      )}
    </div>
  );
}
