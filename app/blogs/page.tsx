import { Header } from '@/components/Public/header';
import { Footer } from '@/components/Public/footer';
import { BlogList } from '@/components/blogs/blog-list';
import { Metadata } from 'next';
import { publicService } from '@/services/public.service';

export const metadata: Metadata = {
  title: 'Blog | B2linq Platform',
  description: 'Insights, guides, and news from the B2linq team.',
};

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
    <div className="bg-white text-slate-900 overflow-hidden min-h-screen font-sans selection:bg-indigo-100">
      <Header />
      
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.05)_0%,transparent_50%)] pointer-events-none" />

      <main className="relative z-10 w-full pt-32">
        <section className="px-6 max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            The <span className="text-indigo-600">B2linq</span> Journal
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Thoughts on building, scaling, and the future of capital efficiency.
          </p>
        </section>

        <BlogList blogs={blogs} />
      </main>

      <Footer />
    </div>
  );
}
