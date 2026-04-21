import React from 'react';
import { Search, Bell, Wallet, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function EcosystemHeader() {
  const { user } = useAuth();
  const profile = user?.profile;
  const avatarUrl = profile?.profile_image_url || `https://i.pravatar.cc/150?u=${user?.id}`;

  return (
    <header className="flex items-center justify-between gap-8 mb-10 pb-6 border-b border-[var(--border-primary)]">
      {/* Left: Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input 
          type="text" 
          placeholder="Search ecosystem..." 
          className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl py-2.5 pl-11 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-[#b49cf8] outline-none transition-all shadow-inner"
        />
      </div>

      {/* Middle: Page Tabs */}
      <nav className="hidden lg:flex items-center gap-8">
        <a href="#" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-primary)] border-b-2 border-[#b49cf8] pb-1">Ventures</a>
        <a href="#" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors pb-1">Updates</a>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-[var(--border-primary)] pr-6">
           <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <Bell className="w-5 h-5" />
           </button>
           <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <Search className="w-5 h-5" />
           </button>
        </div>

        <button className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-white/[0.02] border border-[var(--border-primary)] text-[var(--text-secondary)] text-xs font-bold hover:bg-white/[0.05] hover:text-[var(--text-primary)] transition-all shadow-xl backdrop-blur-sm">
           <Wallet className="w-4 h-4 text-[#b49cf8]" />
           Connect Wallet
        </button>

        <div className="w-10 h-10 rounded-full border border-[var(--border-primary)] p-0.5 bg-gradient-to-br from-[#b49cf8]/20 to-transparent flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
           <div className="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center p-0.5 font-bold text-[#b49cf8]">
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[var(--bg-tertiary)]">
                 {user ? (
                   <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserIcon className="w-4 h-4 text-[#b49cf8]" />
                 )}
              </div>
           </div>
        </div>
      </div>
    </header>
  );
}
