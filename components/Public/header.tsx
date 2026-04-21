import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.05] bg-[#0a0a0c]/80 backdrop-blur-xl">
      <div className="absolute inset-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#b49cf8]/30 to-transparent" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b49cf8] to-[#7f5df2] shadow-[0_0_15px_rgba(180,156,248,0.4)] group-hover:shadow-[0_0_25px_rgba(180,156,248,0.6)] transition-all">
            <span className="text-white font-bold text-sm italic">S</span>
          </div>
          <span className="text-xl font-bold italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#d9d1fe] to-[#a890fe]">
            STE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#a1a1aa]">
          <Link href="#features" className="hover:text-white transition-colors">Platform</Link>
          <Link href="#startups" className="hover:text-white transition-colors">Startups</Link>
          <Link href="#investors" className="hover:text-white transition-colors">Investors</Link>
          <Link href="#community" className="hover:text-white transition-colors">Community</Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm font-medium text-[#d4d4d8] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
        
      </div>
    </header>
  );
}
