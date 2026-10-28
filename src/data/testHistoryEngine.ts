import { ALL_CHAPTERS } from './syllabus';
import { TestResult, SubjectType } from '../types/quiz';

const STORAGE_KEY_TEST_HISTORY = 'lallantop_test_history_v1';
const STORAGE_KEY_COMPLETED_CHAPTERS = 'lallantop_completed_chapters_v1';

export interface StoredTestSummary {
  id: string;
  title: string;
  timestamp: number;
  score: number;
  maxScore: number;
  accuracy: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  chapterId?: string;
  mode?: string;
}

export interface SubjectProgress {
  subject: SubjectType;
  labelEn: string;
  labelHi: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

export interface OverallProgressStats {
  totalChapters: number;
  completedCount: number;
  percentage: number;
  testsTaken: number;
  averageAccuracy: number;
  subjects: Record<SubjectType, SubjectProgress>;
  recentTests: StoredTestSummary[];
  completedChapterIds: string[];
}

// Get completed chapter IDs
export function getCompletedChapterIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED_CHAPTERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Save completed chapter ID
export function markChapterCompleted(chapterId: string): string[] {
  try {
    const current = getCompletedChapterIds();
    if (!current.includes(chapterId)) {
      const updated = [...current, chapterId];
      localStorage.setItem(STORAGE_KEY_COMPLETED_CHAPTERS, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (e) {
    return [];
  }
}

// Get test history
export function getTestHistory(): StoredTestSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEST_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Record a completed test and update completed chapters
export function recordCompletedTest(result: TestResult, chapterId?: string): OverallProgressStats {
  try {
    // 1. Add to test history
    const history = getTestHistory();
    const newSummary: StoredTestSummary = {
      id: result.id,
      title: result.examTitle,
      timestamp: result.timestamp,
      score: result.score,
      maxScore: result.maxScore,
      accuracy: result.accuracy,
      totalQuestions: result.totalQuestions,
      correct: result.correct,
      incorrect: result.incorrect,
      chapterId: chapterId,
    };

    // Keep last 50 tests
    const updatedHistory = [newSummary, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_TEST_HISTORY, JSON.stringify(updatedHistory));

    // 2. Mark chapter(s) as completed
    const currentCompleted = new Set(getCompletedChapterIds());

    if (chapterId) {
      currentCompleted.add(chapterId);
    }

    // Also detect any chapter where user answered questions in this test
    const chapterAttempts: Record<string, number> = {};
    result.questions.forEach(q => {
      if (q.chapterId) {
        chapterAttempts[q.chapterId] = (chapterAttempts[q.chapterId] || 0) + 1;
      }
    });

    Object.entries(chapterAttempts).forEach(([chId, count]) => {
      // If user attempted 10+ questions of this chapter, mark as completed
      if (count >= 10 || count >= result.totalQuestions * 0.5) {
        currentCompleted.add(chId);
      }
    });

    const updatedChaptersArray = Array.from(currentCompleted);
    localStorage.setItem(STORAGE_KEY_COMPLETED_CHAPTERS, JSON.stringify(updatedChaptersArray));
  } catch (e) {
    console.error('Error recording completed test', e);
  }

  return getChapterProgressStats();
}

// Calculate comprehensive progress stats
export function getChapterProgressStats(): OverallProgressStats {
  const completedIds = getCompletedChapterIds();
  const completedSet = new Set(completedIds);
  const history = getTestHistory();

  const totalChapters = ALL_CHAPTERS.length; // 78
  const completedCount = completedSet.size;
  const percentage = totalChapters > 0 ? Math.min(100, Math.round((completedCount / totalChapters) * 100)) : 0;

  // Subject breakdown
  const subjectsConfig: Record<SubjectType, { labelEn: string; labelHi: string; color: string }> = {
    physics: { labelEn: 'Physics', labelHi: 'भौतिक विज्ञान', color: 'emerald' },
    chemistry: { labelEn: 'Chemistry', labelHi: 'रसायन विज्ञान', color: 'cyan' },
    biology: { labelEn: 'Biology', labelHi: 'जीव विज्ञान', color: 'teal' },
    nursing_aptitude: { labelEn: 'Nursing Aptitude', labelHi: 'नर्सिंग अभिक्षमता', color: 'amber' },
  };

  const subjectStats: Record<SubjectType, SubjectProgress> = {
    physics: { subject: 'physics', ...subjectsConfig.physics, completed: 0, total: 0, percentage: 0 },
    chemistry: { subject: 'chemistry', ...subjectsConfig.chemistry, completed: 0, total: 0, percentage: 0 },
    biology: { subject: 'biology', ...subjectsConfig.biology, completed: 0, total: 0, percentage: 0 },
    nursing_aptitude: { subject: 'nursing_aptitude', ...subjectsConfig.nursing_aptitude, completed: 0, total: 0, percentage: 0 },
  };

  ALL_CHAPTERS.forEach(ch => {
    const s = subjectStats[ch.subject];
    if (s) {
      s.total += 1;
      if (completedSet.has(ch.id)) {
        s.completed += 1;
      }
    }
  });

  // Calculate percentages
  Object.values(subjectStats).forEach(s => {
    s.percentage = s.total > 0 ? Math.min(100, Math.round((s.completed / s.total) * 100)) : 0;
  });

  const avgAccuracy = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length) 
    : 0;

  return {
    totalChapters,
    completedCount,
    percentage,
    testsTaken: history.length,
    averageAccuracy: avgAccuracy,
    subjects: subjectStats,
    recentTests: history.slice(0, 10),
    completedChapterIds: completedIds,
  };
}
