import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { Loader2, Globe, Send, MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '@/types/post.types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const { user } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => postService.getComments(post.id),
    enabled: isCommentsOpen,
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string, content: string }) => 
      postService.createComment(postId, content),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate({ postId: post.id, content: newComment });
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl shadow-sm transition-all group overflow-hidden hover:shadow-md">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border/40 shrink-0 relative">
              {post.author_image_url ? (
                <img src={post.author_image_url} alt={post.author_first_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-sm font-bold uppercase">
                  {post.author_first_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                 <h4 className="text-foreground font-semibold text-[14px] hover:text-primary hover:underline cursor-pointer transition-colors leading-tight">
                   {post.author_first_name}
                 </h4>
                 <span className="text-[10px] text-muted-foreground opacity-60 font-medium">• 1st</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-0.5 max-w-[280px] truncate">
                {post.author_role}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium mt-0.5 opacity-70">
                <span>{timeAgo}</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-all p-1.5 rounded-full hover:bg-muted/50">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-foreground/90 text-[14px] leading-relaxed whitespace-pre-wrap font-normal">
          {post.content}
        </p>
      </div>

      {post.media_url && (
        <div className="mt-2 bg-muted/20 border-y border-border/40 overflow-hidden cursor-pointer">
          <img 
            src={post.media_url} 
            alt="Post content" 
            className="w-full h-auto max-h-[500px] object-cover transition-all duration-700 hover:brightness-95" 
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-border/40 bg-muted/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary cursor-pointer transition-all">
            <div className={cn(
               "flex h-4 w-4 rounded-full items-center justify-center border border-background shadow-sm bg-blue-500/10",
            )}>
                <Heart className={cn("w-2 h-2 text-blue-500", post.user_has_liked && "fill-current")} />
            </div>
            <span className="font-semibold text-foreground/80">{post.likes_count}</span>
          </div>
        </div>

        {/* 
        <div 
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="text-[11px] text-muted-foreground font-semibold hover:text-primary hover:underline cursor-pointer transition-all flex items-center gap-1"
        >
          <span>{post.comments_count}</span>
          <span>comments</span>
        </div>
        */}
      </div>

      {/* Interaction Buttons */}
      <div className="px-1 py-1 flex items-center justify-between">
        <button 
          onClick={() => onLike(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95"
        >
          <Heart className={cn("h-4 w-4", post.user_has_liked && "fill-current text-blue-500")} /> 
          <span className={cn(post.user_has_liked && "text-foreground")}>{post.user_has_liked ? 'Liked' : 'Like'}</span>
        </button>

        <button 
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95",
            isCommentsOpen && "bg-muted/80"
          )}
        >
          <MessageSquare className="h-4 w-4" /> 
          <span>Comment</span>
        </button>

        <button 
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95"
          onClick={() => toast.info("Post synchronization initiated.")}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>

        <button 
           className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95"
           onClick={() => toast.info("Direct signal transmission enabled.")}
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </button>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="px-6 pb-6 pt-3 space-y-5 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleCommentSubmit} className="flex gap-3">
             <div className="w-8 h-8 rounded-lg bg-muted shrink-0 overflow-hidden border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
               {user?.first_name?.charAt(0) || 'U'}
             </div>
             <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-muted/50 border border-border rounded-xl py-2 px-4 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
                <button 
                  disabled={commentMutation.isPending || !newComment.trim()}
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30 hover:scale-110 active:scale-95 transition-all"
                >
                  {commentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
             </div>
          </form>

          <div className="space-y-5">
            {isLoadingComments ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
              </div>
            ) : (
              comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-muted shrink-0 border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {comment.author_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-foreground">{comment.author_name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium opacity-60">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[13px] text-foreground/80 leading-relaxed font-normal">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
