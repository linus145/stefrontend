import React from 'react';
import Link from 'next/link';

interface Blog {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  slug?: string;
}

interface BlogListProps {
  blogs?: Blog[];
}

export const BlogList = ({ blogs = [] }: BlogListProps) => {
  const displayBlogs = blogs.length > 0 ? blogs : [
    {
      title: "The Future of Seed Funding in 2026",
      excerpt: "How AI is changing the way venture capitalists evaluate early-stage startups and traction metrics.",
      author: "Alex Rivera",
      date: "April 24, 2026",
      category: "Insights"
    },
    {
      title: "Building a Private Network: Lessons Learned",
      excerpt: "Why exclusivity matters and how to curate a community of high-velocity builders.",
      author: "Sarah Jenkins",
      date: "April 18, 2026",
      category: "Company"
    },
    {
      title: "Optimizing Your Burn Rate for Growth",
      excerpt: "Practical steps to ensure your capital lasts while you scale your engineering team.",
      author: "Marcus Torres",
      date: "April 10, 2026",
      category: "Guides"
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayBlogs.map((blog, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-sm overflow-hidden hover:shadow-lg dark:hover:shadow-indigo-950/20 transition-all duration-300">
            <div className="h-48 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
               {/* Placeholder for blog image */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
               <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50 transition-colors duration-300">
                   {blog.category}
                 </span>
               </div>
            </div>
            <div className="p-8">
               <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 transition-colors duration-300">{blog.date} • By {blog.author}</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                {blog.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors duration-300">
                {blog.excerpt}
              </p>
              <Link href={`/blogs/${blog.slug || '#'}`} className="inline-flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                Read Article <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
