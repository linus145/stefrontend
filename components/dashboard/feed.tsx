'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket, Search, Image as ImageIcon, BarChart2, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { postService } from '@/services/post.service';
import { PostCard } from './post/post-card';
import { PostModal } from './post/post-modal';
import { toast } from 'sonner';
import { Post } from '@/types/post.types';

interface FeedProps {
  isCollapsed: boolean;
  onNavigateToProfile: (userId: string) => void;
}

const PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';
const URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';

export function Feed({ isCollapsed, onNavigateToProfile }: FeedProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postService.getPosts(1),
    refetchInterval: 5000, 
  });

  // Like Mutation with Optimistic Updates
  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((post: Post) => {
            if (post.id === postId) {
              const wasLiked = post.user_has_liked;
              return {
                ...post,
                user_has_liked: !wasLiked,
                likes_count: Math.max(0, wasLiked ? post.likes_count - 1 : post.likes_count + 1)
              };
            }
            return post;
          })
        };
      });

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast.error('Failed to sync reaction.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const onLike = (id: string) => {
    likeMutation.mutate(id);
  };


  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background px-8 py-8 mr-80 transition-all duration-300 ease-in-out",
      isCollapsed ? "ml-20" : "ml-60"
    )}>
      
      {/* Feed Header */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Post Stream</h2>
          <p className="text-[10px] text-sky-500 font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            Live Network
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-2">
        
        {/* Composer (Open Modal Trigger) */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted/50 shrink-0 flex items-center justify-center text-primary font-bold border border-border overflow-hidden shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
               {user?.first_name ? user.first_name.charAt(0) : 'U'}
            </div>
            <div className="flex-1">
               <div className="w-full bg-muted/20 border border-border rounded-2xl py-3 px-5 text-[15px] text-muted-foreground/60 font-medium transition-all min-h-[52px] flex items-center group-hover:bg-muted/30">
                  What's on your architectural mind?
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[13px] font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all group/btn">
                <ImageIcon className="h-5 w-5 text-sky-500 group-hover/btn:scale-110 transition-transform" />
                <span>Photo</span>
              </button>
              
              <button className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[13px] font-bold text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600 transition-all group/btn">
                <BarChart2 className="h-5 w-5 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                <span>Poll</span>
              </button>

              <button className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[13px] font-bold text-muted-foreground hover:bg-indigo-500/5 hover:text-indigo-600 transition-all group/btn">
                <Rocket className="h-5 w-5 text-indigo-500 group-hover/btn:scale-110 transition-transform" />
                <span>Launch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Post Modal */}
        <PostModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onPostSuccess={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
        />

        {/* Feed Posts */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 opacity-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                    <div className="space-y-2">
                        <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                        <div className="w-32 h-2 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <div className="w-full h-32 bg-muted rounded animate-pulse" />
            </div>
          ))
        ) : (
          postsData?.results.map(post => (
            <PostCard 
                key={post.id} 
                post={post} 
                onLike={(id) => onLike(id)} 
                onNavigateToProfile={onNavigateToProfile}
            />
          ))
        )}

        {postsData?.results.length === 0 && (
          <div className="text-center py-16 bg-muted/10 border border-border rounded-2xl border-dashed">
            <p className="text-muted-foreground font-semibold text-xs tracking-wide">No network activity observed.</p>
          </div>
        )}

      </div>
    </div>
  );
}
