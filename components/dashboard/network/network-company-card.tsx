'use client';

import React from 'react';
import { Building2, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyFollowEntry } from '@/services/follow.service';

interface NetworkCompanyCardProps {
  entry: CompanyFollowEntry;
  onClick: (entry: CompanyFollowEntry) => void;
  onUnfollow: (companyId: string, companyName: string) => void;
}

export function NetworkCompanyCard({
  entry,
  onClick,
  onUnfollow,
}: NetworkCompanyCardProps) {
  const websiteUrl = entry.website
    ? entry.website.startsWith('http')
      ? entry.website
      : `https://${entry.website}`
    : null;

  return (
    <div
      onClick={() => onClick(entry)}
      className="p-4 bg-card border border-border/60 rounded-sm flex flex-col justify-between gap-3 shadow-sm hover:border-[#0a66c2]/50 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-sm bg-muted flex items-center justify-center overflow-hidden border border-border/50 shrink-0 group-hover:scale-105 transition-transform">
          {entry.logo_url ? (
            <img src={entry.logo_url} alt="" className="w-full h-full object-contain p-1" />
          ) : (
            <Building2 className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-[#0a66c2] transition-colors">
            {entry.company_name}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate">{entry.industry || 'Technology'}</p>
        </div>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-[#0a66c2] hover:bg-muted transition-colors cursor-pointer"
            title="Visit Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onUnfollow(entry.company, entry.company_name);
          }}
          className="flex-1 text-xs font-bold rounded-sm border-border hover:bg-muted/80 hover:text-red-500 hover:border-red-300 transition-all cursor-pointer h-8"
        >
          Following
        </Button>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2.5 h-8 bg-muted/60 hover:bg-muted border border-border rounded-sm text-xs font-bold text-foreground flex items-center gap-1 transition-all cursor-pointer"
          >
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  );
}
