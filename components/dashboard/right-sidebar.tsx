import { Bell, UserPlus, ArrowUpRight, MoreHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function RightSidebar({ isCollapsed, onToggle }: RightSidebarProps) {
  const { user } = useAuth();

  return (
    <aside className={cn(
      "h-screen fixed right-0 top-0 bg-sidebar/50 flex flex-col pt-20 pb-8 z-20 transition-all duration-300 ease-in-out hidden xl:flex",
      isCollapsed ? "w-0 border-l-0" : "w-72 border-l border-border px-6"
    )}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-24 w-6 h-6 rounded-full bg-background border flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-sm z-30",
          isCollapsed ? "-left-6 border-border hover:border-primary/50 shadow-md" : "-left-3 border-border hover:border-primary/50"
        )}
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      <div className={cn(
        "flex flex-col h-full transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-60 opacity-100"
      )}>
        {/* Trending Startups */}
        <div className="mb-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Trending Posts</h3>
          <div className="space-y-6">
            <TrendingItem label="Vanguard Data" initial="V" role="SEED • FINTECH" />
            <TrendingItem label="Orbit Logistics" initial="O" role="SERIES A • SC" />
            <TrendingItem label="Aura Health" initial="A" role="HEALTH" />
          </div>
        </div>

        {/* Suggested Network */}
        <div className="mb-auto">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Network Suggestions</h3>
          <div className="space-y-6">
            <NetworkItem name="David Ross" role="Angel Investor" avatar="https://i.pravatar.cc/150?img=33" />
            <NetworkItem name="Elena Rodriguez" role="CTO @ Buildscale" avatar="https://i.pravatar.cc/150?img=44" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-widest text-muted-foreground opacity-60">
            <span>Policy</span>
            <span>v1.0.2</span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-primary" />
          </div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest text-center opacity-40">
            &copy; {new Date().getFullYear()} BE2linq INC.
          </p>
        </div>
      </div>

    </aside>
  );
}

function TrendingItem({ label, initial, role }: { label: string, initial: string, role: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-muted/60 border border-border flex items-center justify-center text-foreground font-bold text-xs group-hover:border-primary/40 transition-all">
          {initial}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground leading-none mb-1">{label}</p>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight opacity-70">{role}</p>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
    </div>
  );
}

function NetworkItem({ name, role, avatar }: { name: string, role: string, avatar: string }) {
  return (
    <div className="flex items-center justify-between group transition-all">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={avatar} alt={name} className="w-9 h-9 rounded-md border border-border object-cover transition-transform group-hover:scale-105" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-sidebar" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground leading-none mb-1">{name}</p>
          <p className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px] opacity-70">{role}</p>
        </div>
      </div>
      <button className="w-8 h-8 rounded-md bg-muted/40 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
        <UserPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
