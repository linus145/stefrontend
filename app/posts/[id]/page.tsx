import { Metadata } from 'next';
import { appConfig } from '@/lib/config';
import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { SinglePostView } from './SinglePostView';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

function extractUuid(param: string): string {
  if (param.length >= 36) {
    const uuid = param.substring(param.length - 36);
    if (uuid.includes('-')) {
      return uuid;
    }
  }
  return param;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id: idParam } = await params;
  const id = extractUuid(idParam);
  try {
    const res = await fetch(`${appConfig.serverApiBaseUrl}/posts/${id}/`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const post = await res.json();
    
    const title = `${post.author_first_name} ${post.author_last_name} on B2linq`;
    const description = post.content ? (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content) : 'Check out this post on B2linq';
    const image = post.media_url || 'https://www.b2linq.in/logo.webp';
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: image }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      }
    };
  } catch (err) {
    return {
      title: 'B2linq Post',
      description: 'Check out this post on B2linq',
    };
  }
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id: idParam } = await params;
  const id = extractUuid(idParam);
  
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-300 relative flex flex-col">
      <Header />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      <main className="relative z-10 w-full flex-1 pt-32 pb-24 flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 sm:px-6">
          <SinglePostView postId={id} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
