import React from 'react';
import { Question } from '../types/quiz';
import { RotateCcw, Trash2, CheckCircle, AlertOctagon, ArrowRight, Bookmark } from 'lucide-react';

interface MistakeVaultProps {
  mistakes: Question[];
  onStartMistakeTest: (questions: Question[]) => void;
  onRemoveMistake: (questionId: string) => void;
  onClearAllMistakes: () => void;
}

export const MistakeVault: React.FC<MistakeVaultProps> = ({
  mistakes,
  onStartMistakeTest,
  onRemoveMistake,
  onClearAllMistakes,
}) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-100 to-amber-500/5 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 transition-colors">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>Focused Weak Area Mastery</span>
            <span aria-hidden="true">·</span>
            <span>Zero Negative Marking Strategy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            गलतियों की डायरी (Mistake Vault)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            टॉपर्स का सबसे बड़ा राज: जो प्रश्न टेस्ट में गलत हुए, उन्हें दोबारा अभ्यास करके अपनी कमजोरी को मजबूती में बदलना। यहाँ आपके सभी गलत प्रश्न सुरक्षित हैं।
          </p>

          {mistakes.length > 0 && (
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onStartMistakeTest(mistakes)}
                className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>सभी {mistakes.length} गलत प्रश्नों का दोबारा टेस्ट दें</span>
              </button>
              <button
                onClick={onClearAllMistakes}
                className="py-2 px-3 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 border border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500 rounded-lg transition-colors flex items-center gap-1.5 bg-white dark:bg-transparent"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>डायरी खाली करें</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {mistakes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            आपकी गलतियों की डायरी अभी खाली है!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            जब आप कोई अध्याय टेस्ट या फुल 100Q मॉक टेस्ट देंगे, तो जो भी प्रश्न गलत होंगे, वे स्वतः यहाँ अभ्यास के लिए एकत्रित हो जाएंगे।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>कुल दर्ज गलत प्रश्न: <strong className="text-slate-900 dark:text-white font-mono">{mistakes.length}</strong></span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {mistakes.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">#{idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase text-slate-700 dark:text-slate-300 font-medium">{q.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.chapterNameHi}</span>
                  </div>
                  <button
                    onClick={() => onRemoveMistake(q.id)}
                    className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                    title="इस प्रश्न को डायरी से हटाएं (महारत हासिल कर ली)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {q.questionHi}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {q.questionEn}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.optionsHi.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                        oIdx === q.correctAnswer
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-medium'
                          : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    NCERT स्पष्टीकरण:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {q.explanationHi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
