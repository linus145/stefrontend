'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Mail,
  Briefcase,
  Search,
  RefreshCw,
  Timer,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InterviewSession {
  id: string;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: string;
  rounds_count: number;
  overall_score: number | null;
  created_at: string;
  is_orchestrated: boolean;
  exam_credentials: {
    username: string;
    password: string;
  } | null;
  exam_status?: string | null;
  application_status?: string | null;
}

interface SchedulingViewProps {
  onConfigure: (appId?: string, sessionId?: string) => void;
  onSectionChange: (section: string) => void;
}

export function SchedulingView({ onConfigure, onSectionChange }: SchedulingViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all sessions
  const { data: sessionsResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai-interview-sessions'],
    queryFn: aiInterviewsService.getSessions,
    refetchOnWindowFocus: true,
  });

  const sessions: InterviewSession[] = useMemo(() => {
    return Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : [];
  }, [sessionsResponse]);

  // Filter sessions by search query
  const searchedSessions = useMemo(() => {
    if (!searchQuery) return sessions;
    const lower = searchQuery.toLowerCase();
    return sessions.filter(s =>
      s.candidate_name.toLowerCase().includes(lower) ||
      s.job_title.toLowerCase().includes(lower) ||
      s.candidate_email.toLowerCase().includes(lower)
    );
  }, [sessions, searchQuery]);

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    // Previous month padding days
    const prevMonthEnd = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevDays.push({
        date: new Date(year, month - 1, prevMonthEnd - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    const currentDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding days
    const totalSlots = 42;
    const nextDaysCount = totalSlots - (prevDays.length + currentDays.length);
    const nextDays = [];
    for (let i = 1; i <= nextDaysCount; i++) {
      nextDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentMonth]);

  // Get sessions mapped to dates
  const sessionsByDate = useMemo(() => {
    const map: Record<string, InterviewSession[]> = {};
    searchedSessions.forEach(s => {
      const dateKey = new Date(s.created_at).toDateString();
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(s);
    });
    return map;
  }, [searchedSessions]);

  // Get sessions for selected date
  const selectedDaySessions = useMemo(() => {
    return sessionsByDate[selectedDate.toDateString()] || [];
  }, [sessionsByDate, selectedDate]);

  // Selected session detailed object
  const selectedSession = useMemo(() => {
    if (selectedSessionId) {
      const found = sessions.find(s => s.id === selectedSessionId);
      if (found) return found;
    }
    return selectedDaySessions[0] || null;
  }, [sessions, selectedSessionId, selectedDaySessions]);

  // Status Styling Helpers
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-500';
      case 'IN_PROGRESS': case 'STARTED': return 'bg-blue-500';
      case 'PENDING': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getExamStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'STARTED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ACTIVE': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'EXPIRED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'NOT_STARTED': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getExamStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'Exam Completed';
      case 'STARTED': return 'In Progress';
      case 'ACTIVE': return 'Not Attempted';
      case 'EXPIRED': return 'Expired';
      case 'NOT_STARTED': return 'Awaiting Config';
      default: return status.toLowerCase().replace(/_/g, ' ');
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSync = async () => {
    const toastId = toast.loading('Syncing schedule...');
    try {
      await refetch();
      toast.success('Schedule synchronized', { id: toastId });
    } catch (e) {
      toast.error('Sync failed', { id: toastId });
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      pending: sessions.filter(s => s.status.toLowerCase() === 'pending').length,
      active: sessions.filter(s => ['active', 'started', 'in_progress'].includes(s.status.toLowerCase())).length,
      completed: sessions.filter(s => s.status.toLowerCase() === 'completed').length,
    };
  }, [sessions]);

  return (
    <div className="flex-1 h-[calc(100vh-64px)] bg-muted/20 p-3 sm:p-4 lg:p-6 flex justify-center items-center overflow-hidden animate-in fade-in duration-500">
      <div className="max-w-7xl w-full h-full flex overflow-hidden">
        <div className="w-full h-full bg-card border border-border rounded-lg flex overflow-hidden shadow-sm relative">

          {/* Left Panel: Calendar & List of Interviews */}
          <div className="flex-1 flex flex-col border-r border-border min-w-0">
            {/* Header controls */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                </div>
                <h1 className="text-[15px] font-bold tracking-tight">Interview Calendar</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSync}
                  disabled={isRefetching}
                  className="flex items-center gap-1.5 px-2.5 h-8 rounded border border-border bg-card text-[11px] font-bold hover:bg-muted transition-all active:scale-95 text-foreground shrink-0 cursor-pointer"
                >
                  <RefreshCw className={cn("w-3 h-3", isRefetching && "animate-spin")} />
                  Sync
                </button>

                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded border border-border bg-background text-[11.5px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 border-b border-border text-center py-2 bg-muted/5 divide-x divide-border shrink-0">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Total Scheduled</p>
                <p className="text-[14px] font-extrabold text-foreground mt-0.5">{stats.total}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-amber-500 uppercase">Pending Config</p>
                <p className="text-[14px] font-extrabold text-amber-500 mt-0.5">{stats.pending}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-blue-500 uppercase">Active Slots</p>
                <p className="text-[14px] font-extrabold text-blue-500 mt-0.5">{stats.active}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-emerald-500 uppercase">Completed</p>
                <p className="text-[14px] font-extrabold text-emerald-500 mt-0.5">{stats.completed}</p>
              </div>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
              {/* Calendar Container */}
              <div className="bg-card border border-border/80 rounded-md p-3">
                {/* Month header selector */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-bold text-foreground">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 h-7 w-7 rounded hover:bg-muted border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date())}
                      className="px-2 h-7 rounded hover:bg-muted border border-border/60 text-[10px] font-bold text-foreground transition-all cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 h-7 w-7 rounded hover:bg-muted border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground uppercase border-b border-border/40 pb-2 mb-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const daySessions = sessionsByDate[date.toDateString()] || [];
                    const hasSessions = daySessions.length > 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSessionId(null); // Reset detail override to show the day's first session
                          
                          if (daySessions.length > 0) {
                            const candidateNames = daySessions.map(s => s.candidate_name).join(', ');
                            toast(`Interviews on ${date.toLocaleDateString(undefined, { dateStyle: 'medium' })}`, {
                              description: `${daySessions.length} scheduled: ${candidateNames}`,
                            });
                          } else {
                            toast(`No interviews scheduled for ${date.toLocaleDateString(undefined, { dateStyle: 'medium' })}`);
                          }
                        }}
                        className={cn(
                          "aspect-square rounded-md p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer select-none",
                          "border border-transparent relative",
                          isCurrentMonth ? "text-foreground font-semibold" : "text-muted-foreground/40 font-medium",
                          isSelected
                            ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                            : "hover:bg-muted/50 hover:border-border/40",
                          isToday && !isSelected && "bg-secondary text-primary font-bold border border-primary/20"
                        )}
                      >
                        <span className="text-[11px]">{date.getDate()}</span>

                        {/* Dot indicator container */}
                        {hasSessions && (
                          <div className="flex gap-0.5 justify-center mt-auto">
                            {daySessions.slice(0, 3).map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className={cn("w-1 h-1 rounded-full shrink-0", getStatusColor(s.status))}
                                title={`${s.candidate_name} - ${s.job_title}`}
                              />
                            ))}
                            {daySessions.length > 3 && (
                              <span className="text-[7px] font-bold leading-none text-muted-foreground/60">
                                +
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Agenda/Sessions List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <h3 className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wide">
                    Agenda: {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <span className="text-[10px] font-bold text-muted-foreground/70">
                    {selectedDaySessions.length} Scheduled
                  </span>
                </div>

                {isLoading ? (
                  <div className="py-8 flex justify-center items-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground/60" />
                  </div>
                ) : selectedDaySessions.length === 0 ? (
                  <div className="py-6 rounded border border-dashed border-border/80 flex flex-col items-center justify-center text-center p-4">
                    <AlertCircle className="w-5 h-5 text-muted-foreground/40 mb-1" />
                    <p className="text-[11px] font-medium text-muted-foreground/60">No interviews scheduled on this day</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {selectedDaySessions.map((session) => {
                      const isDetailActive = selectedSession?.id === session.id;
                      return (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={cn(
                            "p-3 rounded-md border text-left cursor-pointer transition-all hover:shadow-sm flex items-center justify-between gap-3",
                            isDetailActive
                              ? "bg-secondary/40 border-border shadow-sm ring-1 ring-border/20"
                              : "bg-card border-border/60 hover:bg-muted/30"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[12px] font-bold truncate text-foreground">
                                {session.candidate_name}
                              </span>
                              <span className={cn(
                                "inline-flex px-1 rounded-[3px] text-[8.5px] font-bold capitalize border shrink-0 scale-95",
                                getStatusStyle(session.status)
                              )}>
                                {session.status.toLowerCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium truncate">
                              <Briefcase className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                              <span className="truncate">{session.job_title}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end">
                            <span className="text-[10.5px] font-bold text-foreground">
                              {session.rounds_count} Round{session.rounds_count !== 1 && 's'}
                            </span>
                            <span className="text-[9px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Selected Interview Detail & Actions */}
          <div className="hidden md:flex md:w-[320px] lg:w-[360px] flex-col overflow-hidden bg-muted/[0.03]">
            {selectedSession ? (
              <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
                {/* Detail Header */}
                <div className="p-4 border-b border-border shrink-0 bg-card">
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-1">Candidate Details</p>
                  <h2 className="text-[15px] font-bold text-foreground truncate">{selectedSession.candidate_name}</h2>
                  <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">{selectedSession.candidate_email}</p>
                </div>

                {/* Scrollable details */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                  {/* Status Card */}
                  <div className="p-3 bg-card border border-border/80 rounded-md space-y-2.5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Interview State</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold capitalize border",
                        getStatusStyle(selectedSession.status)
                      )}>
                        {selectedSession.status.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Exam Status</span>
                      {selectedSession.exam_status ? (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold border",
                          getExamStatusStyle(selectedSession.exam_status)
                        )}>
                          {getExamStatusLabel(selectedSession.exam_status)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 italic">—</span>
                      )}
                    </div>

                    {selectedSession.application_status && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Application State</span>
                        <span className="text-[9.5px] font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border/60">
                          {selectedSession.application_status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Credentials / Access Link Section (Read-only) */}
                  {selectedSession.exam_credentials ? (
                    <div className="p-3 bg-card border border-border/80 rounded-md space-y-3">
                      <div className="flex items-center gap-1.5 text-blue-500 border-b border-border/40 pb-2">
                        <Timer className="w-3.5 h-3.5" />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider">Credentials & Access</h4>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-[8.5px] font-bold text-muted-foreground uppercase">Username / Access Key</p>
                          <div className="mt-1 bg-muted/40 border border-border/50 rounded px-2.5 py-1.5">
                            <span className="font-mono text-[10.5px] font-semibold text-foreground truncate block">
                              {selectedSession.exam_credentials.username}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-[8.5px] font-bold text-muted-foreground uppercase">Password</p>
                          <div className="mt-1 bg-muted/40 border border-border/50 rounded px-2.5 py-1.5">
                            <span className="font-mono text-[10.5px] font-semibold text-foreground truncate block">
                              {selectedSession.exam_credentials.password}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded border border-dashed border-border/80 flex flex-col items-center justify-center text-center bg-card">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-500/60 mb-1" />
                      <p className="text-[10.5px] font-semibold text-foreground/80">Credentials not generated</p>
                      <p className="text-[9.5px] text-muted-foreground/60 mt-0.5">Please configure the rounds in the pipeline to orchestrate exam details.</p>
                    </div>
                  )}

                  {/* Summary & Timestamps */}
                  <div className="p-3 bg-card border border-border/80 rounded-md space-y-2 text-[10.5px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      <span className="text-foreground truncate">{selectedSession.job_title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      <span>Scheduled: {new Date(selectedSession.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      <span>{selectedSession.rounds_count} configured evaluation rounds</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-muted/[0.01]">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/20 mb-2" />
                <h3 className="text-[12.5px] font-bold text-foreground/80">No Interview Selected</h3>
                <p className="text-[11px] text-muted-foreground/50 max-w-[200px] mt-0.5 leading-relaxed">
                  Select an interview day and candidate to view credentials, status, and timeline.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
