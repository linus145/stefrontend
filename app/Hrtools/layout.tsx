import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { PayrollProgressProvider } from '@/context/PayrollProgressContext';
import { AgentButton } from '@/components/agent/AgentButton';
import { AgentSidebar } from '@/components/agent/AgentSidebar';

export default function HRToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeProvider>
      <PayrollProgressProvider>
        <div className="flex min-h-screen">
          <main className="flex-1 flex flex-col min-w-0 relative">
            {children}
          </main>
          <AgentSidebar />
        </div>
        <AgentButton />
      </PayrollProgressProvider>
    </DashboardThemeProvider>
  );
}
