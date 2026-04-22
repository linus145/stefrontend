import React from 'react';
import { ArrowUpRight, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { User } from '@/types/user.types';

interface EcosystemMetricsProps {
  user: User;
  isOwner?: boolean;
}

export function EcosystemMetrics({ user, isOwner = false }: EcosystemMetricsProps) {
  const isFounder = user.role === 'FOUNDER';
  
  // Dynamic metrics based on role
  const metrics = isFounder ? [
    { 
      label: 'Growth Rate', 
      value: '24%', 
      change: '+4.2%', 
      sub: 'Month over Month', 
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> 
    },
    { 
      label: 'Network Strength', 
      value: 'Level 4', 
      change: 'Elite', 
      sub: 'Top percentile', 
      icon: <Activity className="w-4 h-4 text-[#b49cf8]" /> 
    },
  ] : [
    { 
      label: 'Portfolio Count', 
      value: '12', 
      change: '+2', 
      sub: 'Active Investments', 
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> 
    },
    { 
      label: 'Avg Check Size', 
      value: '$250K', 
      change: 'Stable', 
      sub: 'Pre-seed/Seed', 
      icon: <DollarSign className="w-4 h-4 text-[#b49cf8]" /> 
    },
  ];

  return (
    <div className="space-y-4">
      {metrics.map((m, idx) => (
        <div 
          key={idx} 
          className="bg-card border border-border rounded-lg p-5 shadow-sm transition-all group hover:border-primary/20"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
               <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  {m.icon}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{m.label}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[9px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
               {m.change}
               <ArrowUpRight className="w-2.5 h-2.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-foreground tracking-tight mb-1 group-hover:text-primary transition-colors leading-none">{m.value}</div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight opacity-50">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
