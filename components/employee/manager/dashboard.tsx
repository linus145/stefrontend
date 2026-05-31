'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

import { useManagerDashboard } from './useManagerDashboard';
import { DashboardHeader } from '../empdashboard/DashboardHeader';
import { WelcomeBanner } from '../WelcomeBanner';
import { ShiftTracker } from '../ShiftTracker';
import { LeaveBalanceCards } from '../empleaves/LeaveBalanceCards';
import { LeaveRequestLogs } from '../empleaves/LeaveRequestLogs';
import { TimecardLogs } from '../TimecardLogs';
import { LeaveRequestModal } from '../empdashboard/LeaveRequestModal';
import { CredentialsModal } from '../empdashboard/CredentialsModal';
import { TeamApprovalsQueue } from './TeamApprovalsQueue';
import { DirectReportsTable } from './DirectReportsTable';
import { TeamGoalsBoard } from './TeamGoalsBoard';
import { AssignGoalModal } from './AssignGoalModal';
import { AttendanceHistoryCard } from '../AttendanceHistoryCard';

export function ManagerDashboard() {
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
        handleUpdateGoal,
        handleDeleteGoal,
        handleCreateGoal,
        createGoalMutation,

        isAssignModalOpen,
        setIsAssignModalOpen,
        openAssignModal,
        selectedAssignee,
        setSelectedAssignee,
        goalTitle,
        setGoalTitle,
        goalDesc,
        setGoalDesc,
        goalStartDate,
        setGoalStartDate,
        goalDueDate,
        setGoalDueDate,
        goalStatus,
        setGoalStatus,
        goalProgress,
        setGoalProgress,

        teamSubordinates,
        teamLeaveApprovals,
        handleApproveTeamLeave,
        handleRejectTeamLeave,

        attendanceLogs,
        leaveRequestsList,

        handleSignOut,
    } = useManagerDashboard();

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <WelcomeBanner
                            displayName={displayName}
                            displayDesignation={displayDesignation}
                            displayDepartment={displayDepartment}
                            currentDateTime={currentDateTime}
                        />
                    </div>
                    {isDemo && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-sm self-start animate-pulse">
                            <Sparkles className="h-4 w-4" />
                            <div className="text-xs font-bold uppercase tracking-wider">Manager Sandbox Activated</div>
                        </div>
                    )}
                </div>

                {/* Manager Top Widgets Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Shift Tracker Card (5 columns) */}
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

                    {/* Symmetrical Manager Action Center (7 columns) - Team Approvals Queue */}
                    <div className="lg:col-span-7 flex flex-col">
                        <TeamApprovalsQueue
                            teamLeaveApprovals={teamLeaveApprovals}
                            onApprove={handleApproveTeamLeave}
                            onReject={handleRejectTeamLeave}
                        />
                    </div>
                </div>

                {/* Leave Balances Grid Widget */}
                <LeaveBalanceCards
                    balancesList={balancesList}
                    onRequestLeave={() => setIsLeaveModalOpen(true)}
                />

                {/* Manager-Specific Subordinates ledger card */}
                <DirectReportsTable teamSubordinates={teamSubordinates} />

                {/* Team Goals Board (Jira Style) */}
                <TeamGoalsBoard
                    goals={goals}
                    onOpenAssignModal={openAssignModal}
                    onUpdateGoal={handleUpdateGoal}
                    onDeleteGoal={handleDeleteGoal}
                />

                {/* Symmetrical Detailed Logs: Attendance & Leaves Section */}
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

            {/* Assign Goal Dialog */}
            <AssignGoalModal
                isOpen={isAssignModalOpen}
                onOpenChange={setIsAssignModalOpen}
                teamSubordinates={teamSubordinates}
                selectedAssignee={selectedAssignee}
                setSelectedAssignee={setSelectedAssignee}
                goalTitle={goalTitle}
                setGoalTitle={setGoalTitle}
                goalDesc={goalDesc}
                setGoalDesc={setGoalDesc}
                goalStartDate={goalStartDate}
                setGoalStartDate={setGoalStartDate}
                goalDueDate={goalDueDate}
                setGoalDueDate={setGoalDueDate}
                goalStatus={goalStatus}
                setGoalStatus={setGoalStatus}
                goalProgress={goalProgress}
                setGoalProgress={setGoalProgress}
                isPending={createGoalMutation.isPending}
                onSubmit={handleCreateGoal}
            />
        </div>
    );
}
