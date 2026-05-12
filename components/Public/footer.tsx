import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold italic tracking-wider text-slate-900">
                B2LINQ
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              ENTER THE ETHER. Connecting founders, investors, and ideas securely across a unified startup ecosystem architecture.
            </p>
          </div>

          {/* Links Cols */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#features" className="hover:text-indigo-600 transition-colors">Platform</Link></li>
              <li><Link href="#startups" className="hover:text-indigo-600 transition-colors">Startups</Link></li>
              <li><Link href="#investors" className="hover:text-indigo-600 transition-colors">Investors</Link></li>
              <li><Link href="#community" className="hover:text-indigo-600 transition-colors">Community</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Partner Program</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">API Status</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Cookie Tracking</Link></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 pt-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Startup Ecosystem Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0 text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
