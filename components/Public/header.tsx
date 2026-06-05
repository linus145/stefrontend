'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme from localStorage or document element
    try {
      const stored = localStorage.getItem('ste-theme');
      if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('ste-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('ste-theme', 'light');
      }
    } catch (_) {}
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="absolute inset-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-500/20 to-transparent" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:shadow-md transition-all">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm italic">S</span>
          </div>
          <span className="text-xl font-bold italic tracking-wider text-slate-900 dark:text-slate-50">
            B2linq
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Home</Link>
          <Link href="/aboutus" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">About Us</Link>
          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Pricing</Link>
          <Link href="/blogs" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Blog</Link>
          <Link href="/careers" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Careers</Link>
          <Link href="/book-demo" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Contact</Link>
          <Link href="/seedemo" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">See Demo</Link>


        </nav>

        {/* Auth CTA & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <Link href="/login" className="hidden md:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors px-2">
            Sign In
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button className="rounded-full bg-[#0a66c2] text-white hover:bg-[#084e96] shadow-sm transition-all font-semibold">
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col px-6 py-4 space-y-1">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors border-b border-slate-100 dark:border-slate-850">
              Home
            </Link>
            <Link href="/aboutus" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors border-b border-slate-100 dark:border-slate-850">
              About Us
            </Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors border-b border-slate-100 dark:border-slate-850">
              Pricing
            </Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors border-b border-slate-100 dark:border-slate-850">
              Blog
            </Link>
            <Link href="/careers" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors border-b border-slate-100 dark:border-slate-850">
              Careers
            </Link>
            <Link href="/seedemo" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors border-b border-slate-100 dark:border-slate-850">
              See Demo
            </Link>
            <Link href="/book-demo" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-11 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-11 rounded-lg bg-[#0a66c2] text-white hover:bg-[#084e96] shadow-sm transition-all font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
