import React, { useState, useEffect, useRef } from 'react';
import { Question, ExamConfig, UserAnswerRecord, QuestionStatus, TestResult } from '../types/quiz';
import { 
  Clock, AlertTriangle, CheckCircle, HelpCircle, 
  ChevronLeft, ChevronRight, Bookmark, RotateCcw, 
  Menu, X, Check, Globe, Eye, FileSpreadsheet,
  Sun, Moon
} from 'lucide-react';
import { Theme } from '../utils/useTheme';

interface CbtExamPortalProps {
  config: ExamConfig;
  questions: Question[];
  onSubmitExam: (result: TestResult) => void;
  onExitExam: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

export const CbtExamPortal: React.FC<CbtExamPortalProps> = ({
  config,
  questions,
  onSubmitExam,
  onExitExam,
  theme,
  onToggleTheme,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [language, setLanguage] = useState<'hi' | 'en' | 'bilingual'>('bilingual');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [isOmrMode, setIsOmrMode] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [paletteDifficultyFilter, setPaletteDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Time state (seconds)
  const totalSeconds = config.durationMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  // User answers map
  const [answers, setAnswers] = useState<Record<string, UserAnswerRecord>>(() => {
    const initial: Record<string, UserAnswerRecord> = {};
    questions.forEach((q, idx) => {
      initial[q.id] = {
        questionId: q.id,
        selectedOption: null,
        timeSpentSeconds: 0,
        status: idx === 0 ? 'not_answered' : 'not_visited',
        isBookmarked: false,
      };
    });
    return initial;
  });

  // Track time spent per question
  const currentQuestionStartTime = useRef<number>(Date.now());

  // Countdown timer effect
  useEffect(() => {
    if (remainingSeconds <= 0) {
      setIsTimeUp(true);
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Update question time on index change
  useEffect(() => {
    currentQuestionStartTime.current = Date.now();
    // mark as not_answered if it was not_visited
    const currQ = questions[currentIndex];
    if (currQ) {
      setAnswers(prev => {
        const record = prev[currQ.id];
        if (record && record.status === 'not_visited') {
          return {
            ...prev,
            [currQ.id]: {
              ...record,
              status: 'not_answered',
            },
          };
        }
        return prev;
      });
    }
  }, [currentIndex, questions]);

  const currentQuestion = questions[currentIndex];
  const currentRecord = answers[currentQuestion?.id];

  // Helper to accumulate time on current question
  const commitCurrentQuestionTime = () => {
    const elapsed = Math.round((Date.now() - currentQuestionStartTime.current) / 1000);
    if (currentQuestion && elapsed > 0) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          timeSpentSeconds: (prev[currentQuestion.id]?.timeSpentSeconds || 0) + elapsed,
        },
      }));
    }
  };

  // Option selection
  const handleSelectOption = (optIndex: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => {
      const existing = prev[currentQuestion.id];
      const newStatus: QuestionStatus = existing.status === 'marked_for_review' || existing.status === 'answered_and_marked'
        ? 'answered_and_marked'
        : 'answered';

      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          selectedOption: optIndex,
          status: newStatus,
        },
      };
    });
  };

  // Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers(prev => {
      const existing = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          selectedOption: null,
          status: 'not_answered',
        },
      };
    });
  };

  // Mark for Review & Next
  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    commitCurrentQuestionTime();
    setAnswers(prev => {
      const existing = prev[currentQuestion.id];
      const hasAnswer = existing.selectedOption !== null;
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          status: hasAnswer ? 'answered_and_marked' : 'marked_for_review',
        },
      };
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Save & Next
  const handleSaveAndNext = () => {
    commitCurrentQuestionTime();
    if (!currentQuestion) return;

    setAnswers(prev => {
      const existing = prev[currentQuestion.id];
      const hasAnswer = existing.selectedOption !== null;
      return {
        ...prev,
        [currentQuestion.id]: {
          ...existing,
          status: hasAnswer ? 'answered' : 'not_answered',
        },
      };
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Previous
  const handlePrevious = () => {
    commitCurrentQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (idx: number) => {
    commitCurrentQuestionTime();
    setCurrentIndex(idx);
    setIsPaletteOpen(false);
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        isBookmarked: !prev[currentQuestion.id]?.isBookmarked,
      },
    }));
  };

  // Stats for Palette and Submit confirmation
  const stats = {
    answered: Object.values(answers).filter(a => a.status === 'answered' || a.status === 'answered_and_marked').length,
    notAnswered: Object.values(answers).filter(a => a.status === 'not_answered').length,
    markedForReview: Object.values(answers).filter(a => a.status === 'marked_for_review').length,
    answeredAndMarked: Object.values(answers).filter(a => a.status === 'answered_and_marked').length,
    notVisited: Object.values(answers).filter(a => a.status === 'not_visited').length,
  };

  // Final submit handler
  const handleFinalSubmit = () => {
    commitCurrentQuestionTime();

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let score = 0;

    const subjectBreakdown: Record<string, { total: number; correct: number; incorrect: number; score: number }> = {
      physics: { total: 0, correct: 0, incorrect: 0, score: 0 },
      chemistry: { total: 0, correct: 0, incorrect: 0, score: 0 },
      biology: { total: 0, correct: 0, incorrect: 0, score: 0 },
      nursing_aptitude: { total: 0, correct: 0, incorrect: 0, score: 0 },
    };

    questions.forEach(q => {
      const ans = answers[q.id];
      const subj = q.subject || 'physics';
      if (!subjectBreakdown[subj]) {
        subjectBreakdown[subj] = { total: 0, correct: 0, incorrect: 0, score: 0 };
      }
      subjectBreakdown[subj].total += 1;

      if (ans && ans.selectedOption !== null) {
        if (ans.selectedOption === q.correctAnswer) {
          correct += 1;
          score += config.positiveMarks;
          subjectBreakdown[subj].correct += 1;
          subjectBreakdown[subj].score += config.positiveMarks;
        } else {
          incorrect += 1;
          score -= config.negativeMarks;
          subjectBreakdown[subj].incorrect += 1;
          subjectBreakdown[subj].score -= config.negativeMarks;
        }
      } else {
        unattempted += 1;
      }
    });

    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const maxScore = questions.length * config.positiveMarks;
    const timeSpentTotal = totalSeconds - remainingSeconds;

    const testResult: TestResult = {
      id: `res-${Date.now()}`,
      examTitle: config.title,
      timestamp: Date.now(),
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      unattempted,
      score: Math.max(0, Math.round(score * 100) / 100),
      maxScore,
      accuracy,
      timeSpentTotalSeconds: timeSpentTotal,
      subjectBreakdown: subjectBreakdown as any,
      answers,
      questions,
    };

    onSubmitExam(testResult);
  };

  // Format time remaining
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Exam Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Exam Title & Subject info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/30">
              CBT
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {config.title}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentQuestion?.subject.toUpperCase()} · प्रश्न {currentIndex + 1} / {questions.length}
              </p>
            </div>
          </div>

          {/* Controls: Language, OMR, Font, Timer, Submit */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Day / Night Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
                title={theme === 'dark' ? "डे मोड में बदलें (Day Mode)" : "नाइट मोड में बदलें (Night Mode)"}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}

            {/* Language toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setLanguage('bilingual')}
                className={`px-2 py-1 rounded transition-colors ${language === 'bilingual' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                द्विभाषी
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${language === 'hi' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${language === 'en' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                English
              </button>
            </div>

            {/* OMR mode toggle */}
            <button
              onClick={() => setIsOmrMode(!isOmrMode)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                isOmrMode ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-medium' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="ओएमआर शीट प्रारूप में उत्तर भरें"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>OMR Mode</span>
            </button>

            {/* Timer Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-semibold ${
              isLowTime ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            {/* Finish Test Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              परीक्षा समाप्त (Submit)
            </button>

            {/* Mobile Palette Drawer Toggle */}
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main CBT Workspace Layout */}
      <div className="max-w-7xl mx-auto w-full flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Question Screen & Navigation Controls (3 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-7 flex-1 flex flex-col justify-between shadow-xs transition-colors">
            <div>
              {/* Question Metadata Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    प्रश्न {currentIndex + 1}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{config.positiveMarks} अंक</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-500 dark:text-rose-400 font-medium">-{config.negativeMarks} अंक</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 dark:text-slate-400">{currentQuestion?.examTag}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    currentQuestion?.difficulty === 'easy'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : currentQuestion?.difficulty === 'medium'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  }`}>
                    {currentQuestion?.difficulty === 'easy' && '🟢 स्तर 1: सरल प्रश्न (Easy)'}
                    {currentQuestion?.difficulty === 'medium' && '🟡 स्तर 2: मध्यम प्रश्न (Medium)'}
                    {currentQuestion?.difficulty === 'hard' && '🟣 स्तर 3: कठिन व रैंक बूस्टर (Hard)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                      currentRecord?.isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">बुकमार्क</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3 mb-6">
                {(language === 'hi' || language === 'bilingual') && (
                  <div className={`font-medium text-slate-900 dark:text-slate-100 leading-relaxed ${fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                    {currentQuestion?.questionHi}
                  </div>
                )}
                {(language === 'en' || language === 'bilingual') && (
                  <div className={`font-normal text-slate-700 dark:text-slate-300 leading-relaxed ${
                    language === 'bilingual' ? 'text-sm pt-1 border-t border-slate-200 dark:border-slate-800/60' : (fontSize === 'large' ? 'text-lg' : 'text-base')
                  }`}>
                    {currentQuestion?.questionEn}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion?.optionsEn.map((optEn, optIdx) => {
                  const optHi = currentQuestion.optionsHi[optIdx];
                  const isSelected = currentRecord?.selectedOption === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`cursor-pointer rounded-xl border p-3.5 sm:p-4 transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {/* Option Bubble / Marker */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>

                      {/* Option Text */}
                      <div className="flex-1 text-sm space-y-1">
                        {(language === 'hi' || language === 'bilingual') && (
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {optHi}
                          </div>
                        )}
                        {(language === 'en' || language === 'bilingual') && (
                          <div className={`text-slate-600 dark:text-slate-300 ${language === 'bilingual' ? 'text-xs text-slate-500 dark:text-slate-400' : ''}`}>
                            {optEn}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions inside Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearResponse}
                  disabled={currentRecord?.selectedOption === null}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>उत्तर हटाएं (Clear)</span>
                </button>
                <button
                  onClick={handleMarkForReview}
                  className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg transition-colors"
                >
                  रिव्यू के लिए मार्क करें (Review & Next)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>पिछला</span>
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>सहेजें और आगे बढ़ें (Save & Next)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & OMR Drawer (Desktop visible, mobile modal) */}
        <div className={`
          lg:col-span-1 fixed lg:static inset-y-0 right-0 z-40 w-80 lg:w-auto bg-white dark:bg-slate-900 lg:bg-transparent border-l lg:border-l-0 border-slate-200 dark:border-slate-800 p-4 lg:p-0 flex flex-col space-y-4 transition-transform
          ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Palette Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col h-full space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                प्रश्न पैलेट (Question Palette)
              </h3>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {stats.answered}
                </span>
                <span>उत्तर दिया</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {stats.notAnswered}
                </span>
                <span>उत्तर नहीं दिया</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-purple-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {stats.markedForReview}
                </span>
                <span>रिव्यू चिह्नित</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[9px] flex items-center justify-center font-bold border border-slate-300 dark:border-slate-600">
                  {stats.notVisited}
                </span>
                <span>देखा नहीं</span>
              </div>
            </div>

            {/* Difficulty Filter inside Palette */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
              <button
                onClick={() => setPaletteDifficultyFilter('all')}
                className={`flex-1 py-1 rounded transition-colors ${paletteDifficultyFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                सभी
              </button>
              <button
                onClick={() => setPaletteDifficultyFilter('easy')}
                className={`flex-1 py-1 rounded transition-colors ${paletteDifficultyFilter === 'easy' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
              >
                सरल
              </button>
              <button
                onClick={() => setPaletteDifficultyFilter('medium')}
                className={`flex-1 py-1 rounded transition-colors ${paletteDifficultyFilter === 'medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'}`}
              >
                मध्यम
              </button>
              <button
                onClick={() => setPaletteDifficultyFilter('hard')}
                className={`flex-1 py-1 rounded transition-colors ${paletteDifficultyFilter === 'hard' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold border border-purple-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'}`}
              >
                कठिन
              </button>
            </div>

            {/* Palette Grid */}
            <div className="flex-1 overflow-y-auto max-h-[380px] pr-1">
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => {
                  if (paletteDifficultyFilter !== 'all' && q.difficulty !== paletteDifficultyFilter) {
                    return null;
                  }
                  const rec = answers[q.id];
                  let btnColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'; // not visited

                  if (rec?.status === 'answered') {
                    btnColor = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                  } else if (rec?.status === 'not_answered') {
                    btnColor = 'bg-rose-600 text-white border-rose-500';
                  } else if (rec?.status === 'marked_for_review') {
                    btnColor = 'bg-purple-600 text-white border-purple-500';
                  } else if (rec?.status === 'answered_and_marked') {
                    btnColor = 'bg-purple-600 text-white border-emerald-400 ring-2 ring-emerald-400';
                  }

                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-8 rounded text-xs font-mono border transition-all flex items-center justify-center relative ${btnColor} ${
                        isCurrent ? 'ring-2 ring-slate-900 dark:ring-white scale-105 z-10' : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {rec?.isBookmarked && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OMR mode quick widget if active */}
            {isOmrMode && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  प्रश्न {currentIndex + 1} OMR बबल भरें:
                </div>
                <div className="flex items-center justify-between gap-1 bg-slate-100 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  {['A', 'B', 'C', 'D'].map((bubble, bIdx) => (
                    <button
                      key={bubble}
                      onClick={() => handleSelectOption(bIdx)}
                      className={`w-7 h-7 rounded-full text-xs font-bold border transition-colors flex items-center justify-center ${
                        currentRecord?.selectedOption === bIdx
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-slate-900 dark:border-slate-100'
                          : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {bubble}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl transition-colors">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                क्या आप परीक्षा समाप्त करना चाहते हैं?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                सबमिट करने के उपरांत आपके उत्तरों का तुरंत विस्तृत विश्लेषण एवं स्कोरकार्ड तैयार किया जाएगा।
              </p>
            </div>

            {/* Summary statistics table */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>कुल प्रश्न:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>उत्तर दिए गए प्रश्न (Answered):</span>
                <span className="font-mono font-bold">{stats.answered}</span>
              </div>
              <div className="flex justify-between text-rose-500 dark:text-rose-400">
                <span>उत्तर नहीं दिए गए (Unanswered):</span>
                <span className="font-mono font-bold">{stats.notAnswered}</span>
              </div>
              <div className="flex justify-between text-purple-600 dark:text-purple-400">
                <span>रिव्यू के लिए रखे गए (Marked for Review):</span>
                <span className="font-mono font-bold">{stats.markedForReview}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>शेष समय:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatTime(remainingSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                परीक्षा जारी रखें (Resume)
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors shadow-xs"
              >
                हाँ, फाइनल सबमिट करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
