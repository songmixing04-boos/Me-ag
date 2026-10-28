import React from 'react';
import { X, CheckCircle2, Award, Zap, BookOpen, ChevronRight, BarChart3, RotateCcw } from 'lucide-react';
import { OverallProgressStats } from '../data/testHistoryEngine';
import { ALL_CHAPTERS } from '../data/syllabus';

interface ProgressTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: OverallProgressStats;
  onSelectChapter: (chapterId: string) => void;
  onResetProgress: () => void;
}

export const ProgressTrackerModal: React.FC<ProgressTrackerModalProps> = ({
  isOpen,
  onClose,
  stats,
  onSelectChapter,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const completedSet = new Set(stats.completedChapterIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                पाठ्यक्रम प्रगति ट्रैकर (Syllabus Progress Tracker)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                आपके द्वारा पूर्ण किए गए NCERT अध्यायों एवं टेस्ट स्कोर का लाइव विश्लेषण
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Hero Card with Progress Meter */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-100/50 to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-500/20 p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {stats.percentage >= 80 ? '🏆 टॉपर स्तर (Exam Ready)' : stats.percentage >= 40 ? '⚡ सक्रिय अभ्यास (Fast Progress)' : '🌱 प्रारंभिक चरण (Getting Started)'}
                  </span>
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats.percentage}% पाठ्यक्रम पूर्ण
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  कुल <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.completedCount}</span> / {stats.totalChapters} NCERT अध्याय पूरे किए गए
                </p>
              </div>

              {/* Circular Gauge / Percentage badge */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-950 border-4 border-emerald-500/30 dark:border-emerald-500/40 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {stats.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">संपूर्ण लक्ष्य</span>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats.percentage, 3)}%` }}
              />
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">कुल टेस्ट हल किए:</span>
                <div className="font-bold font-mono text-slate-900 dark:text-white">{stats.testsTaken} Tests</div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">औसत सटीकता (Avg Acc):</span>
                <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.averageAccuracy}%</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 dark:text-slate-400">शेष अध्याय:</span>
                <div className="font-bold font-mono text-amber-600 dark:text-amber-400">{stats.totalChapters - stats.completedCount} Chapters</div>
              </div>
            </div>
          </div>

          {/* Subject-wise breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              विषयवार अध्याय प्रगति (Subject Progress Breakdown)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(stats.subjects).map((subj) => (
                <div 
                  key={subj.subject}
                  className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{subj.labelHi}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">({subj.labelEn})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {subj.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${subj.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{subj.completed} / {subj.total} अध्याय संपन्न</span>
                    <span>{subj.total - subj.completed} शेष</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Chapters Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                पूर्ण किए गए अध्याय ({stats.completedCount})
              </h4>
              {stats.completedCount > 0 && (
                <button
                  onClick={onResetProgress}
                  className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>प्रगति रीसेट करें</span>
                </button>
              )}
            </div>

            {stats.completedCount === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  अभी तक कोई अध्याय टेस्ट पूरा नहीं हुआ है
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  होम पेज पर किसी भी अध्याय के 20Q, 50Q या 100Q टेस्ट पर क्लिक करें। टेस्ट सबमिट करते ही यहाँ प्रगति जुड़ जाएगी!
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {ALL_CHAPTERS.filter(ch => completedSet.has(ch.id)).map(ch => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-white truncate">{ch.nameHi}</span>
                      <span className="text-[11px] text-slate-500 truncate">({ch.ncertRef})</span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectChapter(ch.id);
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-[11px] shrink-0 ml-2"
                    >
                      पुनः टेस्ट दें
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            लक्ष्य: 100% NCERT कवरेज (AIIMS / BCECE / NEET)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
