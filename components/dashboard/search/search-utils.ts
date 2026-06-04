// AI match score calculation and frontend-side filtering logic

export const calculateAiMatch = (job: any, user: any) => {
  const profile = user?.profile as any;
  const userSkills = profile?.skills || [];
  const jobSkills = job?.skills?.map((s: any) => s.name) || job?.skills_required || [];

  const commonSkills = userSkills.filter((s: string) =>
    jobSkills.some((js: string) => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase()))
  );

  let score = 70; // Base score
  if (commonSkills.length > 0) {
    score += Math.min(25, commonSkills.length * 8);
  }

  const userExp = profile?.experience_years || 0;
  const jobExp = job.experience_level; // ENTRY, MID, SENIOR, LEAD
  if (jobExp === 'ENTRY' && userExp <= 2) score += 4;
  else if (jobExp === 'MID' && userExp > 2 && userExp <= 5) score += 4;
  else if (jobExp === 'SENIOR' && userExp > 5) score += 4;

  score = Math.min(98, score);

  const reasons: string[] = [];
  if (commonSkills.length > 0) {
    commonSkills.slice(0, 3).forEach((s: string) => reasons.push(`${s} Skill Matched`));
  } else if (jobSkills.length > 0) {
    const firstSkillName = jobSkills[0]?.name || jobSkills[0];
    if (firstSkillName) reasons.push(`${firstSkillName} Focus`);
  }

  if (userExp > 0) {
    reasons.push(`${userExp}+ Years Experience`);
  }
  reasons.push("ATS Score High");
  if (profile?.primary_industry === job.company?.industry) {
    reasons.push("Relevant Industry Match");
  }

  return { score, reasons };
};

// Frontend-side filtering of job results
export interface FilterParams {
  locationFilter: string;
  workModes: string[];
  experienceLevels: string[];
  jobTypes: string[];
  salaryMin: number | '';
  salaryMax: number | '';
  postedDate: string;
  industryFilter: string;
  minMatchScore: number;
  easyApplyOnly: boolean;
  dismissedIds: string[];
}

export const filterJobs = (jobsList: any[], params: FilterParams, user: any) => {
  return jobsList.filter((job: any) => {
    if (params.dismissedIds.includes(job.id)) return false;

    if (params.locationFilter.trim() && job.location) {
      if (!job.location.toLowerCase().includes(params.locationFilter.toLowerCase())) return false;
    }

    if (params.workModes.length > 0 && !params.workModes.includes(job.work_mode)) return false;
    if (params.experienceLevels.length > 0 && !params.experienceLevels.includes(job.experience_level)) return false;
    if (params.jobTypes.length > 0 && !params.jobTypes.includes(job.job_type)) return false;

    if (params.salaryMin !== '' && job.salary_max) {
      if (Number(job.salary_max) < params.salaryMin) return false;
    }
    if (params.salaryMax !== '' && job.salary_min) {
      if (Number(job.salary_min) > params.salaryMax) return false;
    }

    if (params.industryFilter.trim() && job.company?.industry) {
      if (!job.company.industry.toLowerCase().includes(params.industryFilter.toLowerCase())) return false;
    }

    if (params.postedDate) {
      const createdDate = new Date(job.created_at);
      const now = new Date();
      const diffHrs = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      if (params.postedDate === '24h' && diffHrs > 24) return false;
      if (params.postedDate === 'week' && diffHrs > 24 * 7) return false;
      if (params.postedDate === 'month' && diffHrs > 24 * 30) return false;
    }

    if (params.minMatchScore > 0) {
      const { score } = calculateAiMatch(job, user);
      if (score < params.minMatchScore) return false;
    }

    if (params.easyApplyOnly && !job.is_ai_generated) return false;

    return true;
  });
};
