'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Cpu, Save, ShieldCheck, Sparkles } from 'lucide-react';

interface AgentSettingsData {
  id?: string;
  llm_model: string;
  max_iterations: number;
  system_prompt: string;
  autonomy_level: string;
}

export function AgentSettingsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AgentSettingsData>({
    llm_model: 'gemini-2.5-flash',
    max_iterations: 30,
    system_prompt: '',
    autonomy_level: 'full_autonomy',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get<AgentSettingsData>('/agentsettings/config/');
        if (res) {
          setSettings(res);
        }
      } catch (err) {
        console.error('Failed to load agent settings', err);
        toast.error('Failed to load agent settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch<AgentSettingsData>('/agentsettings/config/', settings);
      if (res) {
        setSettings(res);
        toast.success('Agent settings updated successfully!');
      }
    } catch (err) {
      console.error('Failed to save settings', err);
      toast.error('Failed to update agent settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0a66c2]" />
            Agent Settings & LLM Parameters
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configure the default LLM engine model, temperature bounds, iteration thresholds, and autonomy behaviors.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LLM Engine Config */}
          <Card className="lg:col-span-2 bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800 shadow-sm rounded-sm overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-[#0a66c2]" />
                <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Cognitive LLM Parameters
                </CardTitle>
              </div>
              <Badge className="bg-[#0a66c2]/10 text-[#0a66c2] border-none font-bold text-[9px] px-2 py-0.5 rounded-sm">
                Active Engine
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Model Selection
                  </label>
                  <select
                    value={settings.llm_model}
                    onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Autonomy Behavior Mode
                  </label>
                  <select
                    value={settings.autonomy_level}
                    onChange={(e) => setSettings({ ...settings, autonomy_level: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  >
                    <option value="full_autonomy">Full Autonomy (Observe-Think-Act Loop)</option>
                    <option value="semi_autonomy">Semi-Autonomous (Confirm Actions)</option>
                    <option value="handover_only">Handover Mode (User Triggered)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Max Iteration Boundary limit
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={settings.max_iterations}
                    onChange={(e) => setSettings({ ...settings, max_iterations: parseInt(e.target.value) || 30 })}
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-bold focus:outline-none focus:border-[#0a66c2]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Custom Co-pilot System Prompt Guidelines
                </label>
                <textarea
                  rows={4}
                  value={settings.system_prompt}
                  onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                  placeholder="Inject additional domain context, company values, custom naming strategies, or custom checks here to align the agent..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-sm font-medium focus:outline-none focus:border-[#0a66c2] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Guidelines */}
          <Card className="bg-slate-50 dark:bg-[#151628]/40 border border-slate-150 dark:border-slate-800 rounded-sm shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Control Overview
              </CardTitle>
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
                  <p>Choose the model engine matching your task complexity and speed requirements.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
                  <p>The iteration boundary protects the system from runtime infinite loops in case selectors change.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] mt-1.5 shrink-0" />
                  <p>Autonomous actions are audited and locked under the enterprise subscription plan policies.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase">Security Mode:</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] px-2 py-0.5 rounded-sm">
                  ENCRYPTED
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs px-4 h-9 rounded-sm shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? 'Updating Agent config...' : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
