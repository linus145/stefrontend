import React from 'react';
import { PieChart, ShieldCheck } from 'lucide-react';
import { User } from '@/types/user.types';

interface EcosystemCapTableProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemCapTable({ user, isOwner = false }: EcosystemCapTableProps) {
  const isFounder = user.role === 'FOUNDER';

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-all group hover:border-primary/20">
      <div className="flex items-center gap-2.5 mb-6">
        <PieChart className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          {isFounder ? 'Cap Table' : 'Allocation'}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">
           <span>Entity</span>
           <span>Stake</span>
        </div>
        
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
           <div className="h-full bg-primary" style={{ width: '60%' }} />
           <div className="h-full bg-primary/60" style={{ width: '25%' }} />
           <div className="h-full bg-primary/20" style={{ width: '15%' }} />
        </div>

        <div className="space-y-3 pt-2">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 <span className="text-[11px] font-semibold text-muted-foreground">{isFounder ? 'Founders' : 'Top Holding'}</span>
              </div>
              <span className="text-[11px] font-bold text-foreground">60%</span>
           </div>
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                 <div className="w-2 h-2 rounded-full bg-primary/60" />
                 <span className="text-[11px] font-semibold text-muted-foreground">{isFounder ? 'Investors' : 'Portfolio'}</span>
              </div>
              <span className="text-[11px] font-bold text-foreground">25%</span>
           </div>
        </div>
        
        <div className="mt-6 p-3 rounded-xl bg-muted/30 border border-dashed border-border flex items-center gap-2">
           <ShieldCheck className="w-3.5 h-3.5 text-primary opacity-70" />
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Verified by STE</span>
        </div>
      </div>
    </div>
  );
}
