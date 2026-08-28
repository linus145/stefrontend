'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Globe, Sparkles, CheckCircle2, 
  ArrowRight, Image as ImageIcon, Briefcase, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { companyPageService, CompanyPageCreatePayload } from '@/services/company-page.service';

const PAGE_TYPES = [
  { id: 'COMPANY', title: 'Company', desc: 'Small, medium, and large businesses', icon: Building2 },
  { id: 'STARTUP', title: 'Startup', desc: 'Emerging fast-growing tech ventures', icon: Sparkles },
  { id: 'EDUCATIONAL', title: 'Educational', desc: 'Schools, universities, and academies', icon: Briefcase },
];

const INDUSTRIES = [
  'Technology & Software',
  'Artificial Intelligence & ML',
  'Financial Services & Fintech',
  'Healthcare & Biotechnology',
  'E-Commerce & Retail',
  'Education & EdTech',
  'Manufacturing & Industrial',
  'Marketing & Advertising',
  'Consulting & Professional Services',
  'Media & Entertainment',
  'Real Estate & Construction',
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

interface CreatePageWizardProps {
  initialData?: Partial<CompanyPageCreatePayload>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function CreatePageWizard({ initialData, isEditing = false, onCancel }: CreatePageWizardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CompanyPageCreatePayload>({
    company_name: initialData?.company_name || '',
    slug: initialData?.slug || '',
    tagline: initialData?.tagline || '',
    page_type: initialData?.page_type || 'COMPANY',
    industry: initialData?.industry || 'Technology & Software',
    company_size: initialData?.company_size || '1-10',
    website: initialData?.website || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    founded_year: initialData?.founded_year || new Date().getFullYear(),
    logo_url: initialData?.logo_url || '',
    banner_url: initialData?.banner_url || '',
    call_to_action_label: initialData?.call_to_action_label || 'Visit website',
    call_to_action_url: initialData?.call_to_action_url || '',
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setFormData(prev => ({
      ...prev,
      company_name: name,
      slug: !isEditing ? autoSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.industry) {
      toast.error('Please select an industry');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && initialData?.slug) {
        const updated = await companyPageService.updateCompanyPage(initialData.slug, formData);
        toast.success('Company page updated successfully!');
        router.push(`/dashboard/company/${updated.slug}`);
      } else {
        const created = await companyPageService.createCompanyPage(formData);
        toast.success('Company page created successfully!');
        router.push(`/dashboard/company/${created.slug}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save company page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? 'Edit Company Page' : 'Create Company Page'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Build your company’s brand, hire top talent, and connect with professionals.
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="shrink-0 rounded-md h-8 text-xs">
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Page Type Selection */}
            {!isEditing && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Select Page Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PAGE_TYPES.map(t => {
                    const isSelected = formData.page_type === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setFormData(prev => ({ ...prev, page_type: t.id }))}
                        className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#0a66c2] bg-[#0a66c2]/5 ring-1 ring-[#0a66c2]'
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-[#0a66c2]' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Page Identity */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0a66c2]" /> Page Identity
              </h3>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Acme Corporation"
                  value={formData.company_name}
                  onChange={handleNameChange}
                  className="bg-background rounded-md text-xs h-8"
                />
              </div>

              {/* Public URL Slug */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Public Page URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-md border border-input bg-background overflow-hidden px-2.5 py-1 focus-within:ring-1 focus-within:ring-[#0a66c2] h-8">
                  <span className="text-xs text-muted-foreground select-none">b2linq.com/dashboard/company/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="acme-corporation"
                    className="flex-1 bg-transparent border-0 text-xs text-foreground focus:outline-none ml-1"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Unique identifier used for your public profile link.</p>
              </div>

              {/* Tagline */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Tagline (e.g. mission or elevator pitch)
                </label>
                <Input
                  placeholder="e.g. Innovating the future of cloud computing"
                  value={formData.tagline}
                  maxLength={120}
                  onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="bg-background rounded-md text-xs h-8"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-muted-foreground">{(formData.tagline || '').length}/120</span>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0a66c2]" /> Company Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Industry */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Industry <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:ring-1 focus:ring-[#0a66c2] focus:outline-none"
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Organization Size */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Organization Size
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={e => setFormData(prev => ({ ...prev, company_size: e.target.value }))}
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:ring-1 focus:ring-[#0a66c2] focus:outline-none"
                  >
                    {COMPANY_SIZES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-background rounded-md text-xs h-8"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Headquarters / Location
                  </label>
                  <Input
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-background rounded-md text-xs h-8"
                  />
                </div>
              </div>

              {/* Description / Overview */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  About / Overview
                </label>
                <Textarea
                  rows={3}
                  placeholder="Share what makes your company unique, your culture, and core achievements..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background text-xs rounded-md"
                />
              </div>
            </div>

            {/* Visual Branding (Logo & Banner) */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#0a66c2]" /> Visual Branding
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Logo Image URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={e => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="bg-background text-xs rounded-md h-8"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Cover Banner URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={formData.banner_url}
                    onChange={e => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                    className="bg-background text-xs rounded-md h-8"
                  />
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a66c2] hover:bg-[#084e96] text-white font-semibold py-2 rounded-md shadow-sm flex items-center justify-center gap-2 h-9 text-xs sm:text-sm"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{isEditing ? 'Save Changes' : 'Create Company Page'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Live LinkedIn Preview Column */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" /> Live Preview
              </span>
              <span className="text-[10px] text-muted-foreground">Desktop view</span>
            </div>

            {/* Mock LinkedIn Page Card */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              {/* Cover Banner */}
              <div className="h-24 w-full bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 relative overflow-hidden">
                {formData.banner_url ? (
                  <img src={formData.banner_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Building2 className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Header Box */}
              <div className="px-4 pb-4 pt-0 relative">
                {/* Logo */}
                <div className="relative -mt-7 mb-2.5">
                  <div className="w-14 h-14 rounded-lg border-2 border-card bg-background shadow-xs overflow-hidden flex items-center justify-center">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Company Name & Verification */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {formData.company_name || 'Your Company Name'}
                    </h4>
                    <CheckCircle2 className="w-3 h-3 text-[#0a66c2] fill-current shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {formData.tagline || 'Your company tagline or mission statement will appear here'}
                  </p>
                </div>

                {/* Badges */}
                <div className="mt-2 text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>{formData.industry || 'Technology'}</span>
                  <span>•</span>
                  <span>{formData.location || 'Global'}</span>
                  <span>•</span>
                  <span>{formData.company_size || '1-10'} employees</span>
                  <span>•</span>
                  <span className="font-semibold text-foreground">0 followers</span>
                </div>

                {/* Action Buttons Mock */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-3 py-1 rounded-md bg-[#0a66c2] text-white text-[11px] font-semibold flex items-center gap-1 cursor-default">
                    + Follow
                  </div>
                  <div className="px-2.5 py-1 rounded-md border border-border text-foreground text-[11px] font-medium cursor-default">
                    Visit website
                  </div>
                </div>

                {/* Mini About Teaser */}
                {formData.description && (
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <p className="text-[10px] font-semibold text-foreground mb-0.5">About</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Note box */}
            <div className="bg-muted/40 border border-border/80 rounded-md p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Once published, your company page will have dedicated <strong>Home</strong>, <strong>About</strong>, <strong>Posts</strong>, <strong>Jobs</strong>, and <strong>People</strong> tabs.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
