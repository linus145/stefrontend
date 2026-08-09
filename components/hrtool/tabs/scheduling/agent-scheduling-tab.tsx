'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocalLoader } from '@/components/ui/local-loader';
import { Calendar, Save, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { useScheduling } from './use-scheduling';
import { CommandStepsBuilder } from './command-steps-builder';
import { AgentLogsDateAccordion } from './agent-logs-accordion';
import { SchedulingPolicyModal } from './scheduling-policy-modal';

export function AgentSchedulingTab() {
  const {
    isLoading,
    isSaving,
    scheduling,
    setScheduling,
    commandSteps,
    taskSelect,
    setTaskSelect,
    recurrenceSelect,
    setRecurrenceSelect,
    commandText,
    setCommandText,
    stepTimeInput,
    setStepTimeInput,
    editingStepIndex,
    activeSubTab,
    setActiveSubTab,
    history,
    isHistoryLoading,
    showPolicyModal,
    setShowPolicyModal,
    isTriggeringSample,
    handleAddCommandStep,
    handleStartEditStep,
    handleUpdateCommandStep,
    handleCancelEditStep,
    handleRemoveCommandStep,
    handleSampleRun,
    handleSave,
  } = useScheduling();

  if (isLoading) {
    return <LocalLoader />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0a66c2]" />
            Agent scheduling control panel
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configure recurrent execution triggers and cron configurations for autonomous agent processes.
          </p>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2.5 text-[11px] font-semibold tracking-wider border-b-2 cursor-pointer transition-all ${activeSubTab === 'config'
              ? 'border-[#0a66c2] text-[#0a66c2]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
        >
          Scheduler configuration
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2.5 text-[11px] font-semibold tracking-wider border-b-2 cursor-pointer transition-all ${activeSubTab === 'logs'
              ? 'border-[#0a66c2] text-[#0a66c2]'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
        >
          Agent logs
        </button>
      </div>

      {activeSubTab === 'config' ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Scheduling Configuration */}
            <Card className="bg-white dark:bg-[#121320] border border-slate-150 dark:border-slate-800 shadow-sm rounded-[3px] overflow-hidden">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-[#0a66c2]" />
                  <CardTitle className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Autonomous Cron Triggers
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowPolicyModal(true)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 font-extrabold text-[10px] px-2.5 py-1.5 h-auto rounded-[3px] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#0a66c2]" />
                    Schedules Policy
                  </Button>
                  <Badge className={scheduling.enabled ? "bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-[3px]" : "bg-slate-500/10 text-slate-500 border-none font-bold text-[9px] px-2 py-0.5 rounded-[3px]"}>
                    {scheduling.enabled ? 'ACTIVE RUNTIME' : 'INACTIVE'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-800 rounded-[3px]">
                  <input
                    id="enabled-toggle"
                    type="checkbox"
                    checked={scheduling.enabled}
                    onChange={(e) => setScheduling({ ...scheduling, enabled: e.target.checked })}
                    className="w-4 h-4 rounded-[3px] text-[#0a66c2] focus:ring-[#0a66c2] border-slate-300 dark:border-slate-700 bg-background cursor-pointer"
                  />
                  <label htmlFor="enabled-toggle" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer selection:bg-transparent">
                    Enable autonomous scheduled background runs for this tenant
                  </label>
                </div>

                {/* Wrapper to disable all fields when autonomous schedule is disabled */}
                <div className={`space-y-4 transition-all duration-300 ${!scheduling.enabled ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                  <CommandStepsBuilder
                    enabled={scheduling.enabled}
                    taskSelect={taskSelect}
                    recurrenceSelect={recurrenceSelect}
                    commandText={commandText}
                    stepTimeInput={stepTimeInput}
                    editingStepIndex={editingStepIndex}
                    commandSteps={commandSteps}
                    onTaskSelectChange={setTaskSelect}
                    onRecurrenceSelectChange={setRecurrenceSelect}
                    onCommandTextChange={setCommandText}
                    onStepTimeInputChange={setStepTimeInput}
                    onAddStep={handleAddCommandStep}
                    onUpdateStep={handleUpdateCommandStep}
                    onCancelEdit={handleCancelEditStep}
                    onStartEdit={handleStartEditStep}
                    onRemoveStep={handleRemoveCommandStep}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Notification / Report Recipient Email
                      </label>
                      <input
                        type="email"
                        disabled={!scheduling.enabled}
                        value={scheduling.notification_email}
                        onChange={(e) => setScheduling({ ...scheduling, notification_email: e.target.value })}
                        placeholder="alerts@yourcompany.com"
                        className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#1c1d30] border border-slate-200 dark:border-slate-850 rounded-[3px] font-bold focus:outline-none focus:border-[#0a66c2]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              disabled={isTriggeringSample}
              onClick={handleSampleRun}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 font-extrabold text-xs px-4 h-9 rounded-[3px] flex items-center gap-2 cursor-pointer transition-all"
            >
              {isTriggeringSample ? 'Triggering...' : (
                <>
                  <Sparkles className="h-4 w-4 text-[#0a66c2]" />
                  Trigger Sample Run
                </>
              )}
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#0a66c2] hover:bg-[#084e96] text-white font-extrabold text-xs px-4 h-9 rounded-[3px] shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? 'Updating schedule...' : (
                <>
                  <Save className="h-4 w-4" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* Agent Logs Tab — date-grouped accordion */
        <AgentLogsDateAccordion history={history} isHistoryLoading={isHistoryLoading} />
      )}

      <SchedulingPolicyModal open={showPolicyModal} onClose={() => setShowPolicyModal(false)} />
    </div>
  );
}
