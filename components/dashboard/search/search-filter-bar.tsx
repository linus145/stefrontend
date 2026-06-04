'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, X, MapPin } from 'lucide-react';
import { dateOptions, modeOptions, expOptions, typeOptions, getKeywordSuggestions } from './search-constants';

interface SearchFilterBarProps {
  localSearch: string;
  setLocalSearch: (v: string) => void;
  setActiveSearch: (v: string) => void;
  saveRecentSearch: (q: string) => void;
  activeSearch: string;
  activeDropdown: string | null;
  setActiveDropdown: (v: string | null) => void;
  postedDate: string;
  setPostedDate: (v: string) => void;
  workModes: string[];
  setWorkModes: (v: string[]) => void;
  easyApplyOnly: boolean;
  setEasyApplyOnly: (v: boolean) => void;
  experienceLevels: string[];
  setExperienceLevels: (v: string[]) => void;
  jobTypes: string[];
  setJobTypes: (v: string[]) => void;
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  salaryMin: number | '';
  setSalaryMin: (v: number | '') => void;
  salaryMax: number | '';
  setSalaryMax: (v: number | '') => void;
  setIndustryFilter: (v: string) => void;
}

export function SearchFilterBar(props: SearchFilterBarProps) {
  const {
    localSearch, setLocalSearch, setActiveSearch, saveRecentSearch, activeSearch,
    activeDropdown, setActiveDropdown,
    postedDate, setPostedDate,
    workModes, setWorkModes,
    easyApplyOnly, setEasyApplyOnly,
    experienceLevels, setExperienceLevels,
    jobTypes, setJobTypes,
    locationFilter, setLocationFilter,
    salaryMin, setSalaryMin, salaryMax, setSalaryMax,
    setIndustryFilter,
  } = props;

  const hasAnyFilter = locationFilter || workModes.length > 0 || experienceLevels.length > 0 || jobTypes.length > 0 || salaryMin || salaryMax || postedDate || easyApplyOnly;

  const handleKeywordClick = (kw: string) => {
    setLocalSearch(kw);
    setActiveSearch(kw);
    saveRecentSearch(kw);
  };

  return (
    <>
      {/* ================= HEADER BAR: SEARCH + HORIZONTAL FILTERS ================= */}
      <div className="bg-card border-b border-border shadow-sm py-2 px-4 space-y-2 z-50 shrink-0 relative">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Compact Input */}
          <div className="relative w-full lg:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search title, company, skills..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveSearch(localSearch);
                  saveRecentSearch(localSearch);
                }
              }}
              className="w-full h-7.5 pl-8 pr-7 bg-muted/30 border border-border/80 rounded-sm text-[11.5px] text-foreground focus:ring-1 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]/40 focus:bg-background outline-none transition-all"
            />
            {localSearch && (
              <button onClick={() => { setLocalSearch(''); setActiveSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal filter pills */}
          <div className="flex-1 flex items-center gap-2 flex-wrap pb-1 lg:pb-0 select-none">
            <button className="h-7 px-3 rounded-sm bg-[#0f7648] hover:bg-[#0c5d39] text-white text-[11.5px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer">
              <span>Jobs</span>
              <ChevronDown className="w-3 h-3 text-white/90" />
            </button>

            {/* Date Posted */}
            <FilterDropdown
              id="date_posted" label="Date posted" active={!!postedDate}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            >
              <div className="space-y-2">
                {dateOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                    <input type="radio" name="postedDate" checked={postedDate === opt.value} onChange={() => setPostedDate(opt.value)} className="text-[#0a66c2] focus:ring-0 cursor-pointer" />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <DropdownFooter onReset={() => { setPostedDate(''); setActiveDropdown(null); }} onDone={() => setActiveDropdown(null)} />
            </FilterDropdown>

            {/* Remote Work Mode */}
            <FilterDropdown
              id="work_mode" label="Remote" active={workModes.length > 0}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            >
              <CheckboxGroup options={modeOptions} selected={workModes} onChange={setWorkModes} />
              <DropdownFooter onReset={() => { setWorkModes([]); setActiveDropdown(null); }} onDone={() => setActiveDropdown(null)} />
            </FilterDropdown>

            {/* Easy Apply Toggle */}
            <button
              onClick={() => setEasyApplyOnly(!easyApplyOnly)}
              className={cn("h-7 px-2.5 rounded-sm border text-[11px] font-medium transition-all shrink-0 cursor-pointer", easyApplyOnly ? "bg-[#0a66c2] border-[#0a66c2] text-white" : "bg-card border-border text-foreground hover:bg-muted")}
            >
              Easy Apply
            </button>

            {/* Experience Level */}
            <FilterDropdown
              id="experience" label="Experience level" active={experienceLevels.length > 0}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            >
              <CheckboxGroup options={expOptions} selected={experienceLevels} onChange={setExperienceLevels} />
              <DropdownFooter onReset={() => { setExperienceLevels([]); setActiveDropdown(null); }} onDone={() => setActiveDropdown(null)} />
            </FilterDropdown>

            {/* Employment Type */}
            <FilterDropdown
              id="job_type" label="Employment type" active={jobTypes.length > 0}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
            >
              <CheckboxGroup options={typeOptions} selected={jobTypes} onChange={setJobTypes} />
              <DropdownFooter onReset={() => { setJobTypes([]); setActiveDropdown(null); }} onDone={() => setActiveDropdown(null)} />
            </FilterDropdown>

            {/* Location Input */}
            <FilterDropdown
              id="location" label={locationFilter ? `Location: ${locationFilter}` : 'Location'} active={!!locationFilter}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} width="w-64"
            >
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" placeholder="e.g. Bangalore, Remote" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-muted/20 border border-border/60 rounded-sm text-xs text-foreground focus:ring-1 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]/30 outline-none" />
              </div>
              <DropdownFooter onReset={() => { setLocationFilter(''); setActiveDropdown(null); }} onDone={() => setActiveDropdown(null)} doneLabel="Done" />
            </FilterDropdown>

            {/* Salary Range */}
            <FilterDropdown
              id="salary" label="Salary range" active={!!(salaryMin || salaryMax)}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} width="w-64"
            >
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-8 px-2 bg-muted/20 border border-border/60 rounded-sm text-xs text-foreground outline-none" />
                <span className="text-muted-foreground text-xs">—</span>
                <input type="number" placeholder="Max" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-8 px-2 bg-muted/20 border border-border/60 rounded-sm text-xs text-foreground outline-none" />
              </div>
              <DropdownFooter onReset={() => { setSalaryMin(''); setSalaryMax(''); setActiveDropdown(null); }} onDone={() => setActiveDropdown(null)} doneLabel="Done" />
            </FilterDropdown>

            {/* Clear All */}
            {hasAnyFilter && (
              <button
                onClick={() => { setLocationFilter(''); setWorkModes([]); setExperienceLevels([]); setJobTypes([]); setSalaryMin(''); setSalaryMax(''); setPostedDate(''); setIndustryFilter(''); setEasyApplyOnly(false); }}
                className="text-[11px] font-bold text-[#0a66c2] hover:underline shrink-0 ml-2 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= SUGGESTIONS BAR ================= */}
      <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-4 border-b border-border/40 bg-card select-none scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">Suggested:</span>
        {getKeywordSuggestions(activeSearch).map((kw) => (
          <button key={kw} onClick={() => handleKeywordClick(kw)}
            className="h-5.5 px-2 rounded-sm border border-border/75 bg-muted/10 hover:bg-muted text-[10px] font-medium text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer">
            {kw}
          </button>
        ))}
      </div>
    </>
  );
}

// ---- Reusable sub-components ----

function FilterDropdown({ id, label, active, activeDropdown, setActiveDropdown, width, children }: {
  id: string; label: string; active: boolean; activeDropdown: string | null; setActiveDropdown: (v: string | null) => void; width?: string; children: React.ReactNode;
}) {
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
        className={cn("filter-toggle-btn h-7 px-2.5 rounded-sm border text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer",
          active ? "bg-[#0a66c2]/10 border-[#0a66c2] text-[#0a66c2]" : "bg-card border-border text-foreground hover:bg-muted"
        )}
      >
        <span>{label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {activeDropdown === id && (
        <div className={cn("filter-dropdown-container absolute left-0 mt-1.5 bg-card border border-border rounded-sm shadow-xl p-4 z-40 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150", width || "w-60")}>
          {children}
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({ options, selected, onChange }: {
  options: { label: string; value: string }[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
          <input type="checkbox" checked={selected.includes(opt.value)}
            onChange={(e) => onChange(e.target.checked ? [...selected, opt.value] : selected.filter(v => v !== opt.value))}
            className="rounded-sm text-[#0a66c2] border-border focus:ring-0 cursor-pointer w-3.5 h-3.5" />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function DropdownFooter({ onReset, onDone, doneLabel }: { onReset: () => void; onDone: () => void; doneLabel?: string }) {
  return (
    <div className="flex justify-end pt-2 border-t border-border/50">
      <button onClick={onReset} className="text-[10px] font-bold text-muted-foreground hover:text-foreground mr-auto hover:underline">Reset</button>
      <button onClick={onDone} className="px-2.5 py-1 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm text-[10px] font-bold">{doneLabel || 'Show results'}</button>
    </div>
  );
}
