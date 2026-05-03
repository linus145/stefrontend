'use client';
import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Briefcase, MapPin, Globe, Clock,
  DollarSign, Tags, ChevronDown, Check, Search as SearchIcon, X
} from 'lucide-react';
import { JobPost, JobPostCreatePayload, Skill } from '@/types/jobs.types';

interface PostJobFormProps {
  isCollapsed: boolean;
  editJob: JobPost | null;
  onClose: () => void;
  onSuccess: () => void;
}

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const WORK_MODE_OPTIONS = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead / Principal' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft — Save but don\'t publish' },
  { value: 'ACTIVE', label: 'Active — Publish immediately' },
];

const HIRING_STATUS_OPTIONS = [
  { value: 'ACTIVELY_HIRING', label: 'Actively Hiring' },
  { value: 'ACTIVELY_REVIEWING', label: 'Actively Reviewing' },
];

export function PostJobForm({ isCollapsed, editJob, onClose, onSuccess }: PostJobFormProps) {
  const isEditing = !!editJob;

  const { data: skillsResponse } = useQuery({
    queryKey: ['available-skills'],
    queryFn: () => jobsService.getSkills(),
  });

  const skills = Array.isArray(skillsResponse?.data) ? skillsResponse.data : [];

  const [formData, setFormData] = useState<JobPostCreatePayload>({
    title: editJob?.title || '',
    description: editJob?.description || '',
    location: editJob?.location || '',
    job_type: editJob?.job_type || 'FULL_TIME',
    work_mode: editJob?.work_mode || 'ONSITE',
    salary_min: editJob?.salary_min || null,
    salary_max: editJob?.salary_max || null,
    currency: editJob?.currency || 'INR',
    skills: editJob?.skills?.map(s => s.id) || [],
    skills_required: editJob?.skills_required || [],
    experience_level: editJob?.experience_level || 'ENTRY',
    status: editJob?.status || 'DRAFT',
    hiring_status: editJob?.hiring_status || 'ACTIVELY_HIRING',
    deadline: editJob?.deadline ? editJob.deadline.split('T')[0] : null,
  });

  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const toggleSkill = (skillId: string) => {
    setFormData(prev => {
      const currentSkills = prev.skills || [];
      if (currentSkills.includes(skillId)) {
        return { ...prev, skills: currentSkills.filter(id => id !== skillId) };
      }
      return { ...prev, skills: [...currentSkills, skillId] };
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: JobPostCreatePayload) => jobsService.createJob(data),
    onSuccess: () => {
      toast.success('Job posted successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      const fieldErrors = error?.data?.data;
      if (fieldErrors && typeof fieldErrors === 'object') setErrors(fieldErrors);
      toast.error(error?.data?.message || 'Failed to create job.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<JobPostCreatePayload>) => jobsService.updateJob(editJob!.id, data),
    onSuccess: () => {
      toast.success('Job updated successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      const fieldErrors = error?.data?.data;
      if (fieldErrors && typeof fieldErrors === 'object') setErrors(fieldErrors);
      toast.error(error?.data?.message || 'Failed to update job.');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const itSkills = useMemo(() => skills.filter(s => s.category === 'IT' && s.name.toLowerCase().includes(skillSearch.toLowerCase())), [skills, skillSearch]);
  const nonItSkills = useMemo(() => skills.filter(s => s.category === 'NON_IT' && s.name.toLowerCase().includes(skillSearch.toLowerCase())), [skills, skillSearch]);

  const handleRemoveSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(id => id !== skillId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string[]> = {};
    if (!formData.title?.trim()) newErrors.title = ['Job title is required'];
    if (!formData.description?.trim()) newErrors.description = ['Description is required'];
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in required fields.');
      return;
    }

    const selectedSkillNames = formData.skills?.map(id => {
      const s = skills.find(sk => sk.id === id);
      return s ? s.name : null;
    }).filter(Boolean) as string[];

    const payload: JobPostCreatePayload = {
      ...formData,
      skills_required: selectedSkillNames, // Sync names for backward compatibility
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className={cn(
      "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
      isCollapsed ? "lg:ml-20" : "lg:ml-64"
    )}>
      {/* Back */}
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to My Jobs
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          {isEditing ? 'Edit Job Post' : 'Create New Job'}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {isEditing ? 'Update your job listing details.' : 'Fill in the details below to create a new job listing.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <FormField label="Job Title *" id="title" error={errors.title}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Briefcase className="h-4 w-4" />
              </div>
              <input
                id="title"
                disabled={isSubmitting}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                className={cn("w-full rounded-sm bg-muted/30 border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground transition-colors", errors.title ? 'border-red-400' : 'border-border')}
              />
            </div>
          </FormField>

          {/* Description */}
          <FormField label="Job Description *" id="description" error={errors.description}>
            <textarea
              id="description"
              disabled={isSubmitting}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and qualifications..."
              rows={6}
              className={cn("w-full rounded-sm bg-muted/30 border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground resize-none transition-colors", errors.description ? 'border-red-400' : 'border-border')}
            />
          </FormField>

          {/* Job Type + Work Mode */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Job Type" id="job_type">
              <SelectField id="job_type" value={formData.job_type!} onChange={handleChange} options={JOB_TYPE_OPTIONS} disabled={isSubmitting} />
            </FormField>
            <FormField label="Work Mode" id="work_mode">
              <SelectField id="work_mode" value={formData.work_mode!} onChange={handleChange} options={WORK_MODE_OPTIONS} disabled={isSubmitting} />
            </FormField>
          </div>

          {/* Experience + Location */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Experience Level" id="experience_level">
              <SelectField id="experience_level" value={formData.experience_level!} onChange={handleChange} options={EXPERIENCE_OPTIONS} disabled={isSubmitting} />
            </FormField>
            <FormField label="Location" id="location">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  id="location"
                  disabled={isSubmitting}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Bangalore, India"
                  className="w-full rounded-sm bg-muted/30 border border-border text-foreground pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground"
                />
              </div>
            </FormField>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Min Salary" id="salary_min">
              <input
                id="salary_min"
                type="number"
                disabled={isSubmitting}
                value={formData.salary_min ?? ''}
                onChange={handleChange}
                placeholder="30000"
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground"
              />
            </FormField>
            <FormField label="Max Salary" id="salary_max">
              <input
                id="salary_max"
                type="number"
                disabled={isSubmitting}
                value={formData.salary_max ?? ''}
                onChange={handleChange}
                placeholder="80000"
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground"
              />
            </FormField>
            <FormField label="Currency" id="currency">
              <input
                id="currency"
                disabled={isSubmitting}
                value={formData.currency}
                onChange={handleChange}
                placeholder="INR"
                className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-muted-foreground"
              />
            </FormField>
          </div>

          {/* Categorized Skills Dropdown */}
          <FormField label="Skills Required *" id="skills" error={errors.skills}>
            <div className="relative">
              <div
                className={cn(
                  "w-full rounded-sm bg-muted/30 border border-border px-4 py-2.5 text-sm cursor-pointer flex flex-wrap gap-2 min-h-[45px]",
                  showSkillDropdown && "ring-1 ring-teal-500 border-teal-500"
                )}
                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
              >
                {(formData.skills?.length ?? 0) === 0 && (
                  <span className="text-muted-foreground">Select required skills...</span>
                )}
                {formData.skills?.map(skillId => {
                  const skill = skills.find(s => s.id === skillId);
                  return skill ? (
                    <span
                      key={skillId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider"
                      onClick={(e) => { e.stopPropagation(); handleRemoveSkill(skillId); }}
                    >
                      {skill.name}
                      <X className="w-2.5 h-2.5 hover:text-white/80" />
                    </span>
                  ) : null;
                })}
                <div className="ml-auto">
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showSkillDropdown && "rotate-180")} />
                </div>
              </div>

              {showSkillDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        className="w-full bg-muted/50 border-none pl-8 pr-3 py-1.5 text-xs outline-none rounded-sm"
                        placeholder="Search skills..."
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-4">
                    {/* IT Skills */}
                    {itSkills.length > 0 && (
                      <div>
                        <p className="px-2 text-[9px] font-black uppercase tracking-[0.2em] text-teal-600 mb-1.5">IT Skills</p>
                        <div className="space-y-0.5">
                          {itSkills.map(skill => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-sm text-xs font-medium transition-colors flex items-center justify-between",
                                formData.skills?.includes(skill.id) ? "bg-teal-500/10 text-teal-600" : "hover:bg-muted text-foreground/80"
                              )}
                            >
                              {skill.name}
                              {formData.skills?.includes(skill.id) && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Non-IT Skills */}
                    {nonItSkills.length > 0 && (
                      <div>
                        <p className="px-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-600 mb-1.5">Non-IT Skills</p>
                        <div className="space-y-0.5">
                          {nonItSkills.map(skill => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-sm text-xs font-medium transition-colors flex items-center justify-between",
                                formData.skills?.includes(skill.id) ? "bg-cyan-500/10 text-cyan-600" : "hover:bg-muted text-foreground/80"
                              )}
                            >
                              {skill.name}
                              {formData.skills?.includes(skill.id) && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {itSkills.length === 0 && nonItSkills.length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-xs text-muted-foreground italic">No skills found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showSkillDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowSkillDropdown(false)} />}
          </FormField>

          {/* Deadline */}
          <FormField label="Application Deadline" id="deadline">
            <input
              id="deadline"
              type="date"
              disabled={isSubmitting}
              value={formData.deadline ?? ''}
              onChange={handleChange}
              className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </FormField>

          {/* Status & Hiring Status */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Publish Status" id="status">
              <SelectField
                id="status"
                value={formData.status!}
                onChange={handleChange}
                options={isEditing ? [...STATUS_OPTIONS, { value: 'CLOSED', label: 'Closed — Stop accepting applications' }] : STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </FormField>
            <FormField label="Hiring Status" id="hiring_status">
              <SelectField
                id="hiring_status"
                value={formData.hiring_status!}
                onChange={handleChange}
                options={HIRING_STATUS_OPTIONS}
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-sm border border-border text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-sm hover:shadow-lg transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                isEditing ? 'Update Job' : 'Post Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, id, error, children }: {
  label: string;
  id: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
          {error[0]}
        </p>
      )}
    </div>
  );
}

function SelectField({ id, value, onChange, options, disabled }: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
