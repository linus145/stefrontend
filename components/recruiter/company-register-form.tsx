'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { jobsService } from '@/services/jobs.service';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Building2, ArrowRight, Globe, MapPin, Users, Calendar,
  Briefcase, ChevronLeft, Loader2, AlertCircle,Mail,Lock,EyeOff,Eye} from 'lucide-react';

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

export function CompanyRegisterForm() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    company_size: '1-10',
    description: '',
    website: '',
    founded_year: '',
    location: '',
    company_email: '',
    company_password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string[]> = {};
    if (!formData.company_name.trim()) newErrors.company_name = ['Company name is required'];
    if (!formData.industry.trim()) newErrors.industry = ['Industry is required'];
    
    if (!formData.company_email.trim()) newErrors.company_email = ['Company email is required'];
    if (!formData.company_password) newErrors.company_password = ['Password is required'];
    if (formData.company_password !== formData.confirmPassword) {
      newErrors.confirmPassword = ['Passwords do not match'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        founded_year: formData.founded_year ? parseInt(formData.founded_year, 10) : null,
      };
      
      if (!isAuthenticated) {
        await jobsService.registerCompany(payload);
        toast.success('Company account registered successfully!');
        window.location.href = '/recruiter';
      } else {
        await jobsService.registerCompany(payload);
        toast.success('Company registered successfully!');
        router.push('/recruiter');
      }
    } catch (error: any) {
      const fieldErrors = error?.data?.data;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(fieldErrors);
      }
      toast.error('Registration Failed', {
        description: error?.data?.message || 'Please check the form and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      <div className="relative w-full rounded-sm bg-card shadow-sm hover:shadow-md transition-shadow border border-border overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 opacity-90" />

        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Register Your Company</h2>
              <p className="text-[11px] text-muted-foreground font-medium">Start hiring the best talent</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Set up your company profile to begin posting jobs and managing applications on B2linq.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4 pt-2 pb-4 border-b border-border">
                <span className="text-xs font-bold text-foreground tracking-wide uppercase">Company Login Credentials</span>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase" htmlFor="company_email">Company Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <input id="company_email" type="email" value={formData.company_email} onChange={handleChange} placeholder="recruiter@company.com" className={`w-full rounded-sm bg-muted/50 border ${errors.company_email ? 'border-red-400' : 'border-border'} text-foreground pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none`} />
                  </div>
                  {errors.company_email && <p className="text-[10px] text-red-500">{errors.company_email[0]}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase" htmlFor="company_password">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <input id="company_password" type={showPassword ? 'text' : 'password'} value={formData.company_password} onChange={handleChange} placeholder="••••••••" className={`w-full rounded-sm bg-muted/50 border ${errors.company_password ? 'border-red-400' : 'border-border'} text-foreground pl-10 pr-10 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase" htmlFor="confirmPassword">Confirm *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                      <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`w-full rounded-sm bg-muted/50 border ${errors.confirmPassword ? 'border-red-400' : 'border-border'} text-foreground pl-10 pr-10 py-2 text-sm focus:ring-1 focus:ring-teal-500 outline-none`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500">{errors.confirmPassword[0]}</p>}
              </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="company_name">
                Company Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  id="company_name"
                  disabled={isSubmitting}
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Acme Technologies"
                  className={`w-full rounded-sm bg-muted/50 border ${errors.company_name ? 'border-red-400 ring-1 ring-red-400' : 'border-border'} text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground/70`}
                />
              </div>
              {errors.company_name && (
                <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">{errors.company_name[0]}</p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="industry">
                Industry *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                  <Briefcase className="h-4 w-4" />
                </div>
                <select
                  id="industry"
                  disabled={isSubmitting}
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full rounded-sm bg-muted/50 border ${errors.industry ? 'border-red-400 ring-1 ring-red-400' : 'border-border'} text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none`}
                >
                  <option value="">Select industry</option>
                  {INDUSTRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground/70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {errors.industry && (
                <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">{errors.industry[0]}</p>
              )}
            </div>

            {/* Company Size + Founded Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="company_size">
                  Company Size
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                    <Users className="h-4 w-4" />
                  </div>
                  <select
                    id="company_size"
                    disabled={isSubmitting}
                    value={formData.company_size}
                    onChange={handleChange}
                    className="w-full rounded-sm bg-muted/50 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none"
                  >
                    {SIZE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="founded_year">
                  Founded Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    id="founded_year"
                    type="number"
                    disabled={isSubmitting}
                    value={formData.founded_year}
                    onChange={handleChange}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full rounded-sm bg-muted/50 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="location">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  id="location"
                  disabled={isSubmitting}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Bangalore, India"
                  className="w-full rounded-sm bg-muted/50 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="website">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                  <Globe className="h-4 w-4" />
                </div>
                <input
                  id="website"
                  type="url"
                  disabled={isSubmitting}
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                  className="w-full rounded-sm bg-muted/50 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground/70"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor="description">
                About Your Company
              </label>
              <textarea
                id="description"
                disabled={isSubmitting}
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your company, mission, and culture..."
                rows={4}
                className="w-full rounded-sm bg-muted/50 border border-border text-foreground px-4 py-2.5 text-sm transition-colors focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground/70 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-teal-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-lg hover:from-teal-500 hover:to-cyan-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register Company
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/recruiter/login" className="font-medium text-foreground hover:text-teal-500 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
