'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AttendanceSettingsProps {
  settings: {
    checkInTime: string;
    checkOutTime: string;
    gracePeriod: number;
    minHoursFullDay: number;
    minHoursHalfDay: number;
    autoOvertime: boolean;
  };
  setSettings: React.Dispatch<React.SetStateAction<{
    checkInTime: string;
    checkOutTime: string;
    gracePeriod: number;
    minHoursFullDay: number;
    minHoursHalfDay: number;
    autoOvertime: boolean;
  }>>;
  isSaving: boolean;
  handleSaveSettings: () => void;
}

export function AttendanceSettings({
  settings,
  setSettings,
  isSaving,
  handleSaveSettings
}: AttendanceSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 rounded-sm">
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a66c2] mb-4">Standard Shift Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Expected Check-In Time</label>
                <Input
                  type="time"
                  value={settings.checkInTime}
                  onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                  data-agent="attendance-settings-checkin"
                  className="bg-background border-border/60 rounded-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Expected Check-Out Time</label>
                <Input
                  type="time"
                  value={settings.checkOutTime}
                  onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                  data-agent="attendance-settings-checkout"
                  className="bg-background border-border/60 rounded-sm focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a66c2] mb-4">Overtime & Work Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Grace Period (Minutes)</label>
                <Input
                  type="number"
                  value={settings.gracePeriod}
                  onChange={(e) => setSettings({ ...settings, gracePeriod: parseInt(e.target.value) || 0 })}
                  data-agent="attendance-settings-grace-period"
                  className="bg-background border-border/60 rounded-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Full Day Threshold (Hrs)</label>
                <Input
                  type="number"
                  value={settings.minHoursFullDay}
                  onChange={(e) => setSettings({ ...settings, minHoursFullDay: parseInt(e.target.value) || 0 })}
                  data-agent="attendance-settings-full-day"
                  className="bg-background border-border/60 rounded-sm focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Half Day Threshold (Hrs)</label>
                <Input
                  type="number"
                  value={settings.minHoursHalfDay}
                  onChange={(e) => setSettings({ ...settings, minHoursHalfDay: parseInt(e.target.value) || 0 })}
                  data-agent="attendance-settings-half-day"
                  className="bg-background border-border/60 rounded-sm focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-sm bg-[#0a66c2]/5 border border-[#0a66c2]/10">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Auto-Calculate Overtime</p>
              <p className="text-[10px] text-muted-foreground">Automatically track hours worked beyond the expected check-out time.</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoOvertime: !settings.autoOvertime })}
              data-agent="attendance-settings-auto-overtime"
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                settings.autoOvertime ? "bg-[#0a66c2]" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  settings.autoOvertime ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              data-agent="attendance-settings-save-btn"
              className="bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded-sm px-6"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a66c2] text-white shadow-xl shadow-blue-500/20 rounded-sm h-fit">
        <CardHeader className="border-none pb-0">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-50 font-bold">
            <Clock className="h-5 w-5" />
            Shift Policy Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Expected Working Shift</p>
            <h3 className="text-2xl font-bold mt-1">
              {settings.checkInTime} - {settings.checkOutTime}
            </h3>
          </div>
          <div className="p-4 rounded-sm bg-white/10 backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Late Attendance Threshold</p>
            <h3 className="text-2xl font-bold mt-1">
              After {(() => {
                const [hrs, mins] = settings.checkInTime.split(':').map(Number);
                const totalMins = hrs * 60 + mins + settings.gracePeriod;
                const h = Math.floor(totalMins / 60) % 24;
                const m = totalMins % 60;
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
              })()}
            </h3>
            <p className="text-[9px] text-blue-150 mt-1">Includes a {settings.gracePeriod}-minute grace period.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
