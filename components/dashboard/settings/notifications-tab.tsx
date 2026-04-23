import React from 'react';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function NotificationsTab() {
  return (
    <div className="space-y-8 mt-0">
      <div>
        <h3 className="text-2xl font-semibold text-foreground tracking-tight">Notifications Settings</h3>
        <p className="text-muted-foreground text-sm font-medium mt-1">Configure how you interact with the B2linq platform.</p>
      </div>
      <Card className="rounded-2xl border-border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-primary mb-6">
          <Bell className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-foreground mb-2">Notifications Controls</h4>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Advanced notifications features are currently being verified for the unified B2linq 2.0 release.
        </p>
      </Card>
    </div>
  );
}
