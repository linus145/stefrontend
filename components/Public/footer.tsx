import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pt-16 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold italic tracking-wider text-slate-900 dark:text-slate-50">
                B2linq
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              An autonomous hiring platform by BillionWorld Pvt Limited. Sourcing, screening, and evaluating top talent end-to-end without any human help.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Overview</Link></li>
              <li><Link href="/seedemo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">See Demo</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/aboutus" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</Link></li>
              <li><Link href="/blogs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/book-demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Book a Demo</Link></li>
              <li><Link href="/book-demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} B2linq — BillionWorld Pvt Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0 text-slate-500 dark:text-slate-400">
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Twitter</Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">LinkedIn</Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
