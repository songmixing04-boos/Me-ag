export type SubjectType = 'physics' | 'chemistry' | 'biology' | 'nursing_aptitude';

export type ExamType = 'all' | 'aiims_nursing' | 'bcece' | 'neet' | 'up_cnet' | 'paramedical';

export interface Chapter {
  id: string;
  subject: SubjectType;
  nameEn: string;
  nameHi: string;
  unit: string;
  classLevel: '11' | '12' | 'general';
  weightage: 'Very High' | 'High' | 'Medium';
  estimatedQuestions: number;
  ncertRef: string;
  keyTopics: string[];
}

export interface Question {
  id: string;
  subject: SubjectType;
  chapterId: string;
  chapterNameEn: string;
  chapterNameHi: string;
  questionEn: string;
  questionHi: string;
  optionsEn: [string, string, string, string];
  optionsHi: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanationEn: string;
  explanationHi: string;
  examTag: string; // e.g. "AIIMS BSc Nursing 2023", "BCECE 2022", "NEET UG 2024"
  difficulty: 'easy' | 'medium' | 'hard';
  formulaOrFact?: string;
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';

export interface UserAnswerRecord {
  questionId: string;
  selectedOption: number | null; // null if unattempted
  timeSpentSeconds: number;
  status: QuestionStatus;
  isBookmarked?: boolean;
}

export interface ExamConfig {
  id: string;
  title: string;
  subtitle: string;
  examType: ExamType;
  totalQuestions: number;
  durationMinutes: number;
  positiveMarks: number;
  negativeMarks: number;
  subjects: SubjectType[];
  mode: 'chapter' | 'unit' | 'full_mock' | 'custom' | 'mistake_revision';
  chapterId?: string;
}

export interface TestResult {
  id: string;
  examTitle: string;
  timestamp: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpentTotalSeconds: number;
  subjectBreakdown: Record<SubjectType, { total: number; correct: number; incorrect: number; score: number }>;
  answers: Record<string, UserAnswerRecord>;
  questions: Question[];
}
