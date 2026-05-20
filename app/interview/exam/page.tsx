import { CandidateExamWrapper } from '@/components/interview/exam/candidate-exam-wrapper';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';

export default function CandidateExamPage() {
  return (
    <DashboardThemeProvider>
      <CandidateExamWrapper />
    </DashboardThemeProvider>
  );
}
