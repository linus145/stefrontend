import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import {
  Loader2,
  Globe,
  Send,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  Trash2,
  EyeOff,
  UserX,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Post } from '@/types/post.types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getOptimizedImage } from '@/lib/imagekit';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment?: (postId: string) => void;
  onNavigateToProfile: (userId: string) => void;
}

export function PostCard({ post, onLike, onNavigateToProfile }: PostCardProps) {
  const { user } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const isOwner = user?.id === post.author_id;

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete post.');
    }
  });

  const handleHidePost = () => {
    // In a real app, this would hit an API to hide for the user
    // Here we just simulate it with a toast
    toast.info("Post hidden. Your feed will update shortly.");
  };

  const handleShare = () => {
    // Check if navigator.share is available
    if (navigator.share) {
      navigator.share({
        title: 'B2linq Post',
        text: post.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link captured to clipboard.");
    }
  };

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
    <div className="bg-card border border-border/60 rounded-md shadow-sm transition-all group overflow-hidden hover:shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              onClick={() => onNavigateToProfile(post.author_id)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted overflow-hidden border border-border/40 shrink-0 relative hover:ring-2 hover:ring-primary/20 transition-all block cursor-pointer group/avatar"
            >
              {post.author_image_url ? (
                <img
                  src={isOwner ? `${getOptimizedImage(post.author_image_url)}&v=${user?.updated_at ? new Date(user.updated_at).getTime() : Date.now()}` : getOptimizedImage(post.author_image_url)}
                  alt={post.author_first_name}
                  className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-sm font-bold uppercase shadow-inner">
                  {post.author_first_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigateToProfile(post.author_id)}
                  className="text-foreground font-bold text-[14px] hover:text-primary hover:underline cursor-pointer transition-colors leading-tight tracking-tight"
                >
                  {post.author_first_name}
                </button>
                <span className="text-[10px] text-muted-foreground/60 font-bold tracking-widest">• 1st</span>
                {post.author_linkedin_url && (
                  <a href={post.author_linkedin_url} target="_blank" rel="noopener noreferrer" className="ml-0.5">
                    <div className="w-3.5 h-3.5 bg-[#0A66C2] rounded-[2px] flex items-center justify-center hover:brightness-110 transition-all">
                      <span className="text-[8px] text-white font-bold leading-none">in</span>
                    </div>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-semibold leading-tight mt-0.5 max-w-[200px] sm:max-w-[280px] truncate opacity-80">
                {post.author_role}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium mt-0.5 opacity-70">
                <span>{timeAgo}</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-all p-1.5 rounded-full hover:bg-muted/50 outline-none cursor-pointer">
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border rounded-md shadow-xl">
              <DropdownMenuItem onClick={() => onLike(post.id)} className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[13px] font-medium cursor-pointer">
                <Heart className={cn("w-4 h-4 text-muted-foreground", post.user_has_liked && "text-blue-500 fill-current")} />
                <span>{post.user_has_liked ? 'Remove Like' : 'React with Like'}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleShare} className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[13px] font-medium cursor-pointer">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <span>Share Post</span>
              </DropdownMenuItem>

              {!isOwner && (
                <>
                  <DropdownMenuItem onClick={handleHidePost} className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[13px] font-medium cursor-pointer">
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                    <span>Hide this post</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("User muted.")} className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[13px] font-medium cursor-pointer">
                    <UserX className="w-4 h-4 text-muted-foreground" />
                    <span>Mute {post.author_first_name}</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="bg-border/60" />

              {!isOwner && (
                <DropdownMenuItem className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[13px] font-medium text-destructive cursor-pointer hover:bg-destructive/10">
                  <Flag className="w-4 h-4" />
                  <span>Report post</span>
                </DropdownMenuItem>
              )}

              {isOwner && (
                <DropdownMenuItem
                  onClick={() => deleteMutation.mutate(post.id)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[13px] font-medium text-destructive cursor-pointer hover:bg-destructive/10"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Delete post</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 py-2 flex-1 flex flex-col">
        <div className={cn(
          "text-foreground/90 text-[14px] leading-relaxed whitespace-pre-wrap font-normal mb-auto",
          !isExpanded ? "line-clamp-5 min-h-[105px]" : "min-h-[105px]"
        )}>
          {post.content}
        </div>
        {(post.content.split('\n').length > 5 || post.content.length > 250) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[13px] font-bold text-muted-foreground hover:text-primary transition-colors mt-2 text-left"
          >
            {isExpanded ? '...see less' : '...see more'}
          </button>
        )}
      </div>

      {post.media_url && (
        <div className="mt-2 bg-muted/20 border-y border-border/40 overflow-hidden cursor-pointer">
          <img
            src={getOptimizedImage(post.media_url)}
            alt="Post content"
            className="w-full h-auto max-h-[500px] object-cover transition-all duration-700 hover:brightness-95"
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between border-b border-border/40 bg-muted/10">
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
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-md text-[11px] sm:text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95"
        >
          <Heart className={cn("h-4 w-4", post.user_has_liked && "fill-current text-blue-500")} />
          <span className={cn(post.user_has_liked && "text-foreground")}>{post.user_has_liked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-md text-[11px] sm:text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95",
            isCommentsOpen && "bg-muted/80"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Comment</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-md text-[11px] sm:text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-md text-[11px] sm:text-[12px] font-semibold text-muted-foreground transition-all hover:bg-muted/60 active:scale-95"
          onClick={() => toast.info("Direct messaging enabled.")}
        >
          <Send className="h-4 w-4" />
          <span>Send</span>
        </button>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 space-y-4 sm:space-y-5 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleCommentSubmit} className="flex gap-3">
            <div className="w-8 h-8 rounded-md bg-muted shrink-0 overflow-hidden border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              {user?.profile?.profile_image_url ? (
                <img
                  src={`${getOptimizedImage(user.profile.profile_image_url)}&v=${user.updated_at ? new Date(user.updated_at).getTime() : Date.now()}`}
                  alt="Me"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.first_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-muted/50 border border-border rounded-md py-2 px-4 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40 transition-all"
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
                  <div
                    onClick={() => onNavigateToProfile(comment.user_id || post.author_id)} // Fallback if user_id is missing, but should be there
                    className="w-8 h-8 rounded-md bg-muted shrink-0 border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
                  >
                    {comment.author_image ? (
                      <img
                        src={(user?.id === comment.user_id) ? `${getOptimizedImage(comment.author_image)}&v=${user?.updated_at ? new Date(user.updated_at).getTime() : Date.now()}` : getOptimizedImage(comment.author_image)}
                        alt={comment.author_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      comment.author_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onNavigateToProfile(comment.user_id || post.author_id)}
                          className="text-xs font-bold text-foreground hover:text-primary hover:underline transition-colors cursor-pointer"
                        >
                          {comment.author_name}
                        </button>
                        {comment.author_linkedin_url && (
                          <a href={comment.author_linkedin_url} target="_blank" rel="noopener noreferrer">
                            <div className="w-2.5 h-2.5 bg-[#0A66C2] rounded-[1px] flex items-center justify-center hover:brightness-110 transition-all">
                              <span className="text-[6px] text-white font-bold leading-none">in</span>
                            </div>
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium opacity-60">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
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
