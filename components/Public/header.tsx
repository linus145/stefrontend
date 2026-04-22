'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-all">
      <div className="absolute inset-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 shadow-sm group-hover:shadow-md transition-all">
            <span className="text-indigo-600 font-bold text-sm italic">S</span>
          </div>
          <span className="text-xl font-bold italic tracking-wider text-slate-900">
            BE2linq
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-slate-900 transition-colors">Platform</Link>
          <Link href="#startups" className="hover:text-slate-900 transition-colors">Startups</Link>
          <Link href="#investors" className="hover:text-slate-900 transition-colors">Investors</Link>
          <Link href="#community" className="hover:text-slate-900 transition-colors">Community</Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all font-semibold">
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col px-6 py-4 space-y-1">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors border-b border-slate-100">
              Platform
            </Link>
            <Link href="#startups" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors border-b border-slate-100">
              Startups
            </Link>
            <Link href="#investors" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors border-b border-slate-100">
              Investors
            </Link>
            <Link href="#community" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Community
            </Link>
          </nav>
          <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-11 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-11 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
