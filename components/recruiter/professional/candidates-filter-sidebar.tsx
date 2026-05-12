import { Search, Clock, Trash2, Bookmark, SlidersHorizontal, ChevronDown, Plus, Edit2, X } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface CandidatesFilterSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  jobTitles: string[];
  setJobTitles: React.Dispatch<React.SetStateAction<string[]>>;
  locations: string[];
  setLocations: React.Dispatch<React.SetStateAction<string[]>>;
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  spotlights: string[];
  titleInput: string;
  setTitleInput: (val: string) => void;
  locationInput: string;
  setLocationInput: (val: string) => void;
  skillInput: string;
  setSkillInput: (val: string) => void;
  setCurrentPage: (val: number) => void;
}

export function CandidatesFilterSidebar({
  isOpen,
  onClose,
  searchQuery, setSearchQuery,
  jobTitles, setJobTitles,
  locations, setLocations,
  skills, setSkills,
  spotlights,
  titleInput, setTitleInput,
  locationInput, setLocationInput,
  skillInput, setSkillInput,
  setCurrentPage
}: CandidatesFilterSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-x-0 top-16 bottom-0 bg-black/40 z-[38] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed top-16 bottom-0 left-0 z-[39] lg:z-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#0B0F19] border-r border-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 transition-all duration-500 ease-in-out overflow-x-hidden shadow-2xl lg:shadow-none",
        isOpen 
          ? "w-[300px] sm:w-[320px] translate-x-0 opacity-100" 
          : "w-0 -translate-x-full lg:translate-x-0 lg:opacity-0 lg:border-none"
      )}>
        {/* Mobile Header with Close Button */}
        <div className="flex lg:hidden items-center justify-between p-4 border-b border-border bg-blue-500/5">
          <span className="font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            Filters
          </span>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 p-4 border-b border-border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
          <Clock className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          <span className="text-[15px] font-semibold text-foreground">Search history</span>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-[15px] font-semibold text-foreground">Showing results for</span>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button 
              className="hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/5" 
              onClick={() => { setJobTitles([]); setLocations([]); setSkills([]); setSearchQuery(''); }} 
              title="Clear all filters"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              className="hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-500/5" 
              title="Save search"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-border bg-blue-500/[0.02] dark:bg-blue-500/[0.05]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-500" />
            <span className="text-[15px] font-semibold text-foreground">Custom filters</span>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Main Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-border rounded-lg pl-9 pr-4 py-2.5 text-[14px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>

          {/* Spotlights */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-foreground">Spotlights</h3>
              <button className="text-[13px] font-semibold text-blue-500 hover:underline">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {spotlights.map(s => (
                <div key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[12px] font-semibold">
                  {s}
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[12px] font-semibold">
                Are more likely to respond
              </div>
            </div>
            <div className="flex flex-col items-start gap-2.5 mt-4">
              <button className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Engaged with talent brand (657)
              </button>
              <button className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                Have company connections (0)
              </button>
              <button className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Past applicants (6)
              </button>
            </div>
          </div>

          {/* Job Titles */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-foreground">Job titles</h3>
              {jobTitles.length > 0 && <button onClick={() => setJobTitles([])} className="text-[13px] font-semibold text-blue-500 hover:underline">Clear</button>}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {jobTitles.map(t => (
                <div key={t} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[12px] font-semibold">
                  {t}
                  <button onClick={() => setJobTitles(prev => prev.filter(x => x !== t))} className="hover:bg-blue-500/10 rounded-full transition-colors flex items-center justify-center w-4 h-4 ml-1">
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <Plus className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                placeholder="Add job title" 
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && titleInput) { setJobTitles([...jobTitles, titleInput]); setTitleInput(''); } }}
                className="w-full bg-transparent pl-6 text-[13px] font-semibold text-blue-600 dark:text-blue-400 placeholder:text-blue-500/60 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 mt-4 text-[12px] text-muted-foreground">
              <span>Include: <strong className="text-foreground">Current or Past</strong></span>
              <Edit2 className="w-3.5 h-3.5 cursor-pointer hover:text-foreground transition-colors" />
            </div>
          </div>

          {/* Locations */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-foreground">Locations</h3>
              {locations.length > 0 && <button onClick={() => setLocations([])} className="text-[13px] font-semibold text-blue-500 hover:underline">Clear</button>}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {locations.map(l => (
                <div key={l} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[12px] font-semibold">
                  {l}
                  <button onClick={() => setLocations(prev => prev.filter(x => x !== l))} className="hover:bg-blue-500/10 rounded-full transition-colors flex items-center justify-center w-4 h-4 ml-1">
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <Plus className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                placeholder="Add location" 
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && locationInput) { setLocations([...locations, locationInput]); setLocationInput(''); } }}
                className="w-full bg-transparent pl-6 text-[13px] font-semibold text-blue-600 dark:text-blue-400 placeholder:text-blue-500/60 outline-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="pb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-foreground">Skills</h3>
              {skills.length > 0 && <button onClick={() => setSkills([])} className="text-[13px] font-semibold text-blue-500 hover:underline">Clear</button>}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <div key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-full text-[12px] font-semibold">
                  {s}
                  <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:bg-blue-500/10 rounded-full transition-colors flex items-center justify-center w-4 h-4 ml-1">
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <Plus className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                placeholder="Add skill" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && skillInput) { setSkills([...skills, skillInput]); setSkillInput(''); } }}
                className="w-full bg-transparent pl-6 text-[13px] font-semibold text-blue-600 dark:text-blue-400 placeholder:text-blue-500/60 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
