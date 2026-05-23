import React from 'react';
import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PrivacyControlsSection() {
  return (
    <Card className="rounded-sm border-border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-sm bg-muted/50 border border-border flex items-center justify-center text-[#0a66c2] mb-6">
        <Eye className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-bold text-foreground mb-2">Privacy Controls</h4>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Advanced privacy features are currently being verified for the unified B2linq 2.0 release.
      </p>
    </Card>
  );
}
