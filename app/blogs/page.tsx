import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { BlogList } from '@/components/blogs/blog-list';
import { Metadata } from 'next';
import { publicService } from '@/services/public.service';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/blogs', {
    title: 'Recruitment & AI Sourcing Insights | B2linq Blog',
    description: 'Read the latest insights, guides, and news from the B2linq team on autonomous hiring pipelines, conversational AI screening, and HR automation.',
  });
}

export default async function BlogsPage() {
  let blogs = [];
  try {
    blogs = await publicService.getBlogs();
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    // Fallback blogs
    blogs = [
      {
        title: "The Future of Seed Funding in 2026",
        excerpt: "How AI is changing the way venture capitalists evaluate early-stage startups and traction metrics.",
        author: "Alex Rivera",
        date: "2026-04-24",
        category: "Insights"
      },
      {
        title: "Building a Private Network: Lessons Learned",
        excerpt: "Why exclusivity matters and how to curate a community of high-velocity builders.",
        author: "Sarah Jenkins",
        date: "2026-04-18",
        category: "Company"
      }
    ];
  }

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden min-h-screen font-sans selection:bg-indigo-100 transition-colors duration-300 relative">
      <Header />
      
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full pt-32">
        <section className="px-6 max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6 transition-colors duration-300">
            The <span className="text-indigo-600 dark:text-indigo-400">B2linq</span> Journal
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed transition-colors duration-300">
            Thoughts on building, scaling, and the future of capital efficiency.
          </p>
        </section>

        <BlogList blogs={blogs} />
      </main>

      <Footer />
    </div>
  );
}
