import React, { useState } from 'react';
import { TestResult, Question } from '../types/quiz';
import { 
  Award, CheckCircle, XCircle, Clock, Zap, 
  RotateCcw, ArrowLeft, Bookmark, MessageSquare, 
  Sparkles, Filter, ChevronDown, ChevronUp, Share2 
} from 'lucide-react';

interface TestResultAnalyticsProps {
  result: TestResult;
  onRetestMistakes: (wrongQuestions: Question[]) => void;
  onBackToHome: () => void;
  onOpenDoubtModal: (q: Question) => void;
  onToggleBookmark: (q: Question) => void;
  bookmarkedIds: string[];
  onOpenShareModal?: () => void;
}

export const TestResultAnalytics: React.FC<TestResultAnalyticsProps> = ({
  result,
  onRetestMistakes,
  onBackToHome,
  onOpenDoubtModal,
  onToggleBookmark,
  bookmarkedIds,
  onOpenShareModal,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct' | 'unattempted' | 'bookmarked' | 'easy' | 'medium' | 'hard'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (qId: string) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Difficulty metrics
  const difficultyStats = {
    easy: { total: 0, correct: 0, incorrect: 0 },
    medium: { total: 0, correct: 0, incorrect: 0 },
    hard: { total: 0, correct: 0, incorrect: 0 },
  };

  result.questions.forEach(q => {
    const d = (q.difficulty || 'medium') as 'easy' | 'medium' | 'hard';
    if (!difficultyStats[d]) difficultyStats[d] = { total: 0, correct: 0, incorrect: 0 };
    difficultyStats[d].total += 1;
    const ans = result.answers[q.id];
    if (ans && ans.selectedOption !== null) {
      if (ans.selectedOption === q.correctAnswer) {
        difficultyStats[d].correct += 1;
      } else {
        difficultyStats[d].incorrect += 1;
      }
    }
  });

  // Extract wrong questions
  const wrongQuestions = result.questions.filter(q => {
    const ans = result.answers[q.id];
    return ans && ans.selectedOption !== null && ans.selectedOption !== q.correctAnswer;
  });

  // Filter questions for review
  const filteredQuestions = result.questions.filter(q => {
    const ans = result.answers[q.id];
    const isAttempted = ans && ans.selectedOption !== null;
    const isCorrect = isAttempted && ans.selectedOption === q.correctAnswer;
    const isIncorrect = isAttempted && ans.selectedOption !== q.correctAnswer;
    const isUnattempted = !isAttempted;
    const isBookmarked = bookmarkedIds.includes(q.id) || (ans && ans.isBookmarked);

    if (filterMode === 'incorrect') return isIncorrect;
    if (filterMode === 'correct') return isCorrect;
    if (filterMode === 'unattempted') return isUnattempted;
    if (filterMode === 'bookmarked') return isBookmarked;
    if (filterMode === 'easy') return q.difficulty === 'easy';
    if (filterMode === 'medium') return q.difficulty === 'medium';
    if (filterMode === 'hard') return q.difficulty === 'hard';
    return true;
  });

  const minutesSpent = Math.floor(result.timeSpentTotalSeconds / 60);
  const secondsSpent = result.timeSpentTotalSeconds % 60;
  const avgTimePerQuestion = result.attempted > 0 ? Math.round(result.timeSpentTotalSeconds / result.attempted) : 0;

  // Estimated percentile based on accuracy and score
  const scorePercentage = result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0;
  const estimatedPercentile = Math.min(99.9, Math.max(10, Math.round((scorePercentage * 0.85 + result.accuracy * 0.15) * 10) / 10));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 transition-colors">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ पर लौटें (Home)</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>स्कोर शेयर करें</span>
            </button>
          )}

          {wrongQuestions.length > 0 && (
            <button
              onClick={() => onRetestMistakes(wrongQuestions)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>गलत प्रश्नों का दोबारा टेस्ट ({wrongQuestions.length} Qs)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>परीक्षा परिणाम एवं स्कोरकार्ड</span>
              <span aria-hidden="true">·</span>
              <span>{new Date(result.timestamp).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {result.examTitle}
            </h1>
          </div>

          <div className="flex items-baseline gap-2 bg-slate-100 dark:bg-slate-950 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {result.score}
            </span>
            <span className="text-slate-500 font-mono text-sm">/ {result.maxScore} Marks</span>
          </div>
        </div>

        {/* 4 Primary KPI metric tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>सटीकता (Accuracy)</span>
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
              {result.accuracy}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {result.correct} सही / {result.attempted} हल किए
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>गलत उत्तर (Incorrect)</span>
              <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-500 dark:text-rose-400 mt-2 tabular-nums">
              {result.incorrect}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              नेगेटिव मार्किंग में कटे अंक
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>कुल समय (Time Spent)</span>
              <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
              {minutesSpent}m {secondsSpent}s
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              औसत {avgTimePerQuestion}s प्रति प्रश्न
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>अनुमानित पर्सेंटाइल</span>
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-500 dark:text-amber-400 mt-2 tabular-nums">
              {estimatedPercentile}%ile
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              All India Merit Simulator
            </div>
          </div>
        </div>

        {/* Subject Breakdown table */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            विषयवार प्रदर्शन (Subject-wise Performance)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(result.subjectBreakdown).map(([subj, data]) => {
              if (data.total === 0) return null;
              const subjAccuracy = (data.correct + data.incorrect) > 0
                ? Math.round((data.correct / (data.correct + data.incorrect)) * 100)
                : 0;

              return (
                <div key={subj} className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white uppercase">{subj.replace('_', ' ')}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{data.score} Marks</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>कुल प्रश्न: {data.total}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">सही: {data.correct}</span>
                    <span className="text-rose-500 dark:text-rose-400">गलत: {data.incorrect}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${subjAccuracy}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Breakdown (Easy -> Medium -> Hard) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            कठिनाई स्तर अनुसार विश्लेषण (Difficulty Analysis: Easy ➔ Medium ➔ Hard)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Easy */}
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">🟢 सरल प्रश्न (Easy)</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {difficultyStats.easy.correct} / {difficultyStats.easy.total}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>सटीकता (Accuracy):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {difficultyStats.easy.total > 0 ? Math.round((difficultyStats.easy.correct / difficultyStats.easy.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${difficultyStats.easy.total > 0 ? (difficultyStats.easy.correct / difficultyStats.easy.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Medium */}
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400">🟡 मध्यम प्रश्न (Medium)</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {difficultyStats.medium.correct} / {difficultyStats.medium.total}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>सटीकता (Accuracy):</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                  {difficultyStats.medium.total > 0 ? Math.round((difficultyStats.medium.correct / difficultyStats.medium.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${difficultyStats.medium.total > 0 ? (difficultyStats.medium.correct / difficultyStats.medium.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Hard */}
            <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-600 dark:text-purple-400">🟣 कठिन / रैंक बूस्टर (Hard)</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {difficultyStats.hard.correct} / {difficultyStats.hard.total}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>सटीकता (Accuracy):</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  {difficultyStats.hard.total > 0 ? Math.round((difficultyStats.hard.correct / difficultyStats.hard.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${difficultyStats.hard.total > 0 ? (difficultyStats.hard.correct / difficultyStats.hard.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question by Question Review Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              प्रश्नों का संपूर्ण हल एवं विश्लेषण (Question Solutions & Explanations)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              प्रत्येक प्रश्न का NCERT आधारित विस्तृत हल, संकल्पना और शॉर्ट ट्रिक्स देखें।
            </p>
          </div>

          {/* Review Filter Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs overflow-x-auto scrollbar-none shadow-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              सभी ({result.questions.length})
            </button>
            <button
              onClick={() => setFilterMode('easy')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'easy' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-500/40' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
            >
              🟢 सरल ({difficultyStats.easy.total})
            </button>
            <button
              onClick={() => setFilterMode('medium')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium border border-amber-500/40' : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'}`}
            >
              🟡 मध्यम ({difficultyStats.medium.total})
            </button>
            <button
              onClick={() => setFilterMode('hard')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'hard' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-medium border border-purple-500/40' : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'}`}
            >
              🟣 कठिन ({difficultyStats.hard.total})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'incorrect' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              गलत ({result.incorrect})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'correct' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              सही ({result.correct})
            </button>
            <button
              onClick={() => setFilterMode('unattempted')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${filterMode === 'unattempted' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              छूटे ({result.unattempted})
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const ans = result.answers[q.id];
            const isAttempted = ans && ans.selectedOption !== null;
            const isCorrect = isAttempted && ans.selectedOption === q.correctAnswer;
            const isIncorrect = isAttempted && ans.selectedOption !== q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-5 transition-all shadow-xs ${
                  isCorrect
                    ? 'bg-white dark:bg-slate-900/90 border-emerald-500/40'
                    : isIncorrect
                    ? 'bg-white dark:bg-slate-900/90 border-rose-500/40'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Question status header */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">Q{idx + 1}</span>
                    <span className="text-slate-500 dark:text-slate-400">{q.examTag}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : q.difficulty === 'medium'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    }`}>
                      {q.difficulty === 'easy' && '🟢 सरल (Easy)'}
                      {q.difficulty === 'medium' && '🟡 मध्यम (Medium)'}
                      {q.difficulty === 'hard' && '🟣 कठिन (Hard)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCorrect && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>सही उत्तर</span>
                      </span>
                    )}
                    {isIncorrect && (
                      <span className="text-rose-500 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>गलत उत्तर</span>
                      </span>
                    )}
                    {!isAttempted && (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        अनुत्तरित (Skipped)
                      </span>
                    )}

                    <button
                      onClick={() => onToggleBookmark(q)}
                      className="p-1 text-slate-400 hover:text-amber-400"
                      title="बुकमार्क करें"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.includes(q.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1 mb-4">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm leading-relaxed">
                    {q.questionHi}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {q.questionEn}
                  </div>
                </div>

                {/* 4 Options with color highlighting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {q.optionsHi.map((optHi, optIdx) => {
                    const isRightAnswer = optIdx === q.correctAnswer;
                    const isUserPick = ans && ans.selectedOption === optIdx;

                    let optStyle = 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    if (isRightAnswer) {
                      optStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-medium';
                    } else if (isUserPick && !isRightAnswer) {
                      optStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/60 text-rose-800 dark:text-rose-200 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${optStyle}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isRightAnswer
                            ? 'bg-emerald-500 text-slate-950'
                            : isUserPick
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <div className="truncate">
                          <span>{optHi}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Solution Box */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>विस्तृत समाधान (Detailed NCERT Solution):</span>
                    {q.formulaOrFact && (
                      <span className="text-[11px] font-mono text-amber-600 dark:text-amber-300">
                        {q.formulaOrFact}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {q.explanationHi}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    {q.explanationEn}
                  </p>

                  {/* Ask Doubt Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onOpenDoubtModal(q)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>इस प्रश्न में डाउट पूछें (Concept Resolution)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
