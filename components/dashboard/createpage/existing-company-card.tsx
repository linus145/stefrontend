'use client';

import React from 'react';
import Link from 'next/link';
import { CompanyPageDetail } from '@/services/company-page.service';
import { 
  Building2, MapPin, Users, CheckCircle2, ArrowRight, 
  ExternalLink, Briefcase, PlusCircle, ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExistingCompanyCardProps {
  company: CompanyPageDetail;
  onEdit: () => void;
  onCreateNew: () => void;
}

export function ExistingCompanyCard({ company, onEdit, onCreateNew }: ExistingCompanyCardProps) {
  const logo = company.logo_url || company.custom_logo_url;
  const banner = company.banner_url || company.custom_banner_url;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Alert Header */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3.5">
        <div className="p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Active Company Page Detected
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
              Live on Network
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            You already manage the official company page for <strong className="text-foreground">{company.company_name}</strong>. You can view your live public page, update branding, or post job openings.
          </p>
        </div>
      </div>

      {/* LinkedIn-Style Preview Hero Card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Banner Area */}
        <div className="h-40 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
          {banner ? (
            <img 
              src={banner} 
              alt={company.company_name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Building2 className="w-28 h-28 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Info Content */}
        <div className="px-5 pb-5 pt-0 relative">
          {/* Logo */}
          <div className="relative -mt-12 mb-3.5 flex justify-between items-end">
            <div className="w-22 h-22 rounded-lg border-2 border-card bg-background shadow-sm overflow-hidden flex items-center justify-center">
              {logo ? (
                <img 
                  src={logo} 
                  alt={company.company_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/dashboard/company/${company.slug}`}>
                <Button className="bg-[#0a66c2] hover:bg-[#084e96] text-white gap-1.5 font-medium text-xs rounded-md h-8">
                  View Public Page <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button variant="outline" onClick={onEdit} className="text-xs rounded-md h-8">
                Edit Page
              </Button>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-foreground">{company.company_name}</h2>
              {company.is_verified && (
                <CheckCircle2 className="w-4 h-4 text-[#0a66c2] fill-current" />
              )}
            </div>
            {company.tagline && (
              <p className="text-xs text-muted-foreground font-medium">{company.tagline}</p>
            )}
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-muted-foreground py-2.5 border-y border-border/60">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary/70" />
              {company.industry || 'Technology'}
            </span>
            {company.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary/70" />
                {company.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary/70" />
              {company.company_size || '1-10'} employees
            </span>
            <span className="font-semibold text-foreground">
              {company.followers_count || 0} followers
            </span>
            {company.active_jobs_count > 0 && (
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium rounded-full">
                {company.active_jobs_count} open jobs
              </span>
            )}
          </div>

          {/* Action Quick Links */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link 
              href={`/dashboard/company/${company.slug}`}
              className="p-3 rounded-lg border border-border/80 hover:border-primary/40 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Public URL</p>
                <p className="text-[10px] text-muted-foreground truncate">/dashboard/company/{company.slug}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={onCreateNew}
              className="p-3 rounded-lg border border-dashed border-border/80 hover:border-primary/40 bg-muted/10 hover:bg-muted/30 transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Create Another Page</p>
                <p className="text-[10px] text-muted-foreground">For another organization</p>
              </div>
              <PlusCircle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
