export type AppraisalStatus = 'DRAFT' | 'SELF_APPRAISAL' | 'MANAGER_REVIEW' | 'SUBMITTED' | 'ACKNOWLEDGED';

export interface CompetencyScore {
  id: string;
  name: string;
  category: 'core' | 'technical' | 'leadership';
  score: number; // 1-5 rating scale
  weight: number; // percentage of total score
}

export interface PerformanceReviewListItem {
  id: string;
  employee: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    department: string;
  };
  cycleName: string; // e.g., "2026 Mid-Year Evaluation"
  status: AppraisalStatus;
  overallScore: number | null;
  dueDate: string;
}

export interface PerformanceAnalytics {
  companyAverage: number;
  quarterOverQuarterDelta: number;
  activeOkrsCount: number;
  pendingAppraisalsCount: number;
  distribution9Box?: {
    highPerformanceHighPotential: number;
    highPerformanceMedPotential: number;
    highPerformanceLowPotential: number;
    medPerformanceHighPotential: number;
    medPerformanceMedPotential: number;
    medPerformanceLowPotential: number;
    lowPerformanceHighPotential: number;
    lowPerformanceMedPotential: number;
    lowPerformanceLowPotential: number;
  };
}
