import React from 'react';
import { PrivacyControlsSection } from './privacy-controls-section';

export function PrivacyTab() {
  return (
    <div className="space-y-8 mt-0">
      <div>
        <h3 className="text-2xl font-semibold text-foreground tracking-tight">Privacy Settings</h3>
        <p className="text-muted-foreground text-sm font-medium mt-1">Configure how you interact with the B2linq platform.</p>
      </div>
      <PrivacyControlsSection />
    </div>
  );
}
