'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { User } from '@/types/user.types';
import { PostCard } from '../post/post-card';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Post } from '@/types/post.types';

interface EcosystemPostsProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemPosts({ user, isOwner = false }: EcosystemPostsProps) {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['user-posts', user.id],
    queryFn: () => postService.getUserPosts(user.id),
  });

  const likeMutation = useMutation({
    mutationFn: postService.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['user-posts', user.id] });
      const previousData = queryClient.getQueryData(['user-posts', user.id]);

      queryClient.setQueryData(['user-posts', user.id], (old: any) => {
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

      return { previousData };
    },
    onError: (err, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['user-posts', user.id], context.previousData);
      }
      toast.error('Failed to sync reaction.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts', user.id] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const posts = data?.results || [];

  if (posts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground opacity-20" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">No posts yet</h3>
        <p className="text-sm text-muted-foreground">
          {isOwner 
            ? "Share your thoughts and updates with the community." 
            : `${user.first_name} hasn't posted anything yet.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <PostCard 
            key={post.id} 
            post={post} 
            onLike={(id) => likeMutation.mutate(id)}
            onNavigateToProfile={(uid) => {
                if (uid !== user.id) {
                    window.location.href = `/dashboard/member/${uid}`;
                }
            }}
        />
      ))}
    </div>
  );
}
