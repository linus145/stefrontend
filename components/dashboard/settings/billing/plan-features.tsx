'use client';

import React from 'react';
import { FeatureItem } from './feature-item';

interface PlanFeaturesProps {
  planName: string;
  isFree: boolean;
}

export function PlanFeatures({ planName, isFree }: PlanFeaturesProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-md p-6 shadow-sm h-full">
        <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Included in your plan</h5>
        
        <ul className="space-y-3.5 text-xs">
          {isFree ? (
            <>
              <FeatureItem label="Candidate Job Board Access" enabled />
              <FeatureItem label="Basic Applicant Dashboard" enabled />
              <FeatureItem label="1-10 Employees limit" enabled />
              <FeatureItem label="ATS Data Sync Integration" enabled={false} />
              <FeatureItem label="Conversational HR AI Assistant" enabled={false} />
              <FeatureItem label="AI Resume Screening" enabled={false} />
            </>
          ) : planName.toLowerCase().includes('basic') ? (
            <>
              <FeatureItem label="ATS & HRMS Data Syncing" enabled />
              <FeatureItem label="Auto welcome & NDA packets" enabled />
              <FeatureItem label="Up to 100 Employees limit" enabled />
              <FeatureItem label="2 Core systems integration" enabled />
              <FeatureItem label="Conversational AI Handbook Search" enabled={false} />
              <FeatureItem label="AI Resume Screening Engine" enabled={false} />
            </>
          ) : planName.toLowerCase().includes('growth') ? (
            <>
              <FeatureItem label="Full Conversational AI Agent" enabled />
              <FeatureItem label="AI Resume Screening & Score" enabled />
              <FeatureItem label="Up to 500 Employees limit" enabled />
              <FeatureItem label="Unlimited standard integrations" enabled />
              <FeatureItem label="Interactive Onboarding Guides" enabled />
              <FeatureItem label="Autonomous Pipeline Automation" enabled={false} />
            </>
          ) : (
            /* Enterprise AI OS */
            <>
              <FeatureItem label="Full Agentic Autonomous Systems" enabled />
              <FeatureItem label="Custom Enterprise API & ERP" enabled />
              <FeatureItem label="Unlimited Employees limit" enabled />
              <FeatureItem label="Autonomous AI Hiring Agents" enabled />
              <FeatureItem label="Full HR Management Suite" enabled />
              <FeatureItem label="Dedicated Support & Infra" enabled />
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
