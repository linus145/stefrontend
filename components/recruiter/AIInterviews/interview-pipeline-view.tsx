'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { useQuery } from '@tanstack/react-query';

interface InterviewSession {
  id: string;
  candidate_name: string;
  job_title: string;
  status: 'PENDING' | 'ONGOING' | 'COMPLETED' | 'EXPIRED' | 'READY_TO_ORCHESTRATE' | 'ACTIVE';
  overall_score: number | null;
  created_at: string;
  rounds_count: number;
  application_id?: string;
  is_orchestrated: boolean;
  exam_credentials?: { username: string; password: string } | null;
  exam_link_url?: string | null;
}

interface InterviewPipelineViewProps {
  onConfigure: (appId?: string, sessionId?: string) => void;
}

export function InterviewPipelineView({ onConfigure }: InterviewPipelineViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const { data: sessionsResponse, isLoading, refetch } = useQuery({
    queryKey: ['ai-interview-sessions'],
    queryFn: aiInterviewsService.getSessions,
    refetchOnWindowFocus: true,
  });

  const sessions: InterviewSession[] = sessionsResponse?.data || [];

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || s.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Interviews', value: sessions.length.toString(), trend: '+2 this week' },
    { label: 'Active Sessions', value: sessions.filter(s => s.status === 'ONGOING' || s.status === 'ACTIVE').length.toString(), trend: 'Live now' },
    { label: 'Completed', value: sessions.filter(s => s.status === 'COMPLETED').length.toString(), trend: 'Evaluated' },
    { label: 'Pending', value: sessions.filter(s => s.status === 'PENDING' || s.status === 'READY_TO_ORCHESTRATE').length.toString(), trend: 'Awaiting' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'ONGOING': case 'ACTIVE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'READY_TO_ORCHESTRATE': return 'bg-violet-600/10 text-violet-500 border-violet-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1.5 font-medium opacity-70">
            Real-time candidate tracking and AI assessment coordination
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { refetch(); toast.info("Pipeline synchronized."); }}
            className="px-5 py-2.5 rounded-sm border border-border text-xs font-bold hover:bg-muted transition-all active:scale-95"
          >
            Sync Pipeline
          </button>
          <button 
            onClick={() => onConfigure()}
            className="px-5 py-2.5 rounded-sm bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            + New Interview
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-5 rounded-sm hover:border-blue-600/20 transition-all">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 p-2 rounded-sm border border-border">
        <input 
          type="text" placeholder="Search candidate or role..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 bg-background border border-border rounded-sm py-2 px-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
        <div className="flex items-center bg-background border border-border p-0.5 rounded-sm">
          {(['all', 'pending', 'completed'] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={cn("px-5 py-1.5 text-[10px] font-bold capitalize transition-all rounded-sm",
                filter === t ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>{t}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse" style={{ minWidth: 900 }}>
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="pl-6 pr-4 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[22%]">Candidate</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[16%]">Role</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[10%]">Status</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[7%] text-center">Rounds</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[22%]">Exam Access</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[10%]">Score</th>
                <th className="pl-4 pr-6 py-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[13%] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-5"><div className="h-3.5 bg-muted rounded w-full opacity-40" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-border/50 last:border-0 group hover:bg-muted/5 transition-colors">
                    {/* Candidate */}
                    <td className="pl-6 pr-4 py-4">
                      <p className="text-xs font-bold truncate max-w-[200px]">{session.candidate_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(session.created_at).toLocaleDateString()}</p>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold truncate max-w-[160px]">{session.job_title}</p>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-sm text-[9px] font-bold capitalize border whitespace-nowrap",
                        getStatusStyle(session.status)
                      )}>
                        {session.status.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    {/* Rounds */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-bold">{session.rounds_count}</span>
                    </td>
                    {/* Exam Access */}
                    <td className="px-4 py-4">
                      {session.exam_credentials ? (
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              <span className="font-mono font-bold text-foreground">{session.exam_credentials.username}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              <span className="font-mono font-bold text-foreground">{session.exam_credentials.password}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `Username: ${session.exam_credentials!.username}\nPassword: ${session.exam_credentials!.password}\nExam Portal: ${window.location.origin}/interview/exam`
                              );
                              toast.success('Credentials copied');
                            }}
                            className="shrink-0 px-2 py-1 rounded-sm bg-blue-600/10 text-blue-600 text-[9px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                          >Copy</button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 italic">Not generated</span>
                      )}
                    </td>
                    {/* Score */}
                    <td className="px-4 py-4">
                      <div className="w-20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold">{session.overall_score || 0}%</span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${session.overall_score || 0}%` }} />
                        </div>
                      </div>
                    </td>
                    {/* Action */}
                    <td className="pl-4 pr-6 py-4 text-right">
                      <button
                        onClick={() => onConfigure(session.application_id, session.is_orchestrated ? session.id : undefined)}
                        className={cn(
                          "px-4 py-1.5 rounded-sm text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap",
                          !session.is_orchestrated
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            : "border border-border hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        )}
                      >
                        {!session.is_orchestrated ? 'Configure' : 'Reconfigure'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="text-sm font-medium opacity-40">No matching interview sessions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
