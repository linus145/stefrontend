'use client';

import React, { useState } from 'react';
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
import { PendingRequestsSummary } from '../PendingRequestsSummary';
import { DirectReportsTable } from './DirectReportsTable';
import { TeamGoalsBoard } from './TeamGoalsBoard';
import { AssignGoalModal } from './AssignGoalModal';
import { AttendanceHistoryCard } from '../AttendanceHistoryCard';
import { PortalSidebar, PortalSection } from '../PortalSidebar';

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
        pendingList,

        // Payroll approvals
        payrollApprovalsList,
        payrollSettings,
        getPayrollApprovalAccess,
        handleApprovePayroll,
        handleRejectPayroll,
        approvePayrollMutation,
        rejectPayrollMutation,
        payrollApprovalConfirm,
        setPayrollApprovalConfirm,

        handleSignOut,
    } = useManagerDashboard();

    // Sidebar state
    const [activeSection, setActiveSection] = useState<PortalSection>('dashboard');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('mgr-sidebar-collapsed') === 'true';
        }
        return false;
    });

    const handleSidebarCollapse = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
        if (typeof window !== 'undefined') {
            localStorage.setItem('mgr-sidebar-collapsed', String(collapsed));
        }
    };

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
                                <TeamApprovalsQueue
                                    teamLeaveApprovals={teamLeaveApprovals}
                                    onApprove={handleApproveTeamLeave}
                                    onReject={handleRejectTeamLeave}
                                    payrollApprovalsList={payrollApprovalsList}
                                    payrollSettings={payrollSettings}
                                    getPayrollApprovalAccess={getPayrollApprovalAccess}
                                    onApprovePayroll={handleApprovePayroll}
                                    onRejectPayroll={handleRejectPayroll}
                                    isApprovingPayroll={approvePayrollMutation.isPending}
                                    isRejectingPayroll={rejectPayrollMutation.isPending}
                                    payrollConfirmId={payrollApprovalConfirm}
                                    setPayrollConfirmId={setPayrollApprovalConfirm}
                                />
                            </div>
                        </div>

                        {/* Leave Balances */}
                        <LeaveBalanceCards
                            balancesList={balancesList}
                            onRequestLeave={() => setIsLeaveModalOpen(true)}
                        />

                        {/* Personal Pending / Rejected Leave Requests */}
                        <PendingRequestsSummary pendingList={pendingList} />

                        {/* Direct Reports */}
                        <DirectReportsTable teamSubordinates={teamSubordinates} />
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
                        {/* Managers can see their own goals if any are assigned to them */}
                        <TeamGoalsBoard
                            goals={goals}
                            onOpenAssignModal={openAssignModal}
                            onUpdateGoal={handleUpdateGoal}
                            onDeleteGoal={handleDeleteGoal}
                        />
                    </div>
                );

            // ── Manager-only sections ──

            case 'team':
            case 'team-reports':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Direct reports</h2>
                            <p className="text-sm text-slate-400 dark:text-slate-555 font-medium mt-1">Your team members and their current status.</p>
                        </div>
                        <DirectReportsTable teamSubordinates={teamSubordinates} />
                    </div>
                );

            case 'team-approvals':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Team approvals queue</h2>
                            <p className="text-sm text-slate-400 dark:text-slate-555 font-medium mt-1">Review and authorize pending leave requests from your subordinates.</p>
                        </div>
                        <TeamApprovalsQueue
                            teamLeaveApprovals={teamLeaveApprovals}
                            onApprove={handleApproveTeamLeave}
                            onReject={handleRejectTeamLeave}
                            payrollApprovalsList={payrollApprovalsList}
                            payrollSettings={payrollSettings}
                            getPayrollApprovalAccess={getPayrollApprovalAccess}
                            onApprovePayroll={handleApprovePayroll}
                            onRejectPayroll={handleRejectPayroll}
                            isApprovingPayroll={approvePayrollMutation.isPending}
                            isRejectingPayroll={rejectPayrollMutation.isPending}
                            payrollConfirmId={payrollApprovalConfirm}
                            setPayrollConfirmId={setPayrollApprovalConfirm}
                        />
                    </div>
                );

            case 'team-goals':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Team goals board</h2>
                            <p className="text-sm text-slate-400 dark:text-slate-555 font-medium mt-1">Assign, track, and review performance goals for your team.</p>
                        </div>
                        <TeamGoalsBoard
                            goals={goals}
                            onOpenAssignModal={openAssignModal}
                            onUpdateGoal={handleUpdateGoal}
                            onDeleteGoal={handleDeleteGoal}
                        />
                    </div>
                );

            case 'payroll-approvals':
                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payroll cycle approvals</h2>
                            <p className="text-sm text-slate-400 dark:text-slate-555 font-medium mt-1">Review and authorize payroll cycles that require your approval.</p>
                        </div>
                        <TeamApprovalsQueue
                            teamLeaveApprovals={[]}
                            onApprove={() => {}}
                            onReject={() => {}}
                            payrollApprovalsList={payrollApprovalsList}
                            payrollSettings={payrollSettings}
                            getPayrollApprovalAccess={getPayrollApprovalAccess}
                            onApprovePayroll={handleApprovePayroll}
                            onRejectPayroll={handleRejectPayroll}
                            isApprovingPayroll={approvePayrollMutation.isPending}
                            isRejectingPayroll={rejectPayrollMutation.isPending}
                            payrollConfirmId={payrollApprovalConfirm}
                            setPayrollConfirmId={setPayrollApprovalConfirm}
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
                    isManager={true}
                />

                <main
                    className={`flex-1 min-w-0 transition-all duration-300 ${
                        isSidebarCollapsed ? 'pl-[60px]' : 'pl-[220px]'
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
