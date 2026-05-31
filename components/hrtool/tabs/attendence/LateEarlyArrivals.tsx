'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LateEarlyArrivalsProps {
  mockLateArrivals: any[];
}

export function LateEarlyArrivals({ mockLateArrivals }: LateEarlyArrivalsProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          {mockLateArrivals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground italic">No late arrivals or early departures detected today.</p>
            </div>
          ) : (
            mockLateArrivals.map((arrival, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 px-3 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center shrink-0",
                    arrival.severity === 'high' ? "bg-rose-500/10 text-rose-600" :
                    arrival.severity === 'medium' ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                  )}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{arrival.name}</p>
                    <p className="text-[10px] text-muted-foreground">Arrived at {arrival.checkin} on {arrival.date}</p>
                  </div>
                </div>
                <div>
                  <Badge className={cn(
                    "text-[8px] font-bold rounded-sm uppercase tracking-wider px-1.5 py-0 shadow-none border",
                    arrival.severity === 'high' ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                    arrival.severity === 'medium' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  )}>
                    Late by {arrival.lateBy}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
