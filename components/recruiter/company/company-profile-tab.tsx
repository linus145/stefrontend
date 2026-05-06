'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2, Globe, MapPin, Users, Calendar,
  Briefcase, Loader2, Save
} from 'lucide-react';
import { CompanyProfile } from '@/types/jobs.types';

interface CompanyProfileTabProps {

  company: CompanyProfile;
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'SaaS', 'AI / Machine Learning', 'FinTech', 'AgriTech', 'EdTech',
  'Real Estate', 'Manufacturing', 'Retail', 'Logistics', 'Media',
  'Consulting', 'Other',
];

const SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export function CompanyProfileTab({ company }: CompanyProfileTabProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    company_name: company.company_name || '',
    industry: company.industry || '',
    company_size: company.company_size || '1-10',
    description: company.description || '',
    website: company.website || '',
    founded_year: company.founded_year?.toString() || '',
    location: company.location || '',
    logo_url: company.logo_url || '',
    banner_url: company.banner_url || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => jobsService.updateCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-check'] });
      toast.success('Company profile updated.');
    },
    onError: () => toast.error('Failed to update company profile.'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      founded_year: formData.founded_year ? parseInt(formData.founded_year, 10) : null,
    };
    updateMutation.mutate(payload);
  };

  return (
    <div className={cn(
      "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 lg:ml-0"
    )}>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Company Profile</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Manage your company information visible to job applicants
        </p>
      </div>

      {/* Company Preview Card */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mb-8">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 relative">
          {company.banner_url && (
            <img src={company.banner_url} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="px-6 pb-6 -mt-8">
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 rounded-sm bg-card border-4 border-card shadow-md flex items-center justify-center overflow-hidden">
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-7 h-7 text-blue-500" />
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">{company.company_name}</h3>
                {company.is_genuine && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Genuine
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">{company.industry} • {company.company_size} • {company.total_jobs} jobs posted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="company_name">
              Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <input id="company_name" value={formData.company_name} onChange={handleChange}
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="industry">
              Industry
            </label>
            <select id="industry" value={formData.industry} onChange={handleChange}
              className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none">
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Company Size */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="company_size">
              Company Size
            </label>
            <select id="company_size" value={formData.company_size} onChange={handleChange}
              className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none">
              {SIZE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Founded Year */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="founded_year">
              Founded Year
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <input id="founded_year" type="number" value={formData.founded_year} onChange={handleChange}
                placeholder="2024" min="1900" max={new Date().getFullYear()}
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="location">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <input id="location" value={formData.location} onChange={handleChange} placeholder="Bangalore, India"
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="website">
              Website
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Globe className="h-4 w-4" />
              </div>
              <input id="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://yourcompany.com"
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="description">
            About Your Company
          </label>
          <textarea id="description" value={formData.description} onChange={handleChange}
            placeholder="Tell us about your company, mission, and culture..." rows={5}
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground resize-none" />
        </div>

        {/* Logo + Banner URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="logo_url">
              Logo URL
            </label>
            <input id="logo_url" type="url" value={formData.logo_url} onChange={handleChange} placeholder="https://..."
              className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="banner_url">
              Banner URL
            </label>
            <input id="banner_url" type="url" value={formData.banner_url} onChange={handleChange} placeholder="https://..."
              className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-8 py-2.5 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:shadow-lg transition-all disabled:opacity-70"
        >
          {updateMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Company Details</>
          )}
        </button>
      </form>

      <div className="h-px bg-border my-12" />

      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">HR Profile</h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Manage the HR contact person details for this company
        </p>
      </div>

      <HRProfileForm companyId={company.id} initialHR={company.hr_profile} />
    </div>
  );
}

function HRProfileForm({ companyId, initialHR }: { companyId: string, initialHR?: any }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: initialHR?.name || '',
    email: initialHR?.email || '',
    phone: initialHR?.phone || '',
    designation: initialHR?.designation || '',
    profile_image_url: initialHR?.profile_image_url || '',
  });

  const updateHRMutation = useMutation({
    mutationFn: (data: any) => jobsService.updateHRProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-check'] });
      toast.success('HR profile updated.');
    },
    onError: () => toast.error('Failed to update HR profile.'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHRMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="name">
            HR Full Name
          </label>
          <input id="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="designation">
            Designation
          </label>
          <input id="designation" value={formData.designation} onChange={handleChange} placeholder="Senior HR Manager"
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="email">
            HR Email
          </label>
          <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="hr@company.com"
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="phone">
            HR Phone
          </label>
          <input id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210"
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="profile_image_url">
            Profile Image URL
          </label>
          <input id="profile_image_url" type="url" value={formData.profile_image_url} onChange={handleChange} placeholder="https://..."
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>
      </div>

      <button
        type="submit"
        disabled={updateHRMutation.isPending}
        className="flex items-center gap-2 px-8 py-2.5 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:shadow-lg transition-all disabled:opacity-70"
      >
        {updateHRMutation.isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="w-4 h-4" /> Save HR Profile</>
        )}
      </button>
    </form>
  );
}
