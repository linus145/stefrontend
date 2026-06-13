import React from 'react';
import { Metadata } from 'next';
import { DashboardViewShell } from '@/components/dashboard/dashboard-view-shell';

export const metadata: Metadata = {
  title: 'Blogs | B2linq Platform',
  description: 'Blogs and publications from our community.',
};

export default function UserBlogsPage() {
  return (
    <DashboardViewShell initialSection="userblogs" />
  );
}
