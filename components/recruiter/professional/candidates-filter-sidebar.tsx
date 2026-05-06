import { Search, Clock, Trash2, Bookmark, SlidersHorizontal, ChevronDown, Plus, Edit2 } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface CandidatesFilterSidebarProps {
  isOpen: boolean;
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
    <div className={cn(
      "hidden lg:flex bg-white dark:bg-[#1D2226] border-r border-border overflow-y-auto sticky top-16 h-[calc(100vh-4rem)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 flex-col text-[#000000e6] dark:text-white/90 transition-all duration-500 ease-in-out overflow-x-hidden",
      isOpen ? "w-[320px] opacity-100" : "w-0 opacity-0 border-none"
    )}>
      {/* Top Actions */}
      <div className="flex items-center gap-3 p-4 border-b border-border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
        <Clock className="w-5 h-5 text-[#00000099] dark:text-white/60" />
        <span className="text-[15px] font-semibold">Search history</span>
      </div>

      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-[15px] font-semibold">Showing results for</span>
        <div className="flex items-center gap-3 text-[#00000099] dark:text-white/60">
          <button className="hover:text-foreground transition-colors" onClick={() => { setJobTitles([]); setLocations([]); setSkills([]); setSearchQuery(''); }} title="Clear all filters">
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="hover:text-foreground transition-colors" title="Save search">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-b border-border bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[15px] font-semibold">Custom filters</span>
        </div>
        <ChevronDown className="w-5 h-5 text-[#00000099] dark:text-white/60" />
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00000099] dark:text-white/60" />
          <input
            type="text"
            placeholder="Search by keywords..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-transparent border-b border-[#00000033] dark:border-white/20 pl-9 pr-4 py-2 text-[14px] focus:border-[#0A66C2] dark:focus:border-[#70B5F9] outline-none transition-all"
          />
        </div>

        {/* Spotlights */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold">Spotlights</h3>
            <button className="text-[13px] font-semibold text-[#00000099] dark:text-white/60 hover:underline">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {spotlights.map(s => (
              <div key={s} className="flex items-center gap-1.5 px-3 py-1 bg-[#E1F0FE] dark:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9] rounded-full text-[13px] font-semibold">
                {s}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E1F0FE] dark:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9] rounded-full text-[13px] font-semibold">
              Are more likely to respond
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 mt-3">
            <button className="text-[13px] text-[#0A66C2] dark:text-[#70B5F9] hover:underline font-semibold">Engaged with talent brand (657)</button>
            <button className="text-[13px] text-[#0A66C2] dark:text-[#70B5F9] hover:underline font-semibold">Have company connections (0)</button>
            <button className="text-[13px] text-[#0A66C2] dark:text-[#70B5F9] hover:underline font-semibold">Past applicants (6)</button>
          </div>
        </div>

        {/* Job Titles */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold">Job titles</h3>
            {jobTitles.length > 0 && <button onClick={() => setJobTitles([])} className="text-[13px] font-semibold text-[#00000099] dark:text-white/60 hover:underline">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {jobTitles.map(t => (
              <div key={t} className="flex items-center gap-1.5 px-3 py-1 bg-[#E1F0FE] dark:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9] rounded-full text-[13px] font-semibold">
                {t}
                <button onClick={() => setJobTitles(prev => prev.filter(x => x !== t))} className="hover:bg-[#0A66C2]/10 rounded-full transition-colors flex items-center justify-center w-4 h-4 ml-1">
                  <Plus className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="+ Add job title" 
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && titleInput) { setJobTitles([...jobTitles, titleInput]); setTitleInput(''); } }}
              className="w-full bg-transparent text-[13px] font-semibold text-[#0A66C2] dark:text-[#70B5F9] placeholder:text-[#0A66C2] dark:placeholder:text-[#70B5F9] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 mt-4 text-[12px] text-[#00000099] dark:text-white/60">
            <span>Include: <strong className="text-foreground">Current or Past</strong></span>
            <Edit2 className="w-3.5 h-3.5 cursor-pointer hover:text-foreground" />
          </div>
        </div>

        {/* Locations */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold">Locations</h3>
            {locations.length > 0 && <button onClick={() => setLocations([])} className="text-[13px] font-semibold text-[#00000099] dark:text-white/60 hover:underline">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {locations.map(l => (
              <div key={l} className="flex items-center gap-1.5 px-3 py-1 bg-[#E1F0FE] dark:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9] rounded-full text-[13px] font-semibold">
                {l}
                <button onClick={() => setLocations(prev => prev.filter(x => x !== l))} className="hover:bg-[#0A66C2]/10 rounded-full transition-colors flex items-center justify-center w-4 h-4 ml-1">
                  <Plus className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="+ Add location" 
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && locationInput) { setLocations([...locations, locationInput]); setLocationInput(''); } }}
            className="w-full bg-transparent text-[13px] font-semibold text-[#0A66C2] dark:text-[#70B5F9] placeholder:text-[#0A66C2] dark:placeholder:text-[#70B5F9] outline-none"
          />
        </div>

        {/* Skills */}
        <div className="pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold">Skills</h3>
            {skills.length > 0 && <button onClick={() => setSkills([])} className="text-[13px] font-semibold text-[#00000099] dark:text-white/60 hover:underline">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <div key={s} className="flex items-center gap-1.5 px-3 py-1 bg-[#E1F0FE] dark:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#70B5F9] rounded-full text-[13px] font-semibold">
                {s}
                <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:bg-[#0A66C2]/10 rounded-full transition-colors flex items-center justify-center w-4 h-4 ml-1">
                  <Plus className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="+ Add skill" 
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && skillInput) { setSkills([...skills, skillInput]); setSkillInput(''); } }}
            className="w-full bg-transparent text-[13px] font-semibold text-[#0A66C2] dark:text-[#70B5F9] placeholder:text-[#0A66C2] dark:placeholder:text-[#70B5F9] outline-none"
          />
        </div>

      </div>
    </div>
  );
}
