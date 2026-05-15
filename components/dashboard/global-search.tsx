import React from 'react';
import { Search, Loader2, Briefcase, Newspaper, User } from 'lucide-react';
import { searchFiltersService } from '@/services/search-filters.service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  onSectionChange: (section: any, id?: string | null) => void;
}

export function GlobalSearch({ onSectionChange }: GlobalSearchProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Debounced Search Effect
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await searchFiltersService.globalSearch(query);
          setResults(res.data);
          setShowDropdown(true);
        } catch (err) {
          console.error("Global search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults(null);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="hidden lg:flex items-center relative group/search h-9 w-64 xl:w-80 min-w-0 flex-shrink lg:ml-6">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 group-focus-within/search:text-primary transition-colors" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) {
            onSectionChange('jobs', query.trim());
            setShowDropdown(false);
          }
        }}
        placeholder="Search jobs, people, news..."
        className="w-full h-full bg-muted/30 border border-border/40 rounded-sm pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/20 focus:border-primary/30 focus:bg-background outline-none transition-all min-w-0"
      />

      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-3 h-3 animate-spin text-primary/60" />
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-card border border-border/40 rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col max-h-[60vh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Quick Search Row */}
            {query.trim().length >= 1 && (
              <button
                onClick={() => { onSectionChange('jobs', query.trim()); setShowDropdown(false); }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border/30 group"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[12px] text-muted-foreground">
                  Search for <span className="font-bold text-foreground underline decoration-primary/30">"{query}"</span>
                </span>
              </button>
            )}

            {results ? (
              <div className="divide-y divide-border/30">
                {/* Jobs Section */}
                {results.jobs?.length > 0 && (
                  <div className="py-1">
                    <div className="px-4 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Jobs</span>
                      <button onClick={() => { onSectionChange('jobs', query); setShowDropdown(false); }} className="text-[10px] font-bold text-primary hover:opacity-70">View all</button>
                    </div>
                    <div className="px-1 pb-1">
                      {results.jobs.map((job: any) => (
                        <button
                          key={job.id}
                          onClick={() => { onSectionChange('jobs', job.id); setShowDropdown(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-sm transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-sm bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                            <Briefcase className="w-3.5 h-3.5 text-primary/70" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-foreground truncate leading-none mb-1 group-hover:text-primary transition-colors">{job.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{job.company_name} • {job.location}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* People Section */}
                {results.users?.length > 0 && (
                  <div className="py-1">
                    <div className="px-4 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">People</span>
                    </div>
                    <div className="px-1 pb-1">
                      {results.users.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => { onSectionChange('Profile', item.id); setShowDropdown(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-sm transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-sm overflow-hidden shrink-0 border border-border/50">
                            {item.profile?.profile_image_url ? (
                              <img src={item.profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                {item.first_name?.[0]}{item.last_name?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-foreground truncate leading-none mb-1 group-hover:text-primary transition-colors">{item.first_name} {item.last_name}</p>
                            <p className="text-[10px] text-muted-foreground truncate italic opacity-70">{item.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights Section */}
                {results.news?.length > 0 && (
                  <div className="py-1">
                    <div className="px-4 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Insights</span>
                    </div>
                    <div className="px-1 pb-1">
                      {results.news.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => { onSectionChange('news'); setShowDropdown(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 rounded-sm transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-sm bg-sky-500/5 flex items-center justify-center shrink-0 border border-sky-500/10">
                            <Newspaper className="w-3.5 h-3.5 text-sky-600/70" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-foreground line-clamp-1 leading-none mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {results.jobs?.length === 0 &&
                  results.posts?.length === 0 &&
                  results.news?.length === 0 &&
                  results.users?.length === 0 && (
                    <div className="py-10 text-center px-6">
                      <p className="text-[12px] font-bold text-foreground mb-1">No results found</p>
                      <p className="text-[11px] text-muted-foreground">Try searching for broader terms or categories.</p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary/40 mx-auto mb-2" />
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">Searching...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
