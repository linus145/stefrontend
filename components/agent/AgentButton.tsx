
'use client';

import React, { useState, useEffect } from 'react';
import { AgentUIController } from '@/agent/ui/AgentUIController';

export const AgentButton: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [externalPanelOpen, setExternalPanelOpen] = useState(false);

  useEffect(() => {
    const handleToggle = (e: any) => setSidebarOpen(e.detail.isVisible);
    const handleExternalToggle = (e: any) => setExternalPanelOpen(e.detail.isOpen);

    window.addEventListener('agent-ui-toggle', handleToggle);
    window.addEventListener('external-panel-toggle', handleExternalToggle);

    return () => {
      window.removeEventListener('agent-ui-toggle', handleToggle);
      window.removeEventListener('external-panel-toggle', handleExternalToggle);
    };
  }, []);

  // Hide the button entirely when agent sidebar OR any external panel is open
  if (sidebarOpen || externalPanelOpen) return null;

  return (
    <button
      onClick={() => AgentUIController.getInstance().toggleSidebar()}
      className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-[9998] border border-white/20 group"
      title="Open AI Autonomous Agent"
    >
      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:rotate-12 transition-transform"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    </button>
  );
};
