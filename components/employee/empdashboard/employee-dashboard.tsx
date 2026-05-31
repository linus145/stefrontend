'use client';

import React from 'react';
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

  if (authLoading && !isDemo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

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

      {/* Main Grid Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <WelcomeBanner
          displayName={displayName}
          displayDesignation={displayDesignation}
          displayDepartment={displayDepartment}
          currentDateTime={currentDateTime}
        />

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Check-In / Clock In Card (5 columns) */}
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

          {/* Quick Checks and Action Items (7 columns) */}
          <div className="lg:col-span-7 flex flex-col">
            <PendingRequestsSummary
              pendingList={pendingList}
            />
          </div>
        </div>

        {/* Leave Balances Grid Widget */}
        <LeaveBalanceCards
          balancesList={balancesList}
          onRequestLeave={() => setIsLeaveModalOpen(true)}
        />

        {/* Personal Goals Board (Jira Style) */}
        <GoalsBoard
          goals={goals}
          onEditGoal={(g) => {
            setSelectedGoal(g);
            setUpdateGoalStatus(g.status);
            setUpdateGoalProgress(g.progress_percentage);
            setIsUpdateGoalOpen(true);
          }}
        />

        {/* Detailed Logs: Attendance & Leaves Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Leaves Request History (7 Columns) */}
          <div className="lg:col-span-7">
            <LeaveRequestLogs leaveRequestsList={leaveRequestsList} />
          </div>

          {/* Recent Attendance Log Sheets (5 Columns) */}
          <div className="lg:col-span-5">
            <TimecardLogs attendanceLogs={attendanceLogs} />
          </div>
        </div>

        {/* Complete Attendance History Logs Card */}
        <AttendanceHistoryCard attendanceLogs={attendanceLogs} />
      </main>

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

      {/* Employee Progress Update Dialog */}
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
