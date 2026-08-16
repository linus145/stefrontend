'use client';

import React from 'react';
import { 
  Building2, Globe, ExternalLink, X, MapPin, Users, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyFollowEntry } from '@/services/follow.service';

interface CompanyDetailModalProps {
  company: CompanyFollowEntry | null;
  onClose: () => void;
  onUnfollow: (companyId: string, companyName: string) => void;
}

export function CompanyDetailModal({
  company,
  onClose,
  onUnfollow,
}: CompanyDetailModalProps) {
  if (!company) return null;

  const websiteUrl = company.website
    ? company.website.startsWith('http')
      ? company.website
      : `https://${company.website}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-sm shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative">
          {company.banner_url && (
            <img src={company.banner_url} alt="" className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-sm bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Company Info Header */}
        <div className="px-5 pt-0 pb-5 -mt-8 relative">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div className="w-16 h-16 rounded-sm bg-card border-2 border-background shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUnfollow(company.company, company.company_name)}
                className="rounded-sm text-xs font-bold border-border hover:bg-muted/80 hover:text-red-500 hover:border-red-300 transition-all cursor-pointer h-8"
              >
                Following
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">{company.company_name}</h3>
            <p className="text-xs font-semibold text-[#0a66c2] mt-0.5">{company.industry || 'Technology & Services'}</p>

            {/* Meta details */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2 flex-wrap font-medium">
              {company.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  {company.location}
                </span>
              )}
              {company.company_size && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  {company.company_size} employees
                </span>
              )}
              {company.founded_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  Founded {company.founded_year}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">About</h4>
            <p className="text-xs text-foreground/80 leading-relaxed font-normal whitespace-pre-wrap">
              {company.description || `${company.company_name} is dedicated to delivering innovative solutions and empowering businesses worldwide.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
