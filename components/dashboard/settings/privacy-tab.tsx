import React from 'react';
import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PrivacyTab() {
  return (
    <div className="space-y-8 mt-0">
      <div>
        <h3 className="text-2xl font-semibold text-foreground tracking-tight">Privacy Settings</h3>
        <p className="text-muted-foreground text-sm font-medium mt-1">Configure how you interact with the BE2linq platform.</p>
      </div>
      <Card className="rounded-2xl border-border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-primary mb-6">
          <Eye className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-foreground mb-2">Privacy Controls</h4>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Advanced privacy features are currently being verified for the unified BE2linq 2.0 release.
        </p>
      </Card>
    </div>
  );
}
