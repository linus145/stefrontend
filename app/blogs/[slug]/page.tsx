import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { publicService } from '@/services/public.service';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await publicService.getBlogDetail(slug);
    return {
      title: `${blog.title} | B2linq Blog`,
      description: blog.excerpt,
    };
  } catch {
    return {
      title: 'Blog Post | B2linq',
    };
  }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  let blog = null;

  try {
    blog = await publicService.getBlogDetail(slug);
  } catch (error) {
    console.error("Failed to fetch blog detail:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900">
        <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
        <Link href="/blogs">
          <Button variant="outline">Back to Journal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-indigo-100">
      <Header />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.03)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Back Button */}
          <Link href="/blogs" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Journal
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-wider">
                {blog.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 mr-1" />
                5 min read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pb-12 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{blog.author}</p>
                  <p className="text-xs text-slate-500">Industry Expert</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-slate prose-lg max-w-none">
            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-10 italic border-l-4 border-indigo-500 pl-6">
              {blog.excerpt}
            </p>
            
            <div className="text-slate-800 leading-[1.8] space-y-6">
              {/* If content is HTML, use dangerouslySetInnerHTML, otherwise split by newlines for basic rendering */}
              {blog.content ? (
                blog.content.split('\n').map((para: string, i: number) => (
                  para.trim() && <p key={i}>{para}</p>
                ))
              ) : (
                <p>No content available for this post yet. Stay tuned for more insights from the B2linq team.</p>
              )}
            </div>
          </article>

          {/* Article Footer */}
          <div className="mt-20 pt-12 border-t border-slate-100">
            <div className="bg-slate-50 rounded-3xl p-8 md:p-12 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Want more insights?</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Join our private newsletter to receive the latest updates on startup execution and capital efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-8 rounded-xl font-bold">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
