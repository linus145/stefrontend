'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2, Globe, MapPin, Users, Calendar,
  Briefcase, Loader2, Save, Plus, Trash2, Edit2, X, Phone, Mail, User
} from 'lucide-react';
import { CompanyProfile, CompanyHRProfile } from '@/types/jobs.types';

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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">HR Profiles</h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Manage HR contact details for this company
        </p>
      </div>

      <HRProfilesManager />
    </div>
  );
}

function HRProfilesManager() {
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState<Partial<CompanyHRProfile> | null>(null);

  const { data: hrProfilesData, isLoading } = useQuery({
    queryKey: ['company-hr-profiles'],
    queryFn: () => jobsService.getHRProfiles(),
  });

  const profiles = hrProfilesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<CompanyHRProfile>) => jobsService.createHRProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-hr-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['company-check'] });
      toast.success('HR profile created successfully.');
      setEditingProfile(null);
    },
    onError: () => toast.error('Failed to create HR profile.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompanyHRProfile> }) =>
      jobsService.updateHRProfileById(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-hr-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['company-check'] });
      toast.success('HR profile updated successfully.');
      setEditingProfile(null);
    },
    onError: () => toast.error('Failed to update HR profile.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobsService.deleteHRProfileById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-hr-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['company-check'] });
      toast.success('HR profile deleted successfully.');
    },
    onError: () => toast.error('Failed to delete HR profile.'),
  });

  const handleSave = (formData: any) => {
    if (editingProfile?.id) {
      updateMutation.mutate({ id: editingProfile.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {editingProfile ? (
        <div className="bg-card border border-border p-6 rounded-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-foreground">
              {editingProfile.id ? 'Edit HR profile' : 'Add HR profile'}
            </h3>
            <button
              onClick={() => setEditingProfile(null)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <HRProfileForm
            initialData={editingProfile}
            onSave={handleSave}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-medium">
              Manage the contact persons who represent your company on job postings
            </p>
            <button
              onClick={() => setEditingProfile({})}
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add HR profile
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-sm bg-muted/10">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h4 className="text-sm font-semibold text-foreground mb-1">No HR profiles created yet</h4>
              <p className="text-xs text-muted-foreground mb-4">Add at least one HR contact person to link to job posts.</p>
              <button
                onClick={() => setEditingProfile({})}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add HR profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-card border border-border p-5 rounded-sm hover:shadow-md transition-shadow relative flex gap-4 items-start"
                >
                  <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                    {profile.profile_image_url ? (
                      <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground truncate">{profile.name || 'No name'}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingProfile(profile)}
                          className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-muted/50 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this HR profile?')) {
                              deleteMutation.mutate(profile.id);
                            }
                          }}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-muted/50 rounded-sm transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{profile.designation || 'No designation'}</p>
                    
                    <div className="pt-2 space-y-1">
                      {profile.email && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-muted-foreground/75" />
                          <span className="truncate">{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground/75" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface HRProfileFormProps {
  initialData: Partial<CompanyHRProfile>;
  onSave: (data: any) => void;
  isPending: boolean;
}

function HRProfileForm({ initialData, onSave, isPending }: HRProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    designation: initialData.designation || '',
    profile_image_url: initialData.profile_image_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="name">
            HR Full Name
          </label>
          <input id="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="designation">
            Designation
          </label>
          <input id="designation" value={formData.designation} onChange={handleChange} placeholder="Senior HR Manager" required
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="email">
            HR Email
          </label>
          <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="hr@company.com" required
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="phone">
            HR Phone
          </label>
          <input id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required
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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-8 py-2.5 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save HR Profile</>
          )}
        </button>
      </div>
    </form>
  );
}
