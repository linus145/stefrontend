'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { jobsService } from '@/services/jobs.service';
import { Skill } from '@/types/jobs.types';
import { toast } from 'sonner';

import {
  Loader2, Save, ArrowLeft, User as UserIcon, MapPin,
  Globe, Shield, ImageIcon, Plus, Trash2, Briefcase,
  GraduationCap, FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user.types';
import { getOptimizedImage } from '@/lib/imagekit';
import { cn } from '@/lib/utils';

import { useAuth } from '@/hooks/useAuth';

interface ProfileEditFormProps {
  initialUser: User;
  isSettingsTab?: boolean;
}

export function ProfileEditForm({ initialUser, isSettingsTab = false }: ProfileEditFormProps) {
  const router = useRouter();
  const { fetchProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: initialUser.first_name || '',
    last_name: initialUser.last_name || '',
    email: initialUser.email || '',
    phone_number: (initialUser.phone_number || '').replace(/^\+91/, ''),
    headline: initialUser.profile?.headline || '',
    bio: initialUser.profile?.bio || '',
    location: initialUser.profile?.location || '',
    profile_image_url: initialUser.profile?.profile_image_url || '',
    banner_image_url: initialUser.profile?.banner_image_url || '',
    resume_url: (initialUser.profile as any)?.resume_url || '',
    education: (initialUser.profile as any)?.education || [],
    experience: (initialUser.profile as any)?.experience || [],
    skills: initialUser.skills || [],
    is_open_to_work: initialUser.is_open_to_work || false,
    is_hiring: initialUser.is_hiring || false,
  });

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await jobsService.getSkills();
        if (response.data) {
          setAvailableSkills(response.data);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!skillInput.trim()) {
      setFilteredSkills([]);
      return;
    }
    const query = skillInput.toLowerCase();
    const filtered = availableSkills.filter(
      skill =>
        skill.name.toLowerCase().includes(query) &&
        !formData.skills.includes(skill.name)
    );
    setFilteredSkills(filtered);
  }, [skillInput, availableSkills, formData.skills]);

  const handleSelectSkill = (skillName: string) => {
    if (formData.skills.includes(skillName)) return;
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skillName]
    }));
    setSkillInput('');
    setShowSuggestions(false);
  };

  const handleRemoveSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillName)
    }));
  };

  const handleCreateCustomSkill = async () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      toast.error('Skill already added');
      return;
    }
    const existing = availableSkills.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      handleSelectSkill(existing.name);
      return;
    }

    setIsCreatingSkill(true);
    try {
      const response = await jobsService.createSkill({ name: trimmed, category: 'IT' });
      if (response.data) {
        const newSkillObj = response.data;
        setAvailableSkills(prev => [...prev, newSkillObj]);
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkillObj.name]
        }));
        toast.success(`Custom skill "${newSkillObj.name}" created and added`);
      }
    } catch (err: any) {
      console.error('Error creating custom skill:', err);
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      toast.success(`Skill "${trimmed}" added`);
    } finally {
      setIsCreatingSkill(false);
      setSkillInput('');
      setShowSuggestions(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Email is read-only, but logic included for consistency
    if (name === 'email') return;

    if (name === 'phone_number') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (type: 'education' | 'experience', index: number, field: string, value: string) => {
    setFormData(prev => {
      const newArray = [...(prev[type] as any[])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [type]: newArray };
    });
  };

  const addArrayItem = (type: 'education' | 'experience') => {
    const newItem = type === 'education'
      ? { school: '', degree: '', field_of_study: '', start_date: '', end_date: '', cgpa: '' }
      : { company: '', position: '', start_date: '', end_date: '', description: '' };

    setFormData(prev => ({
      ...prev,
      [type]: [...(prev[type] as any[]), newItem]
    }));
  };

  const removeArrayItem = (type: 'education' | 'experience', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        ...formData,
        phone_number: formData.phone_number ? `+91${formData.phone_number}` : null
      };
      await userService.updateProfile(payload);
      toast.success('Profile updated successfully');
      await fetchProfile();
      if (!isSettingsTab) {
        router.push('/dashboard');
        router.refresh(); // Ensure the layout/other components get fresh data
      }
    } catch (error: any) {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'Please check your inputs and try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {!isSettingsTab && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-2 group w-fit"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
          )}
          <h1 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Edit Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your identity and digital presence across the B2linq platform.</p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isUpdating}
          className={cn(
            "text-primary-foreground px-6 sm:px-8 h-11 rounded-sm font-bold text-xs transition-all flex items-center gap-2 w-full sm:w-auto justify-center",
            isSettingsTab
              ? "bg-[#0a66c2] hover:bg-[#004182] shadow-lg shadow-[#0a66c2]/20"
              : "bg-primary hover:opacity-90 shadow-lg shadow-primary/20"
          )}
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-0">
        {/* Section 1: Identity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <UserIcon className={cn("w-4 h-4 shrink-0", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">Identity</h2>
            </div>
            <p className="text-xs text-muted-foreground px-1 max-w-xs leading-relaxed">
              Your basic personal details, public profile headline, and contact information.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">First Name</label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm px-4 text-xs transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Last Name</label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm px-4 text-xs transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Primary Email</label>
              <Input
                name="email"
                value={formData.email}
                readOnly
                className="h-11 bg-muted/20 border-border/50 text-muted-foreground/70 rounded-sm px-4 text-xs cursor-not-allowed border-dashed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Headline</label>
                <Input
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Founder & CEO | AI Engineer"
                  className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm px-4 text-xs transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-border/50 select-none">
                    <span className={cn("text-xs font-bold", isSettingsTab ? "text-[#0a66c2]" : "text-primary")}>+91</span>
                  </div>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="00000 00000"
                    className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm pl-16 pr-4 text-xs font-medium tracking-wide transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <Shield className={cn("w-4 h-4 opacity-70 shrink-0", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">Professional Narrative</h2>
            </div>
            <p className="text-xs text-muted-foreground px-1 max-w-xs leading-relaxed">
              A brief bio describing your professional journey, experience highlights, and key achievements.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">About</label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your professional journey and mission..."
                className="min-h-[160px] bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm p-4 text-xs leading-relaxed resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Experience */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <Briefcase className={cn("w-4 h-4 opacity-70 shrink-0", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">Experience</h2>
            </div>
            <p className="text-xs text-muted-foreground px-1 max-w-xs mb-4 leading-relaxed">
              Your professional employment history, past roles, and work achievements.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('experience')}
              className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </Button>
          </div>
          <div className="md:col-span-2 space-y-8">
            {formData.experience.map((exp: any, idx: number) => (
              <div key={idx} className="border-b border-border/40 pb-8 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center mb-4 pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Position #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('experience', idx)}
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-wider transition-all py-1 px-2 rounded-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Company</label>
                    <Input
                      value={exp.company}
                      onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Position</label>
                    <Input
                      value={exp.position}
                      onChange={(e) => handleArrayChange('experience', idx, 'position', e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Start Date</label>
                    <Input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) => handleArrayChange('experience', idx, 'start_date', e.target.value)}
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">End Date</label>
                    <Input
                      type="date"
                      value={exp.end_date}
                      onChange={(e) => handleArrayChange('experience', idx, 'end_date', e.target.value)}
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Description</label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => handleArrayChange('experience', idx, 'description', e.target.value)}
                    placeholder="Briefly describe your responsibilities and achievements..."
                    className="min-h-[100px] bg-muted/30 border-border rounded-sm p-4 text-xs leading-relaxed resize-none transition-all"
                  />
                </div>
              </div>
            ))}
            {formData.experience.length === 0 && (
              <div className="border border-border border-dashed rounded-sm p-6 text-center bg-muted/10">
                <p className="text-xs text-muted-foreground">No experience listed yet. Share your professional journey.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Education */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <GraduationCap className={cn("w-4 h-4 opacity-70 shrink-0", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">Education</h2>
            </div>
            <p className="text-xs text-muted-foreground px-1 max-w-xs mb-4 leading-relaxed">
              Your academic background, institutions, degrees, and grades.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('education')}
              className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </Button>
          </div>
          <div className="md:col-span-2 space-y-8">
            {formData.education.map((edu: any, idx: number) => (
              <div key={idx} className="border-b border-border/40 pb-8 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center mb-4 pt-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Education #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('education', idx)}
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-wider transition-all py-1 px-2 rounded-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">School/University</label>
                    <Input
                      value={edu.school}
                      onChange={(e) => handleArrayChange('education', idx, 'school', e.target.value)}
                      placeholder="University Name"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Degree</label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Technology"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Field of Study</label>
                    <Input
                      value={edu.field_of_study}
                      onChange={(e) => handleArrayChange('education', idx, 'field_of_study', e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">CGPA / Grade</label>
                    <Input
                      value={edu.cgpa}
                      onChange={(e) => handleArrayChange('education', idx, 'cgpa', e.target.value)}
                      placeholder="e.g. 9.5/10"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Start Date</label>
                    <Input
                      type="date"
                      value={edu.start_date}
                      onChange={(e) => handleArrayChange('education', idx, 'start_date', e.target.value)}
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">End Date</label>
                    <Input
                      type="date"
                      value={edu.end_date}
                      onChange={(e) => handleArrayChange('education', idx, 'end_date', e.target.value)}
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
            {formData.education.length === 0 && (
              <div className="border border-border border-dashed rounded-sm p-6 text-center bg-muted/10">
                <p className="text-xs text-muted-foreground">No education listed yet. Share your academic background.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section: Skills & Career Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <Briefcase className={cn("w-4 h-4 opacity-70 shrink-0", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">Skills & Career Status</h2>
            </div>
            <p className="text-xs text-muted-foreground px-1 max-w-xs leading-relaxed">
              Highlight your professional skills and signal your current employment preferences (such as Open to Work or Hiring).
            </p>
          </div>
          <div className="md:col-span-2 space-y-8">
            {/* Preferences */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Career Status Preferences</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Open to Work Card */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_open_to_work: !prev.is_open_to_work }))}
                  className={cn(
                    "flex flex-col items-start text-left p-4 rounded-sm border transition-all hover:bg-muted/10 relative group",
                    formData.is_open_to_work
                      ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-border bg-card/45"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      formData.is_open_to_work
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground"
                    )}>
                      {formData.is_open_to_work && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                      formData.is_open_to_work
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}>
                      #OpenToWork
                    </span>
                  </div>
                  <h4 className={cn("text-xs font-bold transition-colors", formData.is_open_to_work ? "text-emerald-600 dark:text-emerald-450" : "text-foreground")}>
                    Open to Work
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                    Let recruiters know you are actively looking for new job opportunities.
                  </p>
                </button>

                {/* Hiring Card */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_hiring: !prev.is_hiring }))}
                  className={cn(
                    "flex flex-col items-start text-left p-4 rounded-sm border transition-all hover:bg-muted/10 relative group",
                    formData.is_hiring
                      ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10"
                      : "border-border bg-card/45"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      formData.is_hiring
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-muted-foreground"
                    )}>
                      {formData.is_hiring && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                      formData.is_hiring
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    )}>
                      #Hiring
                    </span>
                  </div>
                  <h4 className={cn("text-xs font-bold transition-colors", formData.is_hiring ? "text-blue-600 dark:text-blue-450" : "text-foreground")}>
                    Actively Hiring
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                    Signal that you or your organization are looking for new talent to join.
                  </p>
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Professional Skills</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={skillInput}
                      onChange={(e) => {
                        setSkillInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search and add skills (e.g. React, Python, Django...)"
                      className="h-11 bg-muted/30 border-border rounded-sm px-4 text-xs transition-all"
                    />
                    {showSuggestions && skillInput.trim() && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 left-0 right-0 mt-1.5 bg-popover border border-border rounded-sm shadow-xl max-h-60 overflow-y-auto divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-100"
                      >
                        {filteredSkills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleSelectSkill(skill.name)}
                            className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-muted/65 transition-colors flex items-center justify-between"
                          >
                            <span>{skill.name}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              {skill.category}
                            </span>
                          </button>
                        ))}
                        {filteredSkills.length === 0 && (
                          <div className="p-3 text-center">
                            <button
                              key="create-custom-skill-btn"
                              type="button"
                              onClick={handleCreateCustomSkill}
                              disabled={isCreatingSkill}
                              className="text-[11px] font-bold text-primary hover:underline"
                            >
                              {isCreatingSkill ? 'Creating...' : `Create custom skill "${skillInput.trim()}"`}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-tight animate-in zoom-in duration-200"
                  >

                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/25 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {formData.skills.length === 0 && (
                  <p className="text-xs text-muted-foreground italic pl-1">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-border/80 last:border-b-0">
          <div>
            <div className="flex items-center gap-2 px-1 mb-2">
              <Globe className={cn("w-4 h-4 opacity-50 shrink-0", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground opacity-80">Additional Details</h2>
            </div>
            <p className="text-xs text-muted-foreground px-1 max-w-xs leading-relaxed">
              Your professional location and online resources like your resume link.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm pl-10 pr-4 text-xs transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Resume URL</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="resume_url"
                    value={formData.resume_url}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-sm pl-10 pr-4 text-xs transition-all"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className={cn("p-4 sm:p-6 border rounded-sm", isSettingsTab ? "bg-[#0a66c2]/5 border-[#0a66c2]/20" : "bg-primary/5 border border-primary/20")}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <ImageIcon className={cn("w-4 h-4 opacity-70", isSettingsTab ? "text-[#0a66c2]" : "text-primary")} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-1">Visual Identity Management</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        To maintain a seamless experience, profile photos and banner images are now managed directly from your profile page.
                        Simply click the camera icon on your profile header to update your visual assets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-8 border-t border-border mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (isSettingsTab) {
                setFormData({
                  first_name: initialUser.first_name || '',
                  last_name: initialUser.last_name || '',
                  email: initialUser.email || '',
                  phone_number: (initialUser.phone_number || '').replace(/^\+91/, ''),
                  headline: initialUser.profile?.headline || '',
                  bio: initialUser.profile?.bio || '',
                  location: initialUser.profile?.location || '',
                  profile_image_url: initialUser.profile?.profile_image_url || '',
                  banner_image_url: initialUser.profile?.banner_image_url || '',
                  resume_url: (initialUser.profile as any)?.resume_url || '',
                  education: (initialUser.profile as any)?.education || [],
                  experience: (initialUser.profile as any)?.experience || [],
                  skills: initialUser.skills || [],
                  is_open_to_work: initialUser.is_open_to_work || false,
                  is_hiring: initialUser.is_hiring || false,
                });

                toast.success('Changes discarded');
              } else {
                router.back();
              }
            }}
            className="text-muted-foreground hover:text-foreground px-8 h-12 rounded-sm font-bold text-xs transition-all active:scale-95 w-full sm:w-auto"
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className={cn(
              "text-primary-foreground px-10 h-12 rounded-sm font-bold text-xs transition-all flex items-center gap-2 justify-center w-full sm:w-auto",
              isSettingsTab
                ? "bg-[#0a66c2] hover:bg-[#004182] shadow-xl shadow-[#0a66c2]/20"
                : "bg-primary hover:opacity-90 shadow-xl shadow-primary/20"
            )}
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
