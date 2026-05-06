'use client';

import React, { useState, useEffect } from 'react';
import { newsService, News } from '@/services/news.service';
import { Newspaper, Clock, TrendingUp, Star, Award, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedImage } from '@/lib/imagekit';

export interface NewsViewProps {
  selectedNewsId?: string | null;
}

export function NewsView({ selectedNewsId }: NewsViewProps) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'recent' | 'trending' | 'popular' | 'top'>('recent');

  const fetchNews = async (category: typeof activeCategory) => {
    setLoading(true);
    try {
      if (selectedNewsId) {
        const response = await newsService.getNewsDetail(selectedNewsId);
        setNews([response]);
      } else {
        const catParam = category === 'recent' ? undefined : category;
        const response = await newsService.getNews(1, catParam);
        setNews(response.results);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory, selectedNewsId]);

  const categories = [
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'popular', label: 'Popular', icon: Star },
    { id: 'top', label: 'Top News', icon: Award },
  ] as const;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Ecosystem News</h2>
          <p className="text-sm text-muted-foreground font-medium">Stay updated with the latest from the architectural startup ecosystem.</p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted/50"
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-sm bg-muted/5">
            <Newspaper className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No news found</h3>
            <p className="text-sm text-muted-foreground">Try switching categories or check back later.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-12">
            {news.map((item) => (
              <div 
                key={item.id}
                className="group bg-card border border-border rounded-sm overflow-hidden hover:border-[#7C3AED]/30 transition-all flex flex-col shadow-sm"
              >
                {item.media_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={getOptimizedImage(item.media_url)} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {(item.is_top_news || item.is_trending) && (
                      <div className="absolute top-3 left-3 bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-lg">
                        {item.is_top_news ? 'TOP NEWS' : 'TRENDING'}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center overflow-hidden border border-border">
                      {item.author_image_url ? (
                        <img src={item.author_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold">{item.author_first_name[0]}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      By {item.author_first_name} {item.author_last_name} • {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-tight mb-3 group-hover:text-[#7C3AED] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
