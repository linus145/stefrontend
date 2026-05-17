import React from 'react';
import { 
  Bot, Sparkles, Activity, CheckCircle2, ChevronRight, 
  Terminal, BarChart3, Settings, Play, Briefcase, Mail, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentConsole } from '@/components/recruiter/aiagents/AgentConsole';

export default function AIAgentsDashboard() {

  const agents = [
    {
      id: 'recruitment-bot',
      name: 'Recruitment Copilot',
      role: 'Sourcing & Screening',
      status: 'active',
      tasksCompleted: 1240,
      icon: <Bot className="w-5 h-5" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'job-poster',
      name: 'Auto-Poster Agent',
      role: 'Distribution',
      status: 'active',
      tasksCompleted: 312,
      icon: <Briefcase className="w-5 h-5" />,
      color: 'bg-emerald-500'
    },
    {
      id: 'comms-agent',
      name: 'Comms Coordinator',
      role: 'Scheduling & Emails',
      status: 'idle',
      tasksCompleted: 856,
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F111A] text-slate-200 font-sans p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">AI Agent Command Center</h1>
            </div>
            <p className="text-slate-400 font-medium ml-1">Manage and monitor your autonomous recruitment workforce.</p>
          </div>
          
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <Play className="w-4 h-4 fill-current" />
            Deploy New Agent
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Active Agents', value: '3', icon: Activity, color: 'text-emerald-400' },
            { label: 'Tasks Executed (30d)', value: '2,408', icon: Terminal, color: 'text-indigo-400' },
            { label: 'Time Saved (Hours)', value: '342', icon: BarChart3, color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1A1D27] border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className={`w-20 h-20 ${stat.color}`} />
              </div>
              <p className="text-sm font-semibold text-slate-400 mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Agent Workspace Console (ACT vs PLAN modes) */}
        <AgentConsole />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Agents List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1A1D27] border border-slate-800/60 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Deployed Agents</h2>
                <button className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">View Logs</button>
              </div>
              
              <div className="divide-y divide-slate-800/60">
                {agents.map((agent) => (
                  <div key={agent.id} className="p-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", agent.color)}>
                        {agent.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                          {agent.name}
                          {agent.status === 'active' && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">{agent.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Tasks Done</p>
                        <p className="text-sm font-bold text-slate-300">{agent.tasksCompleted.toLocaleString()}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#1A1D27] border border-slate-800/60 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Live Activity</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { time: 'Just now', text: 'Auto-Poster Agent published "Senior Dev" to LinkedIn.', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
                { time: '2m ago', text: 'Recruitment Copilot scored 45 new applications.', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
                { time: '15m ago', text: 'Comms Coordinator sent 12 interview invites.', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
                { time: '1h ago', text: 'Auto-Poster Agent published "Product Manager" to Indeed.', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
                { time: '3h ago', text: 'Recruitment Copilot generated summary for Alex Chen.', icon: <FileText className="w-4 h-4 text-indigo-500" /> },
              ].map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-0.5">{log.icon}</div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{log.text}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
