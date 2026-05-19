'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrOrgService } from '@/services/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2, Plus, Users, Shield, Map, Info, Building,
  Globe, MapPin, Calendar, FileText, Loader2, Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

export function OrgTab() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'structure' | 'profile'>('structure');

  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrOrgService.getDepartments(),
  });

  const { data: designations, isLoading: desigLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: () => hrOrgService.getDesignations(),
  });

  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => hrOrgService.getOrganization(),
  });

  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    address: '',
    website: '',
    logo_url: '',
    banner_url: '',
    industry: '',
    company_size: '',
    description: '',
    founded_year: '',
  });

  useEffect(() => {
    if (organization?.data) {
      const org = organization.data;
      setFormData({
        name: org.name || '',
        tax_id: org.tax_id || '',
        address: org.address || '',
        website: org.website || '',
        logo_url: org.logo_url || '',
        banner_url: org.banner_url || '',
        industry: org.industry || '',
        company_size: org.company_size || '',
        description: org.description || '',
        founded_year: org.founded_year?.toString() || '',
      });
    }
  }, [organization]);

  const updateOrgMutation = useMutation({
    mutationFn: (data: any) => hrOrgService.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Organization profile updated successfully');
    },
    onError: () => toast.error('Failed to update organization profile'),
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
    updateOrgMutation.mutate(payload);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization & Settings</h2>
          <p className="text-sm text-muted-foreground">Manage departments, designations, and core company configuration.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted/40 p-1 rounded-sm border border-border/30 h-10 w-fit">
            <button
              onClick={() => setActiveSubTab('structure')}
              data-agent="org-subtab-structure-btn"
              className={cn(
                "px-5 py-1.5 rounded-sm text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap h-full flex items-center gap-1.5",
                activeSubTab === 'structure'
                  ? "bg-white text-[#0a66c2] shadow-sm border border-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/30"
              )}
            >
              <Building2 className="h-3.5 w-3.5" /> Structure
            </button>
            <button
              onClick={() => setActiveSubTab('profile')}
              data-agent="org-subtab-profile-btn"
              className={cn(
                "px-5 py-1.5 rounded-sm text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap h-full flex items-center gap-1.5",
                activeSubTab === 'profile'
                  ? "bg-white text-[#0a66c2] shadow-sm border border-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/30"
              )}
            >
              <Building className="h-3.5 w-3.5" /> Organization Profile
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'structure' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Departments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departments
              </h3>
              <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[10px] rounded-sm">
                {departments?.data?.results?.length || 0} Total
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments?.data?.results?.map((dept: any) => (
                <Card key={dept.id} className="bg-card/45 border-border/40 hover:bg-muted/40 transition-all cursor-pointer group rounded-sm shadow-sm hover:shadow-md hover:border-blue-500/20">
                  <CardContent className="py-2.5 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-bold tracking-tight truncate text-foreground/90">{dept.name}</h4>
                        <p className="text-[10px] font-semibold text-[#0a66c2]/80 mt-0.5">{dept.employee_count || 0} Employees</p>
                      </div>
                    </div>
                    <Button data-agent={`org-dept-info-btn-${dept.id}`} variant="ghost" size="icon" className="rounded-sm h-7 w-7 flex-shrink-0 hover:bg-blue-50/50 hover:text-blue-600">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/75" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Designations */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Designations
              </h3>
              <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[10px] rounded-sm">
                {designations?.data?.results?.length || 0} Total
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {designations?.data?.results?.map((desig: any) => (
                <Card key={desig.id} className="bg-card/45 border-border/40 hover:bg-muted/40 transition-all cursor-pointer group rounded-sm shadow-sm hover:shadow-md hover:border-blue-500/20">
                  <CardContent className="py-2.5 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13px] font-bold tracking-tight truncate text-foreground/90">{desig.title}</h4>
                        <p className="text-[10px] font-semibold text-[#0a66c2]/80 mt-0.5">{desig.employee_count || 0} Assigned</p>
                      </div>
                    </div>
                    <Button data-agent={`org-desig-add-btn-${desig.id}`} variant="ghost" size="icon" className="rounded-sm h-7 w-7 flex-shrink-0 hover:bg-blue-50/50 hover:text-blue-600">
                      <Plus className="h-3.5 w-3.5 text-muted-foreground/75" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl">
          {/* Org Preview Card */}
          <div className="bg-card border border-border/40 rounded-sm overflow-hidden shadow-xl">
            <div className="h-32 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 relative">
              {formData.banner_url && (
                <img src={formData.banner_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="px-6 pb-6 -mt-8">
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 rounded-sm bg-card border-4 border-card shadow-md flex items-center justify-center overflow-hidden">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-7 h-7 text-[#0a66c2]" />
                  )}
                </div>
                <div className="pb-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground truncate">{formData.name || 'Your Organization'}</h3>
                    <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-[#0a66c2]/30 text-[#0a66c2] bg-[#0a66c2]/5 font-bold uppercase rounded-sm">
                      Active Org
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 truncate">
                    {formData.industry && <span>{formData.industry}</span>}
                    {formData.company_size && <span>• {formData.company_size} employees</span>}
                    {formData.website && (
                      <>
                        <span>•</span>
                        <a href={formData.website} target="_blank" rel="noreferrer" className="text-[#0a66c2] hover:underline flex items-center gap-0.5">
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-sm">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="name">
                      Organization Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0a66c2]/60">
                        <Building className="h-4 w-4" />
                      </div>
                      <input id="name" value={formData.name} onChange={handleChange} data-agent="org-name-input"
                        className="w-full rounded-sm bg-white border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all" required />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="website">
                      Website URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0a66c2]/60">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input id="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://..." data-agent="org-website-input"
                        className="w-full rounded-sm bg-white border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all" />
                    </div>
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="tax_id">
                      Tax ID / Registration (e.g. GSTIN, EIN)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0a66c2]/60">
                        <FileText className="h-4 w-4" />
                      </div>
                      <input id="tax_id" value={formData.tax_id} onChange={handleChange} placeholder="GSTINXXXXXX" data-agent="org-tax-id-input"
                        className="w-full rounded-sm bg-white border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all" />
                    </div>
                  </div>

                  {/* Founded Year */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="founded_year">
                      Founded Year
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0a66c2]/60">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <input id="founded_year" type="number" value={formData.founded_year} onChange={handleChange} placeholder="2020" min="1900" max={new Date().getFullYear()} data-agent="org-founded-year-input"
                        className="w-full rounded-sm bg-white border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all" />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="industry">
                      Industry
                    </label>
                    <select id="industry" value={formData.industry} onChange={handleChange} data-agent="org-industry-select"
                      className="w-full rounded-sm bg-white border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all appearance-none h-10">
                      <option value="">Select Industry</option>
                      {INDUSTRY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Company Size */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="company_size">
                      Company Size
                    </label>
                    <select id="company_size" value={formData.company_size} onChange={handleChange} data-agent="org-company-size-select"
                      className="w-full rounded-sm bg-white border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all appearance-none h-10">
                      <option value="">Select Size</option>
                      {SIZE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="address">
                      Physical Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-[#0a66c2]/60">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <textarea id="address" value={formData.address} onChange={handleChange} placeholder="123 Corporate Way, Suite 100" rows={2} data-agent="org-address-textarea"
                        className="w-full rounded-sm bg-white border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all resize-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="description">
                      About Organization / Bio
                    </label>
                    <textarea id="description" value={formData.description} onChange={handleChange} placeholder="Brief summary of your company missions, culture, or offerings..." rows={4} data-agent="org-description-textarea"
                      className="w-full rounded-sm bg-white border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all resize-none" />
                  </div>

                  {/* Logo URL */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="logo_url">
                      Logo URL
                    </label>
                    <input id="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://..." data-agent="org-logo-url-input"
                      className="w-full rounded-sm bg-white border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all" />
                  </div>

                  {/* Banner URL */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase" htmlFor="banner_url">
                      Banner URL
                    </label>
                    <input id="banner_url" value={formData.banner_url} onChange={handleChange} placeholder="https://..." data-agent="org-banner-url-input"
                      className="w-full rounded-sm bg-white border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#0a66c2]/50 focus:border-[#0a66c2]/50 outline-none shadow-sm transition-all" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/30">
                  <Button
                    type="submit"
                    disabled={updateOrgMutation.isPending}
                    data-agent="org-save-btn"
                    className="bg-[#0a66c2] text-white hover:bg-[#004182] rounded-sm font-semibold text-xs h-10 px-8 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    {updateOrgMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Organization Details</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      )}
    </div>
  );
}
