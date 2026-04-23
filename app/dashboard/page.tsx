import React from 'react';
import { Metadata } from 'next';
import { DashboardViewShell } from '@/components/dashboard/dashboard-view-shell';

export const metadata: Metadata = {
  title: 'Home | B2linq Platform',
  description: 'Manage your startup ecosystem and identity.',
};

export default function DashboardPage() {
  return (
    <DashboardViewShell />
  );
}
