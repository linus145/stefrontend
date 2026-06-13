'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchFiltersService } from '@/services/search-filters.service';
import { jobsService } from '@/services/jobs.service';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/hooks/useAuth';
import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ApplyModal } from '../jobs/apply-modal';
import { PAGE_SIZE } from './search-constants';
import { filterJobs } from './search-utils';
import { SearchFilterBar } from './search-filter-bar';
import { SearchJobList } from './search-job-list';
import { SearchJobDetail } from './search-job-detail';
import { SearchMobileDetail } from './search-mobile-detail';

interface SearchResultsPageProps {
  searchQuery: string;
  onSectionChange: (section: any, id?: string | null) => void;
}

export function SearchResultsPage({ searchQuery, onSectionChange }: SearchResultsPageProps) {
  const { user, userSubscription } = useAuth();
  const queryClient = useQueryClient();
  const isPremium = !!(userSubscription && userSubscription.status === 'active' && userSubscription.plan_details && Number(userSubscription.plan_details.price) > 0);

  // --- Search & Filtering States ---
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [activeSearch, setActiveSearch] = useState(searchQuery);
  const [locationFilter, setLocationFilter] = useState('');
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [postedDate, setPostedDate] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);

  // Layout & UI States
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Saved Jobs queries & mutations
  const { data: savedJobIdsResponse, refetch: refetchSavedIds } = useQuery({
    queryKey: ['saved-job-ids'],
    queryFn: () => jobsService.getSavedJobIds(),
  });
  const savedJobIds = savedJobIdsResponse?.data || [];

  // Local Storage states (Recently viewed, recent searches)
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Reset page to 1 when filters or search changes
  useEffect(() => { setCurrentPage(1); }, [activeSearch, locationFilter, workModes, experienceLevels, jobTypes, salaryMin, salaryMax, easyApplyOnly, postedDate]);

  useEffect(() => { setLocalSearch(searchQuery); setActiveSearch(searchQuery); if (searchQuery.trim()) saveRecentSearch(searchQuery.trim()); }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewed = localStorage.getItem('b2linq_recently_viewed_jobs'); if (viewed) setRecentlyViewedIds(JSON.parse(viewed));
      const searches = localStorage.getItem('b2linq_recent_searches'); if (searches) setRecentSearches(JSON.parse(searches));
    }
  }, []);

  // Click outside to close active filter dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.filter-toggle-btn') || target.closest('.filter-dropdown-container')) return;
      setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Utility functions ---
  const saveRecentSearch = (query: string) => {
    if (typeof window !== 'undefined') {
      const searches = localStorage.getItem('b2linq_recent_searches');
      let arr = searches ? JSON.parse(searches) : [];
      arr = [query, ...arr.filter((s: string) => s !== query)].slice(0, 8);
      localStorage.setItem('b2linq_recent_searches', JSON.stringify(arr));
      setRecentSearches(arr);
    }
  };

  const toggleSaveJobMutation = useMutation({
    mutationFn: (jobId: string) => jobsService.toggleSaveJob(jobId),
    onSuccess: (res) => {
      const isSaved = res.data?.saved;
      toast.success(isSaved ? 'Job saved!' : 'Job unsaved.');
      refetchSavedIds();
      queryClient.invalidateQueries({ queryKey: ['saved-job-ids'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: () => {
      toast.error('Failed to update saved job.');
    }
  });

  const toggleSaveJob = (jobId: string) => {
    toggleSaveJobMutation.mutate(jobId);
  };

  const addToRecentlyViewed = (jobId: string) => {
    const updated = [jobId, ...recentlyViewedIds.filter(id => id !== jobId)].slice(0, 20);
    setRecentlyViewedIds(updated);
    if (typeof window !== 'undefined') localStorage.setItem('b2linq_recently_viewed_jobs', JSON.stringify(updated));
  };

  const handleDismissJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds(prev => [...prev, jobId]);
    toast.info("Job listing hidden.");
    if (selectedJobId === jobId) {
      const nextJob = filteredJobs.find((j: any) => j.id !== jobId && !dismissedIds.includes(j.id));
      setSelectedJobId(nextJob ? nextJob.id : null);
    }
  };

  const shareJob = (job: any) => {
    if (typeof window !== 'undefined') { navigator.clipboard.writeText(`${window.location.origin}/dashboard?section=jobs&id=${job.id}`); toast.success('Job link copied to clipboard!'); }
  };

  // --- API Queries ---
  const { data: rawJobsResponse, isLoading, isFetching } = useQuery({
    queryKey: ['public-jobs-search-page', activeSearch, locationFilter, workModes, experienceLevels, jobTypes, salaryMin, salaryMax, easyApplyOnly, postedDate, currentPage],
    queryFn: () => searchFiltersService.searchJobsPaginated({
      search: activeSearch || undefined, location: locationFilter.trim() || undefined,
      work_mode: workModes.join(',') || undefined, experience_level: experienceLevels.join(',') || undefined,
      job_type: jobTypes.join(',') || undefined, salary_min: salaryMin || undefined, salary_max: salaryMax || undefined,
      easy_apply: easyApplyOnly ? 'true' : undefined, posted_date: postedDate || undefined,
      page: currentPage, page_size: PAGE_SIZE
    }),
    placeholderData: (prev) => prev,
    enabled: !savedOnly,
  });

  const { data: savedJobsResponse } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => jobsService.getSavedJobs(),
    enabled: savedOnly,
  });
  const savedJobsList = savedJobsResponse?.data || [];

  const jobsList = savedOnly
    ? savedJobsList
    : (Array.isArray(rawJobsResponse?.results) ? rawJobsResponse.results : (Array.isArray(rawJobsResponse?.data) ? rawJobsResponse.data : []));

  const totalCount = savedOnly ? jobsList.length : (rawJobsResponse?.count ?? jobsList.length);
  const totalPages = savedOnly ? 1 : Math.ceil(totalCount / PAGE_SIZE);
  const hasNextPage = savedOnly ? false : !!rawJobsResponse?.next;
  const hasPrevPage = savedOnly ? false : (!!rawJobsResponse?.previous || currentPage > 1);

  const { data: jobDetailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ['job-detail-search-page', selectedJobId],
    queryFn: () => jobsService.getJobDetail(selectedJobId || ''),
    enabled: !!selectedJobId,
  });
  const selectedJob = jobDetailResponse?.data || null;

  const { data: appsResponse } = useQuery({ queryKey: ['my-applications-search-page'], queryFn: () => searchFiltersService.searchApplications({}) });
  const applicationsList = Array.isArray(appsResponse?.data) ? appsResponse.data : [];
  const hasApplied = selectedJob ? applicationsList.some((app: any) => app.job === selectedJob.id) : false;

  useEffect(() => {
    if (jobsList.length > 0) {
      if (!selectedJobId || !jobsList.some((j: any) => j.id === selectedJobId)) {
        setSelectedJobId(jobsList[0].id);
      }
    } else {
      setSelectedJobId(null);
    }
  }, [jobsList, selectedJobId]);

  const filteredJobs = filterJobs(jobsList, { locationFilter, workModes, experienceLevels, jobTypes, salaryMin, salaryMax, postedDate, industryFilter, minMatchScore, easyApplyOnly, dismissedIds }, user);

  // --- Mutations ---
  const applyMutation = useMutation({
    mutationFn: (data: { jobId: string; resume_url: string; cover_letter: string }) => jobsService.applyToJob(data.jobId, { resume_url: data.resume_url, cover_letter: data.cover_letter }),
    onSuccess: () => { toast.success('Application submitted successfully!'); setIsApplyModalOpen(false); setResumeUrl(''); setCoverLetter(''); setExpectedSalary(''); queryClient.invalidateQueries({ queryKey: ['job-detail-search-page'] }); queryClient.invalidateQueries({ queryKey: ['my-applications-search-page'] }); },
    onError: (error: any) => { toast.error(error.response?.data?.message || error.message || 'Failed to submit application.'); }
  });

  const handleApplySubmit = () => {
    if (!selectedJob) return;
    applyMutation.mutate({ jobId: selectedJob.id, resume_url: resumeUrl, cover_letter: expectedSalary ? `[Expected: ₹${expectedSalary}]\n\n${coverLetter}` : coverLetter });
  };

  const handleEasyApply = () => { if (!selectedJob) return; applyMutation.mutate({ jobId: selectedJob.id, resume_url: '', cover_letter: 'Applied via B2 Apply using profile details.' }); };

  const handleMessageRecruiter = async (recruiterId: string) => {
    if (!recruiterId) { toast.info("Hiring manager details are pending for this startup. We have notified their HR team."); return; }
    try { await chatService.sendDirectMessage(recruiterId); onSectionChange('messages', recruiterId); toast.success('Direct chat opened with hiring team!'); } catch { toast.error('Failed to open chat with recruiter.'); }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden bg-card border border-border rounded-sm shadow-sm"
      style={{ '--radius-sm': '6px', '--radius-md': '8px', '--radius-lg': '10px', '--radius': '10px' } as React.CSSProperties}>

      <SearchFilterBar
        localSearch={localSearch} setLocalSearch={setLocalSearch} setActiveSearch={setActiveSearch} saveRecentSearch={saveRecentSearch} activeSearch={activeSearch}
        activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
        postedDate={postedDate} setPostedDate={setPostedDate} workModes={workModes} setWorkModes={setWorkModes}
        easyApplyOnly={easyApplyOnly} setEasyApplyOnly={setEasyApplyOnly}
        savedOnly={savedOnly} setSavedOnly={setSavedOnly}
        experienceLevels={experienceLevels} setExperienceLevels={setExperienceLevels}
        jobTypes={jobTypes} setJobTypes={setJobTypes} locationFilter={locationFilter} setLocationFilter={setLocationFilter}
        salaryMin={salaryMin} setSalaryMin={setSalaryMin} salaryMax={salaryMax} setSalaryMax={setSalaryMax} setIndustryFilter={setIndustryFilter}
      />

      {/* Sub-header bar */}
      <div className="bg-background border-b border-border/60 py-1.5 px-4 flex items-center justify-between text-[11px] text-muted-foreground shrink-0 select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-foreground">{isLoading ? 'Searching...' : `${totalCount.toLocaleString()} results`}</span>
          {locationFilter && <span>in <span className="font-semibold text-foreground underline decoration-[#0a66c2]/40">{locationFilter}</span></span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 hover:text-foreground cursor-pointer"><span className="text-[10px] font-medium">How promoted jobs are ranked</span><HelpCircle className="w-3 h-3" /></div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0a66c2] bg-[#0a66c2]/5 px-2 py-0.5 rounded-sm border border-[#0a66c2]/10">AI-powered</span>
        </div>
      </div>

      {/* Main split-pane layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <div className="w-full lg:w-[320px] xl:w-[380px] h-full overflow-y-auto bg-card border-r border-border shrink-0 scrollbar-thin select-none relative">
          <SearchJobList isLoading={isLoading} isFetching={isFetching} filteredJobs={filteredJobs}
            selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId}
            addToRecentlyViewed={addToRecentlyViewed} setMobileDetailOpen={setMobileDetailOpen} handleDismissJob={handleDismissJob}
            currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} hasNextPage={hasNextPage} hasPrevPage={hasPrevPage} />
        </div>
        <div className="hidden lg:block flex-1 h-full overflow-y-auto bg-card scrollbar-thin select-none">
          <SearchJobDetail selectedJob={selectedJob} isDetailLoading={isDetailLoading} hasApplied={hasApplied} isPremium={isPremium}
            savedJobIds={savedJobIds} applyIsPending={applyMutation.isPending}
            handleEasyApply={handleEasyApply} onOpenApplyModal={() => setIsApplyModalOpen(true)}
            toggleSaveJob={toggleSaveJob} shareJob={shareJob} handleMessageRecruiter={handleMessageRecruiter} onSectionChange={onSectionChange} />
        </div>
      </div>

      {/* Mobile fullscreen detail */}
      {mobileDetailOpen && selectedJob && (
        <SearchMobileDetail selectedJob={selectedJob} user={user} savedJobIds={savedJobIds} applyIsPending={applyMutation.isPending}
          handleEasyApply={handleEasyApply} onOpenApplyModal={() => setIsApplyModalOpen(true)}
          toggleSaveJob={toggleSaveJob} shareJob={shareJob} handleMessageRecruiter={handleMessageRecruiter} onClose={() => setMobileDetailOpen(false)} />
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJob && (
        <ApplyModal job={selectedJob} resumeUrl={resumeUrl} setResumeUrl={setResumeUrl} coverLetter={coverLetter} setCoverLetter={setCoverLetter}
          expectedSalary={expectedSalary} setExpectedSalary={setExpectedSalary} isPending={applyMutation.isPending}
          onClose={() => setIsApplyModalOpen(false)} onSubmit={handleApplySubmit} />
      )}
    </div>
  );
}
