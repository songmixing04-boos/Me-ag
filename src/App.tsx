import React, { useState, useEffect } from 'react';
import { Chapter, ExamConfig, Question, TestResult } from './types/quiz';
import { ALL_CHAPTERS, EXAM_PRESETS, MAJOR_UNITS } from './data/syllabus';
import { 
  getQuestionsForChapter, 
  getQuestionsForExam, 
  getBalancedQuestionsForSubject,
  getMistakeQuestions, 
  recordMistakes, 
  removeMistake, 
  getBookmarkedQuestions, 
  toggleBookmarkQuestion,
  saveQuestionsToStore
} from './data/questionBankEngine';
import { generateDynamicChapterQuestions } from './services/questionService';
import { useTheme } from './utils/useTheme';
import { getChapterProgressStats, recordCompletedTest, OverallProgressStats } from './data/testHistoryEngine';
import { Header } from './components/Header';
import { ChapterGrid } from './components/ChapterGrid';
import { ExamPresetCards } from './components/ExamPresetCards';
import { CbtExamPortal } from './components/CbtExamPortal';
import { TestResultAnalytics } from './components/TestResultAnalytics';
import { MistakeVault } from './components/MistakeVault';
import { RevisionNotes } from './components/RevisionNotes';
import { CustomTestModal } from './components/CustomTestModal';
import { DoubtModal } from './components/DoubtModal';
import { ProgressTrackerModal } from './components/ProgressTrackerModal';
import { ShareAppModal } from './components/ShareAppModal';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'chapters' | 'mocks' | 'mistakes' | 'notes'>('chapters');
  const [currentView, setCurrentView] = useState<'main' | 'cbt_exam' | 'test_result'>('main');

  // Exam state
  const [activeConfig, setActiveConfig] = useState<ExamConfig | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeResult, setActiveResult] = useState<TestResult | null>(null);

  // Mistakes & Bookmarks state
  const [mistakes, setMistakes] = useState<Question[]>(() => getMistakeQuestions());
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => 
    getBookmarkedQuestions().map(q => q.id)
  );

  // Modals state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState<Question | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Chapter completion & Test history progress stats
  const [progressStats, setProgressStats] = useState<OverallProgressStats>(() => getChapterProgressStats());

  // Reload mistakes
  const refreshMistakes = () => {
    setMistakes(getMistakeQuestions());
  };

  // Reset progress tracker
  const handleResetProgress = () => {
    localStorage.removeItem('lallantop_completed_chapters_v1');
    setProgressStats(getChapterProgressStats());
  };

  // Select chapter directly from progress modal
  const handleSelectChapterFromProgress = (chapterId: string) => {
    const ch = ALL_CHAPTERS.find(c => c.id === chapterId);
    if (ch) {
      handleStartChapterTest(ch, 20);
    }
  };

  // Start Chapter Test (20Q, 50Q, 100Q)
  const handleStartChapterTest = (chapter: Chapter, count: number) => {
    const config: ExamConfig = {
      id: `ch-test-${Date.now()}`,
      title: `${chapter.nameHi} (${chapter.nameEn})`,
      subtitle: `${chapter.subject.toUpperCase()} · ${count} प्रश्न · ${chapter.ncertRef}`,
      examType: 'all',
      totalQuestions: count,
      durationMinutes: count <= 20 ? 20 : count <= 50 ? 45 : 90,
      positiveMarks: 4,
      negativeMarks: 1,
      subjects: [chapter.subject],
      mode: 'chapter',
      chapterId: chapter.id,
    };

    const qList = getQuestionsForChapter(chapter.id, count);
    setActiveConfig(config);
    setActiveQuestions(qList);
    setCurrentView('cbt_exam');
  };

  // Start Preset Full 100Q Mock Test
  const handleStartPresetTest = (presetId: string) => {
    const preset = EXAM_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const config: ExamConfig = {
      id: `preset-${Date.now()}`,
      title: preset.name,
      subtitle: `${preset.nameHi} · 100 प्रश्न · ${preset.durationMinutes} मिनट`,
      examType: preset.examType,
      totalQuestions: preset.totalQuestions,
      durationMinutes: preset.durationMinutes,
      positiveMarks: preset.positiveMarks,
      negativeMarks: preset.negativeMarks,
      subjects: ['physics', 'chemistry', 'biology', 'nursing_aptitude'],
      mode: 'full_mock',
    };

    const qList = getQuestionsForExam(preset.examType, preset.totalQuestions);
    setActiveConfig(config);
    setActiveQuestions(qList);
    setCurrentView('cbt_exam');
  };

  // Start Major Unit Test
  const handleStartUnitTest = (unitId: string) => {
    const unit = MAJOR_UNITS.find(u => u.id === unitId);
    if (!unit) return;

    const config: ExamConfig = {
      id: `unit-${Date.now()}`,
      title: `${unit.titleHi} (${unit.title})`,
      subtitle: `Combined Unit Test · 50 प्रश्न · 45 मिनट`,
      examType: 'all',
      totalQuestions: 50,
      durationMinutes: 45,
      positiveMarks: 4,
      negativeMarks: 1,
      subjects: [unit.subject as any],
      mode: 'unit',
    };

    // Gather questions from the unit's chapters
    const pool: Question[] = [];
    const perCh = Math.ceil(50 / unit.chapters.length);
    unit.chapters.forEach(chId => {
      pool.push(...getQuestionsForChapter(chId, perCh));
    });

    setActiveConfig(config);
    setActiveQuestions(pool.slice(0, 50));
    setCurrentView('cbt_exam');
  };

  // Start Custom Test with optional AI generation
  const handleStartCustomTest = async (config: ExamConfig, useDynamic: boolean) => {
    setIsCustomModalOpen(false);

    if (useDynamic && config.chapterId) {
      setIsLoadingTest(true);
      const ch = ALL_CHAPTERS.find(c => c.id === config.chapterId);
      const dynamicGenerated = await generateDynamicChapterQuestions({
        subject: config.subjects[0],
        chapterName: ch?.nameEn || 'General Syllabus',
        count: Math.min(config.totalQuestions, 20),
        difficulty: 'medium',
      });

      setIsLoadingTest(false);

      if (dynamicGenerated && dynamicGenerated.length > 0) {
        saveQuestionsToStore(dynamicGenerated);
        const fallback = getQuestionsForChapter(config.chapterId, config.totalQuestions);
        const merged = [...dynamicGenerated, ...fallback].slice(0, config.totalQuestions);
        setActiveConfig(config);
        setActiveQuestions(merged);
        setCurrentView('cbt_exam');
        return;
      }
    }

    // Default fast offline question bank
    let qList: Question[] = [];
    if (config.chapterId) {
      qList = getQuestionsForChapter(config.chapterId, config.totalQuestions);
    } else {
      qList = getBalancedQuestionsForSubject(config.subjects[0], config.totalQuestions);
    }

    setActiveConfig(config);
    setActiveQuestions(qList);
    setCurrentView('cbt_exam');
  };

  // Start Retest for Mistakes
  const handleStartMistakeTest = (wrongQuestions: Question[]) => {
    const config: ExamConfig = {
      id: `mistake-retest-${Date.now()}`,
      title: 'गलतियों की डायरी: री-टेस्ट (Mistake Mastery Test)',
      subtitle: `${wrongQuestions.length} कमजोर प्रश्नों का सुधार अभ्यास`,
      examType: 'all',
      totalQuestions: wrongQuestions.length,
      durationMinutes: Math.max(10, Math.ceil(wrongQuestions.length * 1.5)),
      positiveMarks: 4,
      negativeMarks: 0,
      subjects: ['physics', 'chemistry', 'biology', 'nursing_aptitude'],
      mode: 'mistake_revision',
    };

    setActiveConfig(config);
    setActiveQuestions(wrongQuestions);
    setCurrentView('cbt_exam');
  };

  // Remove individual mistake
  const handleRemoveMistake = (qId: string) => {
    removeMistake(qId);
    refreshMistakes();
  };

  // Clear all mistakes
  const handleClearAllMistakes = () => {
    localStorage.removeItem('lallantop_mistakes_v1');
    refreshMistakes();
  };

  // Toggle bookmark
  const handleToggleBookmark = (q: Question) => {
    const isNowBookmarked = toggleBookmarkQuestion(q);
    setBookmarkedIds(prev => 
      isNowBookmarked ? [...prev, q.id] : prev.filter(id => id !== q.id)
    );
  };

  // On CBT Submit Exam
  const handleSubmitExam = (result: TestResult) => {
    // Collect wrong question IDs
    const wrongIds = Object.values(result.answers)
      .filter(a => a.selectedOption !== null)
      .map(a => {
        const q = result.questions.find(item => item.id === a.questionId);
        return (q && a.selectedOption !== q.correctAnswer) ? q.id : null;
      })
      .filter((id): id is string => id !== null);

    if (wrongIds.length > 0) {
      recordMistakes(result.questions, wrongIds);
      refreshMistakes();
    }

    // USER REQUIREMENT: Track test history and chapter completion
    const updatedStats = recordCompletedTest(result, activeConfig?.chapterId);
    setProgressStats(updatedStats);

    setActiveResult(result);
    setCurrentView('test_result');
  };

  // Exit back to home
  const handleExitExam = () => {
    setCurrentView('main');
    setActiveConfig(null);
    setActiveQuestions([]);
    setActiveResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-200">
      {/* Show Header only in normal browsing mode, not inside active CBT exam */}
      {currentView !== 'cbt_exam' && (
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setCurrentView('main');
          }}
          onOpenCustomTest={() => setIsCustomModalOpen(true)}
          mistakeCount={mistakes.length}
          theme={theme}
          onToggleTheme={toggleTheme}
          progressStats={progressStats}
          onOpenProgressModal={() => setIsProgressModalOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1">
        {currentView === 'cbt_exam' && activeConfig && (
          <CbtExamPortal
            config={activeConfig}
            questions={activeQuestions}
            onSubmitExam={handleSubmitExam}
            onExitExam={handleExitExam}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentView === 'test_result' && activeResult && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <TestResultAnalytics
              result={activeResult}
              onRetestMistakes={handleStartMistakeTest}
              onBackToHome={handleExitExam}
              onOpenDoubtModal={(q) => setDoubtQuestion(q)}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedIds}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'main' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {activeTab === 'chapters' && (
              <ChapterGrid
                onStartChapterTest={handleStartChapterTest}
                onViewChapterNotes={(chapter) => {
                  setActiveTab('notes');
                }}
              />
            )}

            {activeTab === 'mocks' && (
              <ExamPresetCards
                onStartPresetTest={handleStartPresetTest}
                onStartUnitTest={handleStartUnitTest}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            )}

            {activeTab === 'mistakes' && (
              <MistakeVault
                mistakes={mistakes}
                onStartMistakeTest={handleStartMistakeTest}
                onRemoveMistake={handleRemoveMistake}
                onClearAllMistakes={handleClearAllMistakes}
              />
            )}

            {activeTab === 'notes' && (
              <RevisionNotes />
            )}
          </div>
        )}
      </main>

      {/* Footer in browsing mode */}
      {currentView === 'main' && (
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">LallanTop Pariksha Test Series</span>
              <span aria-hidden="true">·</span>
              <span>AIIMS BSc Nursing · BCECE · UP CNET · NEET UG · Paramedical</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                पब्लिक लिंक शेयर करें
              </button>
              <span>NCERT आधारित 78 अध्याय</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <CustomTestModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onStartCustomTest={handleStartCustomTest}
      />

      <DoubtModal
        question={doubtQuestion}
        isOpen={doubtQuestion !== null}
        onClose={() => setDoubtQuestion(null)}
      />

      <ProgressTrackerModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        stats={progressStats}
        onSelectChapter={handleSelectChapterFromProgress}
        onResetProgress={handleResetProgress}
      />

      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Loading overlay if generating AI test */}
      {isLoadingTest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-xl">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">स्मार्ट NCERT इंजन द्वारा नए प्रश्न तैयार किए जा रहे हैं...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">NCERT Class 11 & 12 पाठ्यक्रम से ताज़ा द्विभाषी प्रश्न संकलित हो रहे हैं</p>
          </div>
        </div>
      )}
    </div>
  );
}
