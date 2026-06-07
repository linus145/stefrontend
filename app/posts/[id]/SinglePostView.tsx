'use client';

import { useQuery } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { PostCard } from '@/components/dashboard/post/post-card';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SinglePostView({ postId }: { postId: string }) {
  const router = useRouter();
  
  const { data: post, isLoading, error, refetch } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postService.getPost(postId),
  });

  const handleLike = async (id: string) => {
    try {
      await postService.toggleLike(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground font-semibold">Loading post details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-card border border-border/60 rounded-sm p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-foreground">Post not found</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The post you are trying to view does not exist or may have been deleted.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-bold text-[#0a66c2] hover:underline"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Feed
      </Link>
      <div className="bg-card rounded-sm border border-border/60 shadow-xl">
        <PostCard
          post={post}
          onLike={handleLike}
          onNavigateToProfile={(userId) => router.push(`/dashboard/profile?id=${userId}`)}
        />
      </div>
    </div>
  );
}
