import React from 'react';
import { User } from '@/types/user.types';
import { Briefcase, GraduationCap, FileText, Download, Calendar, ExternalLink } from 'lucide-react';

interface EcosystemAboutProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemAbout({ user, isOwner = false }: EcosystemAboutProps) {
  const profile = user.profile;
  const isFounder = user.role === 'FOUNDER';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        const month = parseInt(parts[1]);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${monthNames[month - 1]} ${year}`;
      }
    }
    return dateString;
  };
  
  // Dynamic tags
  const tags = isFounder 
    ? (profile && 'primary_industry' in profile ? [profile.primary_industry, ...(profile.skills || [])] : [])
    : (profile && 'preferred_industries' in profile ? profile.preferred_industries : []);

  const education = (profile as any)?.education || [];
  const experience = (profile as any)?.experience || [];
  const resumeUrl = (profile as any)?.resume_url;

  return (
    <div className="space-y-6">
      {/* Bio & Tags */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">About</h2>
          {resumeUrl && (
            <a 
              href={resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Resume
            </a>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed text-[13px] mb-6 font-normal">
          {profile?.bio || "No detailed information provided yet."}
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? tags.map((tag, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 rounded-lg bg-muted/50 border border-border text-primary text-[10px] font-semibold tracking-tight"
            >
              {tag}
            </span>
          )) : (
            <span className="text-[10px] text-muted-foreground italic">No tags associated.</span>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm transition-all hover:border-primary/20">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Experience</h2>
        </div>

        <div className="space-y-8 relative before:absolute before:left-4.5 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
          {experience.length > 0 ? experience.map((exp: any, idx: number) => (
            <div key={idx} className="relative pl-10 group">
              <div className="absolute left-0 top-1.5 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center z-10 group-hover:border-primary/50 transition-colors shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-foreground leading-none mb-1 group-hover:text-primary transition-colors">{exp.position}</h3>
                <p className="text-[13px] font-semibold text-muted-foreground mb-2">{exp.company}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-bold uppercase tracking-wider mb-3">
                  <Calendar className="w-3 h-3" />
                  {formatDate(exp.start_date)} — {formatDate(exp.end_date) || 'Present'}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed font-normal opacity-80">
                  {exp.description}
                </p>
              </div>
            </div>
          )) : (
            <div className="pl-10 text-[13px] text-muted-foreground italic">No experience details shared yet.</div>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm transition-all hover:border-primary/20">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Education</h2>
        </div>

        <div className="space-y-8">
          {education.length > 0 ? education.map((edu: any, idx: number) => (
            <div key={idx} className="flex gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-muted/40 border border-border flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                <GraduationCap className="w-6 h-6 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground truncate group-hover:text-primary transition-colors leading-tight mb-1">{edu.school}</h3>
                    <p className="text-[13px] font-medium text-muted-foreground leading-tight">{edu.degree}, {edu.field_of_study}</p>
                  </div>
                  {edu.cgpa && (
                    <div className="shrink-0 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                      <span className="text-[10px] font-bold text-green-600">GPA: {edu.cgpa}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-bold uppercase tracking-wider mt-2.5">
                  <Calendar className="w-3 h-3" />
                  {formatDate(edu.start_date)} — {formatDate(edu.end_date) || 'Present'}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-[13px] text-muted-foreground italic text-center py-4">No academic history provided.</div>
          )}
        </div>
      </div>
    </div>
  );
}
