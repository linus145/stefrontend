'use client';

import React from 'react';
import { User, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AttendanceRequestsProps {
  mockRequests: any[];
}

export function AttendanceRequests({ mockRequests }: AttendanceRequestsProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          {mockRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground italic">No correction requests found.</p>
            </div>
          ) : (
            mockRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 px-3 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{req.name}</p>
                    <p className="text-[10px] text-muted-foreground">{req.requestType} • {req.date} at {req.time}</p>
                    <p className="text-[10px] italic text-muted-foreground mt-0.5">Reason: "{req.reason}"</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => toast.success(`Approved request for ${req.name}`)}
                    data-agent={`attendance-correction-approve-btn-${req.id}`}
                    className="h-7 text-[10px] px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-semibold"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.error(`Rejected request for ${req.name}`)}
                    data-agent={`attendance-correction-reject-btn-${req.id}`}
                    className="h-7 text-[10px] px-3 border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-sm font-semibold"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
