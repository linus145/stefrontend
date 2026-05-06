import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, ArrowUpRight, Newspaper, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { newsService, News } from '@/services/news.service';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigateNews?: (newsId: string) => void;
}

export function RightSidebar({ isCollapsed, onToggle, onNavigateNews }: RightSidebarProps) {
  const { user } = useAuth();
  const [trendingNews, setTrendingNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await newsService.getNews(1);
        // Prioritize flagged news, but fallback to recent if none are flagged
        const flagged = response.results.filter(n => n.is_top_news || n.is_trending || n.is_popular);
        const toShow = flagged.length > 0 ? flagged : response.results;
        setTrendingNews(toShow.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch trending news:", error);
      } finally {
        setLoading(false);
      }
    };
    if (!isCollapsed) fetchTrending();
  }, [isCollapsed]);

  return (
    <aside className={cn(
      "fixed right-20 top-24 h-max max-h-[calc(100vh-120px)] bg-card/80 backdrop-blur-md border border-border rounded-sm shadow-2xl flex flex-col pt-6 pb-6 z-20 hidden xl:flex w-80 px-6 overflow-y-auto scrollbar-hide"
    )}>
      <div className="flex flex-col h-full w-full">
        {/* Trending Ecosystem News */}
        <div className="mb-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">B2LINQ News</h3>
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/30" />
              </div>
            ) : trendingNews.length > 0 ? (
              trendingNews.map(news => {
                let role = "LATEST NEWS";
                if (news.is_top_news) role = "TOP NEWS";
                else if (news.is_trending) role = "TRENDING NEWS";
                else if (news.is_popular) role = "POPULAR NEWS";
                
                return (
                  <TrendingItem 
                    key={news.id}
                    label={news.short_title || news.title}
                    role={role}
                    onClick={() => onNavigateNews?.(news.id)}
                  />
                );
              })
            ) : (
              <p className="text-[10px] text-muted-foreground italic">No trending news today.</p>
            )}
          </div>
        </div>

        {/* Suggested Network */}
        <div className="mb-auto">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Network Suggestions</h3>
          <div className="space-y-6">
            <NetworkItem name="David Ross" role="Angel Investor" avatar="https://i.pravatar.cc/150?img=33" />
            <NetworkItem name="Elena Rodriguez" role="CTO @ Buildscale" avatar="https://i.pravatar.cc/150?img=44" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function TrendingItem({ label, role, onClick }: { label: string, role: string, onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer transition-all" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-foreground leading-tight mb-1 truncate">{label}</p>
          <p className="text-[10px] font-bold text-[#7C3AED]/60 uppercase tracking-tighter">{role}</p>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-[#7C3AED] transition-all shrink-0" />
    </div>
  );
}

function NetworkItem({ name, role, avatar }: { name: string, role: string, avatar: string }) {
  return (
    <div className="flex items-center justify-between group transition-all">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={avatar} alt={name} className="w-9 h-9 rounded-sm border border-border object-cover transition-transform group-hover:scale-105" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-sidebar" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground leading-none mb-1">{name}</p>
          <p className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px] opacity-70">{role}</p>
        </div>
      </div>
      <button className="w-8 h-8 rounded-sm bg-muted/40 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
        <UserPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
