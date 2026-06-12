'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useEmployeeDashboard } from './useEmployeeDashboard';
import { DashboardHeader } from './DashboardHeader';
import { WelcomeBanner } from '../WelcomeBanner';
import { ShiftTracker } from '../ShiftTracker';
import { PendingRequestsSummary } from '../PendingRequestsSummary';
import { LeaveBalanceCards } from '../empleaves/LeaveBalanceCards';
import { LeaveRequestLogs } from '../empleaves/LeaveRequestLogs';
import { TimecardLogs } from '../TimecardLogs';
import { LeaveRequestModal } from './LeaveRequestModal';
import { CredentialsModal } from './CredentialsModal';
import { GoalsBoard } from './GoalsBoard';
import { UpdateGoalModal } from './UpdateGoalModal';
import { AttendanceHistoryCard } from '../AttendanceHistoryCard';
import { PortalSidebar, PortalSection } from '../PortalSidebar';

export function EmployeeDashboard() {
  const {
    authLoading,
    isDemo,
    isDark,
    toggleTheme,
    isAuthenticated,

    displayName,
    displayId,
    displayDesignation,
    displayDepartment,
    currentDateTime,

    isCheckedIn,
    elapsedSeconds,
    checkInTime,
    checkInMutation,
    checkOutMutation,
    handleCheckIn,
    handleCheckOut,

    isLeaveModalOpen,
    setIsLeaveModalOpen,
    leaveType,
    setLeaveType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    isSubmittingLeave,
    balancesList,
    handleNewLeaveSubmit,

    isCredentialsModalOpen,
    setIsCredentialsModalOpen,
    newPortalUsername,
    setNewPortalUsername,
    newPassword,
    setNewPassword,
    showPassword,
    setShowPassword,
    isSubmittingCredentials,
    handleCredentialsSubmit,

    goals,
    isUpdateGoalOpen,
    setIsUpdateGoalOpen,
    selectedGoal,
    setSelectedGoal,
    updateGoalStatus,
    setUpdateGoalStatus,
    updateGoalProgress,
    setUpdateGoalProgress,
    updateGoalMutation,
    handleUpdateGoal,

    attendanceLogs,
    leaveRequestsList,
    pendingList,

    handleSignOut,
  } = useEmployeeDashboard();

  // Sidebar state
  const [activeSection, setActiveSection] = useState<PortalSection>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('emp-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('emp-sidebar-collapsed', String(collapsed));
    }
  };

  // Handle special sections that open modals instead of switching views
  const handleSectionChange = (section: PortalSection) => {
    if (section === 'credentials') {
      setIsCredentialsModalOpen(true);
      return;
    }
    setActiveSection(section);
  };

  if (authLoading && !isDemo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <WelcomeBanner
              displayName={displayName}
              displayDesignation={displayDesignation}
              displayDepartment={displayDepartment}
              currentDateTime={currentDateTime}
            />

            {/* Top Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 flex flex-col">
                <ShiftTracker
                  isCheckedIn={isCheckedIn}
                  elapsedSeconds={elapsedSeconds}
                  checkInTime={checkInTime}
                  displayDepartment={displayDepartment}
                  isSyncing={!isDemo && (checkInMutation.isPending || checkOutMutation.isPending)}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                />
              </div>
              <div className="lg:col-span-7 flex flex-col">
                <PendingRequestsSummary pendingList={pendingList} />
              </div>
            </div>

            {/* Leave Balances */}
            <LeaveBalanceCards
              balancesList={balancesList}
              onRequestLeave={() => setIsLeaveModalOpen(true)}
            />

            {/* Personal Goals Board */}
            <GoalsBoard
              goals={goals}
              onEditGoal={(g) => {
                setSelectedGoal(g);
                setUpdateGoalStatus(g.status);
                setUpdateGoalProgress(g.progress_percentage);
                setIsUpdateGoalOpen(true);
              }}
            />
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Attendance &amp; shift logs</h2>
              <p className="text-sm text-slate-400 dark:text-slate-550 font-medium mt-1">Track your check-ins, work hours, and attendance history.</p>
            </div>
            <ShiftTracker
              isCheckedIn={isCheckedIn}
              elapsedSeconds={elapsedSeconds}
              checkInTime={checkInTime}
              displayDepartment={displayDepartment}
              isSyncing={!isDemo && (checkInMutation.isPending || checkOutMutation.isPending)}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
            <TimecardLogs attendanceLogs={attendanceLogs} />
            <AttendanceHistoryCard attendanceLogs={attendanceLogs} />
          </div>
        );

      case 'leaves':
      case 'leave-balances':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leave balances</h2>
              <p className="text-sm text-slate-400 dark:text-slate-550 font-medium mt-1">View remaining balances and submit new leave requests.</p>
            </div>
            <LeaveBalanceCards
              balancesList={balancesList}
              onRequestLeave={() => setIsLeaveModalOpen(true)}
            />
          </div>
        );

      case 'leave-requests':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leave request history</h2>
              <p className="text-sm text-slate-400 dark:text-slate-550 font-medium mt-1">Review your submitted leave requests and their approval status.</p>
            </div>
            <LeaveRequestLogs leaveRequestsList={leaveRequestsList} />
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Personal goals</h2>
              <p className="text-sm text-slate-400 dark:text-slate-550 font-medium mt-1">Track progress on your assigned performance goals.</p>
            </div>
            <GoalsBoard
              goals={goals}
              onEditGoal={(g) => {
                setSelectedGoal(g);
                setUpdateGoalStatus(g.status);
                setUpdateGoalProgress(g.progress_percentage);
                setIsUpdateGoalOpen(true);
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none antialiased transition-colors duration-500">
      <DashboardHeader
        displayName={displayName}
        displayDesignation={displayDesignation}
        displayId={displayId}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Sidebar + Content Shell */}
      <div className="flex flex-1">
        <PortalSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={handleSidebarCollapse}
          isManager={false}
        />

        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'pl-20' : 'pl-60'
          }`}
        >
          <div className="p-8 md:p-10 max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        leaveType={leaveType}
        setLeaveType={setLeaveType}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        reason={reason}
        setReason={setReason}
        isSubmittingLeave={isSubmittingLeave}
        balancesList={balancesList}
        onSubmit={handleNewLeaveSubmit}
      />

      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        newPortalUsername={newPortalUsername}
        setNewPortalUsername={setNewPortalUsername}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isSubmittingCredentials={isSubmittingCredentials}
        onSubmit={handleCredentialsSubmit}
      />

      <UpdateGoalModal
        isOpen={isUpdateGoalOpen}
        onOpenChange={setIsUpdateGoalOpen}
        selectedGoal={selectedGoal}
        updateGoalStatus={updateGoalStatus}
        setUpdateGoalStatus={setUpdateGoalStatus}
        updateGoalProgress={updateGoalProgress}
        setUpdateGoalProgress={setUpdateGoalProgress}
        isPending={updateGoalMutation.isPending}
        onSubmit={handleUpdateGoal}
      />
    </div>
  );
}
