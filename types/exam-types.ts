export interface Question {
  id: string;
  question_text: string;
  question_type: string;
  mcq_options: any;
  candidate_answer: string | null;
  answered_at: string | null;
}

export interface Round {
  id: string;
  designation: string;
  designation_display: string;
  strategy_tier: string;
  difficulty: string;
  question_format: string;
  programming_language: string;
  timer_seconds: number;
  max_questions: number;
  questions: Question[];
}

export interface ExamData {
  session_id: string;
  exam_token: string;
  job_title: string;
  candidate_name: string;
  status: string;
  expires_at: string | null;
  rounds: Round[];
}
